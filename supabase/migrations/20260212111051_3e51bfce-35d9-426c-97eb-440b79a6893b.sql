
-- Drop existing FKs that point to auth.users
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_creator_id_fkey;
ALTER TABLE public.user_matches DROP CONSTRAINT IF EXISTS user_matches_user_id_fkey;

-- Create FK: matches.creator_id -> profiles.user_id
ALTER TABLE public.matches
  ADD CONSTRAINT matches_creator_id_fkey
  FOREIGN KEY (creator_id)
  REFERENCES public.profiles(user_id)
  ON DELETE RESTRICT;

-- Create FK: user_matches.user_id -> profiles.user_id
ALTER TABLE public.user_matches
  ADD CONSTRAINT user_matches_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;
