
-- Table to track co-organizers (creator is always an implicit organizer)
CREATE TABLE public.match_organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  promoted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

ALTER TABLE public.match_organizers ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view organizers
CREATE POLICY "Anyone can view match organizers"
ON public.match_organizers FOR SELECT
USING (true);

-- Only existing organizers (creator or co-organizer) can add new organizers
CREATE POLICY "Organizers can add co-organizers"
ON public.match_organizers FOR INSERT
WITH CHECK (
  auth.uid() = promoted_by
  AND (
    -- Is the match creator
    EXISTS (SELECT 1 FROM matches WHERE id = match_id AND creator_id = auth.uid())
    OR
    -- Is already a co-organizer
    EXISTS (SELECT 1 FROM match_organizers WHERE match_organizers.match_id = match_organizers.match_id AND match_organizers.user_id = auth.uid())
  )
);

-- Only creator can remove organizers
CREATE POLICY "Creator can remove organizers"
ON public.match_organizers FOR DELETE
USING (
  EXISTS (SELECT 1 FROM matches WHERE id = match_id AND creator_id = auth.uid())
);

-- Security definer function to check organizer status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_match_organizer(_match_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matches WHERE id = _match_id AND creator_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM match_organizers WHERE match_id = _match_id AND user_id = _user_id
  )
$$;

-- Function to count organizers (creator + co-organizers)
CREATE OR REPLACE FUNCTION public.count_match_organizers(_match_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 1 + COALESCE((SELECT COUNT(*)::int FROM match_organizers WHERE match_id = _match_id), 0)
$$;

-- Replace the INSERT policy with one that enforces the 5-organizer limit
DROP POLICY "Organizers can add co-organizers" ON public.match_organizers;

CREATE POLICY "Organizers can add co-organizers with limit"
ON public.match_organizers FOR INSERT
WITH CHECK (
  auth.uid() = promoted_by
  AND public.is_match_organizer(match_id, auth.uid())
  AND public.count_match_organizers(match_id) < 5
);
