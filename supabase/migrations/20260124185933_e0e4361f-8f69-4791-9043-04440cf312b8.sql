-- Ensure profiles.user_id is unique so other tables can reference it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add FK: matches.creator_id -> profiles.user_id (enables embedded selects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'matches_creator_id_fkey'
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_creator_id_fkey
      FOREIGN KEY (creator_id)
      REFERENCES public.profiles(user_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- Add FK: user_matches.user_id -> profiles.user_id (enables embedded selects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_matches_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_matches
      ADD CONSTRAINT user_matches_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(user_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_matches_creator_id ON public.matches (creator_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_user_id ON public.user_matches (user_id);
