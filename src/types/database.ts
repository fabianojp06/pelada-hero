// Local database types until Supabase types are generated
export type PlayerPosition = 'GOL' | 'ZAG' | 'LAT' | 'VOL' | 'MEI' | 'ATA';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  nickname: string | null;
  position: PlayerPosition;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  title: string;
  location: string;
  address: string | null;
  date: string;
  time: string;
  price: number;
  max_players: number;
  creator_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMatch {
  id: string;
  user_id: string;
  match_id: string;
  status: 'joined' | 'confirmed' | 'waiting';
  is_paid: boolean;
  joined_at: string;
}

export interface MatchFeedPost {
  id: string;
  match_id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'ball' | 'redCard' | 'applause';
  created_at: string;
}

// Extended types with relations
export interface MatchWithParticipants extends Match {
  participants: (UserMatch & { profile: Profile })[];
  creator?: Profile;
}

export interface MatchFeedPostWithAuthor extends MatchFeedPost {
  author: Profile;
  reactions: PostReaction[];
}
