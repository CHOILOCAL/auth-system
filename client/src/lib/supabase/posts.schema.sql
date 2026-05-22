-- =============================================================================
-- posts — board entries (CRUD with author-only RLS)
-- =============================================================================
-- Run after schema.sql.
--
-- Security model:
--   - Any authenticated user can SELECT all posts (public bulletin board).
--   - INSERT must set author_id = auth.uid().
--   - UPDATE / DELETE only allowed when auth.uid() = author_id.
--   - The anon (logged-out) role gets NO access — board is members-only.
--
-- Privacy model:
--   - posts.author_id references public.profiles(id), not auth.users(id).
--     Joining returns nickname only; email is never reachable via the board.
-- =============================================================================


-- ---- 1. Table --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT         NOT NULL,
  content     TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT posts_title_length   CHECK (char_length(title) BETWEEN 1 AND 120),
  CONSTRAINT posts_content_length CHECK (char_length(content) BETWEEN 1 AND 10000)
);

CREATE INDEX IF NOT EXISTS posts_author_id_idx  ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);

COMMENT ON TABLE public.posts IS 'Board entries. RLS-enforced author-only writes.';


-- ---- 2. updated_at trigger --------------------------------------------------

DROP TRIGGER IF EXISTS on_posts_updated ON public.posts;
CREATE TRIGGER on_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---- 3. Row Level Security --------------------------------------------------

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS posts_select_authenticated ON public.posts;
DROP POLICY IF EXISTS posts_insert_self          ON public.posts;
DROP POLICY IF EXISTS posts_update_own           ON public.posts;
DROP POLICY IF EXISTS posts_delete_own           ON public.posts;

-- READ: any logged-in user can read every post.
CREATE POLICY posts_select_authenticated
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

-- CREATE: caller must be inserting a row whose author_id is themselves.
CREATE POLICY posts_insert_self
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- UPDATE: only the author can edit, and they cannot reassign authorship.
CREATE POLICY posts_update_own
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- DELETE: only the author can delete.
CREATE POLICY posts_delete_own
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);


-- ---- 4. Grants --------------------------------------------------------------

GRANT ALL ON public.posts TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
-- No anon access on purpose.


-- ---- 5. Verification --------------------------------------------------------

SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;

SELECT
  c.constraint_name,
  c.constraint_type
FROM information_schema.table_constraints c
WHERE c.table_schema = 'public'
  AND c.table_name = 'posts';
