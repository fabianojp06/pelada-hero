
-- Create storage bucket for match feed media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('match-media', 'match-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to match-media bucket
CREATE POLICY "Authenticated users can upload match media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'match-media' 
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to match media
CREATE POLICY "Match media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'match-media');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own match media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'match-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add video_url column to match_feed_posts
ALTER TABLE public.match_feed_posts ADD COLUMN IF NOT EXISTS video_url text;
