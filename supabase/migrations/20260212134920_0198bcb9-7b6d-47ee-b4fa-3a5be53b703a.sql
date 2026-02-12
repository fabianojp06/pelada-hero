
-- Drop old FK to auth.users and add FK to profiles.user_id
ALTER TABLE public.match_feed_posts DROP CONSTRAINT match_feed_posts_author_id_fkey;
ALTER TABLE public.match_feed_posts ADD CONSTRAINT match_feed_posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
