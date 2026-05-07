-- ============================================================
-- SecureAuth - Supabase 데이터베이스 스키마
-- 
-- 실행 순서:
-- 1. Supabase 대시보드 → SQL Editor에서 아래 SQL을 순서대로 실행
-- 2. Authentication → Providers에서 Google, Kakao 활성화
-- 3. Authentication → URL Configuration에서 리다이렉트 URL 설정
-- ============================================================


-- ── 1. public.profiles 테이블 생성 ──────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  provider    TEXT        NOT NULL DEFAULT 'email',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_provider_idx ON public.profiles(provider);

-- 테이블 코멘트
COMMENT ON TABLE public.profiles IS 'auth.users와 동기화되는 사용자 프로필 테이블';
COMMENT ON COLUMN public.profiles.id IS 'auth.users.id와 동일한 UUID';
COMMENT ON COLUMN public.profiles.provider IS '인증 제공자: email, google, kakao';


-- ── 2. updated_at 자동 갱신 함수 ────────────────────────────

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

-- updated_at 트리거 등록
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ── 3. 신규 유저 가입 시 profiles 자동 생성 트리거 ──────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider TEXT;
  v_full_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- 인증 제공자 추출
  v_provider := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );

  -- 이름 추출 (소셜 로그인의 경우 메타데이터에서)
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- 아바타 URL 추출 (소셜 로그인의 경우)
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  -- profiles 테이블에 삽입
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_avatar_url,
    v_provider
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    provider   = EXCLUDED.provider,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 신규 유저 트리거 등록
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 유저 업데이트 시 프로필 동기화 트리거
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── 4. Row Level Security (RLS) 정책 ────────────────────────

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재실행 시 충돌 방지)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- 조회: 본인 프로필만 조회 가능
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 삽입: 본인 프로필만 생성 가능 (트리거로 자동 생성되므로 일반적으로 불필요)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 수정: 본인 프로필만 수정 가능
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 삭제: 본인 프로필만 삭제 가능
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);


-- ── 5. 서비스 롤 접근 허용 (트리거 실행을 위해 필요) ─────────

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;


-- ── 6. 기존 auth.users 데이터 마이그레이션 (선택사항) ────────

-- 이미 가입된 유저가 있는 경우 profiles 테이블에 일괄 삽입
INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
SELECT
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ),
  COALESCE(
    raw_user_meta_data->>'avatar_url',
    raw_user_meta_data->>'picture'
  ),
  COALESCE(raw_app_meta_data->>'provider', 'email')
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ── 7. 검증 쿼리 ────────────────────────────────────────────

-- 트리거 확인
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
ORDER BY trigger_name;

-- RLS 정책 확인
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- 프로필 데이터 확인
SELECT COUNT(*) as total_profiles FROM public.profiles;
