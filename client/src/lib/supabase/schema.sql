-- =============================================================================
-- profiles — public-facing user record (nickname-only, no email surfacing)
-- =============================================================================
-- Run order:
--   1. This file (creates profiles + RLS + triggers)
--   2. posts.schema.sql (creates posts + RLS)
--   3. add_nickname.sql ONLY if you previously ran an older version that lacked
--      the nickname column (idempotent, safe to skip on a clean install)
--
-- After running, in the Supabase dashboard:
--   - Authentication → Providers: enable Google, Kakao
--   - Authentication → URL Configuration: set redirect URLs
--   - Kakao consent items (Kakao Developers): leave ONLY `profile_nickname`
--     enabled. Do NOT request email or phone scope.
-- =============================================================================


-- ---- 1. Table --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT         NOT NULL,
  -- email and full_name are kept as nullable legacy columns for migration
  -- safety. New writes from the app should leave them NULL.
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  provider    TEXT         NOT NULL DEFAULT 'email'
                           CHECK (provider IN ('email', 'google', 'kakao')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_nickname_length CHECK (
    char_length(nickname) BETWEEN 2 AND 32
  )
);

CREATE INDEX IF NOT EXISTS profiles_nickname_idx ON public.profiles(nickname);
CREATE INDEX IF NOT EXISTS profiles_provider_idx ON public.profiles(provider);

COMMENT ON TABLE public.profiles
  IS 'Public profile linked 1:1 to auth.users. Nickname is the only display field.';
COMMENT ON COLUMN public.profiles.nickname IS '2–32 char public display name.';
COMMENT ON COLUMN public.profiles.email
  IS 'DEPRECATED. Internal-only echo. Do not display in UI.';
COMMENT ON COLUMN public.profiles.full_name
  IS 'DEPRECATED. Use nickname instead.';


-- ---- 2. updated_at trigger --------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---- 3. Auto-create profile on signup --------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider  TEXT;
  v_nickname  TEXT;
  v_avatar    TEXT;
BEGIN
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

  -- Resolve a nickname. Order:
  --   1. raw_user_meta_data.nickname (Kakao OAuth + our explicit signup form)
  --   2. raw_user_meta_data.preferred_username
  --   3. raw_user_meta_data.name
  --   4. anon-prefix + first 8 of UUID (last-resort fallback)
  v_nickname := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'nickname'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_username'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    'user_' || substring(NEW.id::text from 1 for 8)
  );

  -- Clamp to 32 chars to satisfy the CHECK constraint.
  IF char_length(v_nickname) > 32 THEN
    v_nickname := substring(v_nickname from 1 for 32);
  END IF;

  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  INSERT INTO public.profiles (id, nickname, avatar_url, provider)
  VALUES (NEW.id, v_nickname, v_avatar, v_provider)
  ON CONFLICT (id) DO UPDATE SET
    nickname   = COALESCE(EXCLUDED.nickname, profiles.nickname),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    provider   = EXCLUDED.provider,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ---- 4. Row Level Security --------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own  ON public.profiles;
DROP POLICY IF EXISTS profiles_select_any  ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own  ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own  ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_own  ON public.profiles;

-- Read: any authenticated user can read public profile fields (needed so the
-- board list can render the author's nickname). RLS still hides legacy email
-- columns from the API contract because our types omit them.
CREATE POLICY profiles_select_any
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_delete_own
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);


-- ---- 5. Grants --------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
-- Note: no anon SELECT — anonymous visitors cannot enumerate users.


-- ---- 6. Verification --------------------------------------------------------

SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
  AND event_object_table IN ('profiles', 'users')
ORDER BY trigger_name;

SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
