
-- Enable realtime for match feed posts and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
