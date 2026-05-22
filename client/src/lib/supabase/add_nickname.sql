-- =============================================================================
-- Migration: add `nickname` to existing profiles tables
-- =============================================================================
-- Idempotent. Safe to run multiple times. Apply ONLY if you previously ran an
-- older `schema.sql` that did not have the `nickname` column. A fresh install
-- of the current `schema.sql` already has it; you can skip this file.
-- =============================================================================

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Backfill from full_name → derived from id when needed.
UPDATE public.profiles
SET nickname = COALESCE(
  NULLIF(TRIM(full_name), ''),
  'user_' || substring(id::text from 1 for 8)
)
WHERE nickname IS NULL OR TRIM(nickname) = '';

-- Clamp any existing nicknames to the 32-char ceiling so the new constraint
-- can be added without violations.
UPDATE public.profiles
SET nickname = substring(nickname from 1 for 32)
WHERE char_length(nickname) > 32;

ALTER TABLE public.profiles
  ALTER COLUMN nickname SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_nickname_length;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_nickname_length
  CHECK (char_length(nickname) BETWEEN 2 AND 32);

CREATE INDEX IF NOT EXISTS profiles_nickname_idx ON public.profiles(nickname);

COMMIT;

-- Verify
SELECT id, nickname, provider, created_at
FROM public.profiles
LIMIT 5;
