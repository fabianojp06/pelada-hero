-- Add geolocation and players_per_side columns to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS players_per_side INTEGER NOT NULL DEFAULT 5;

-- Create index for geospatial queries (approximate distance using lat/long)
CREATE INDEX IF NOT EXISTS idx_matches_location ON public.matches (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches (date, is_public);

-- Update user_matches status to support waiting list approval flow
-- Status values: 'joined' (confirmed by self), 'confirmed' (approved by organizer), 'waiting' (pending approval for public matches)
COMMENT ON COLUMN public.user_matches.status IS 'Status values: joined, confirmed, waiting. For public matches, users start as waiting until organizer approves.';

-- Add RLS policy to allow organizers to view waiting list participants
DROP POLICY IF EXISTS "Users can view match participants" ON public.user_matches;
CREATE POLICY "Users can view match participants" 
  ON public.user_matches FOR SELECT
  USING (true);

-- Add policy allowing organizers to approve/reject participants
DROP POLICY IF EXISTS "Creators can update participant status" ON public.user_matches;
CREATE POLICY "Creators can update participant status" 
  ON public.user_matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = user_matches.match_id 
      AND matches.creator_id = auth.uid()
    )
  );