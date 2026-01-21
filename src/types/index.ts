export type Position = 'GOL' | 'ZAG' | 'LAT' | 'VOL' | 'MEI' | 'ATA';

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  position: Position;
  overall: number;
  attributes: PlayerAttributes;
  avatar?: string;
  isOrganizer?: boolean;
}

export interface Match {
  id: string;
  title: string;
  location: string;
  address: string;
  date: Date;
  time: string;
  price: number;
  maxPlayers: number;
  confirmedPlayers: Player[];
  waitingList: Player[];
  organizerId: string;
  isPublic?: boolean;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  matchId?: string; // For internal match feed
  reactions: {
    ball: number;
    redCard: number;
    applause: number;
  };
  userReaction?: 'ball' | 'redCard' | 'applause' | null;
}

export type TeamType = 'vest' | 'noVest';

export interface Team {
  type: TeamType;
  players: Player[];
}

export interface PlayerPayment {
  playerId: string;
  paid: boolean;
  paidAt?: Date;
}
