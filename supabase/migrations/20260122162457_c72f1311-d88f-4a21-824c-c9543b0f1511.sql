-- Create enum for positions
CREATE TYPE public.player_position AS ENUM ('GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'ATA');

-- Create profiles table for Player Card data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  nickname TEXT,
  position player_position NOT NULL DEFAULT 'MEI',
  overall INTEGER NOT NULL DEFAULT 70,
  pace INTEGER NOT NULL DEFAULT 70,
  shooting INTEGER NOT NULL DEFAULT 70,
  passing INTEGER NOT NULL DEFAULT 70,
  dribbling INTEGER NOT NULL DEFAULT 70,
  defending INTEGER NOT NULL DEFAULT 70,
  physical INTEGER NOT NULL DEFAULT 70,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_players INTEGER NOT NULL DEFAULT 14,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_matches junction table (participation/membership)
CREATE TABLE public.user_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'confirmed', 'waiting')),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Create match_feed_posts table for internal resenha
CREATE TABLE public.match_feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_reactions table
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.match_feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('ball', 'redCard', 'applause')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Public matches are viewable by everyone"
  ON public.matches FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Authenticated users can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their matches"
  ON public.matches FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- User_matches policies
CREATE POLICY "Users can view match participants"
  ON public.user_matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join matches"
  ON public.user_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON public.user_matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can update participant payment status"
  ON public.user_matches FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = user_matches.match_id 
    AND matches.creator_id = auth.uid()
  ));

CREATE POLICY "Users can leave matches"
  ON public.user_matches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Match feed posts policies
CREATE POLICY "Match members can view posts"
  ON public.match_feed_posts FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_matches 
    WHERE user_matches.match_id = match_feed_posts.match_id 
    AND user_matches.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = match_feed_posts.match_id 
    AND matches.creator_id = auth.uid()
  ));

CREATE POLICY "Match members can create posts"
  ON public.match_feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND (
      EXISTS (
        SELECT 1 FROM public.user_matches 
        WHERE user_matches.match_id = match_feed_posts.match_id 
        AND user_matches.user_id = auth.uid()
      ) OR EXISTS (
        SELECT 1 FROM public.matches 
        WHERE matches.id = match_feed_posts.match_id 
        AND matches.creator_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authors can delete their posts"
  ON public.match_feed_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Post reactions policies
CREATE POLICY "Match members can view reactions"
  ON public.post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can react to posts"
  ON public.post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
  ON public.post_reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();