import { Player, Match, FeedPost } from '@/types';

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    nickname: 'Carlão',
    position: 'ATA',
    overall: 85,
    attributes: { pace: 88, shooting: 90, passing: 75, dribbling: 82, defending: 40, physical: 78 },
    isOrganizer: true,
  },
  {
    id: '2',
    name: 'Bruno Costa',
    nickname: 'Bruninho',
    position: 'MEI',
    overall: 82,
    attributes: { pace: 75, shooting: 78, passing: 88, dribbling: 85, defending: 65, physical: 70 },
  },
  {
    id: '3',
    name: 'André Santos',
    nickname: 'Dedé',
    position: 'ZAG',
    overall: 79,
    attributes: { pace: 65, shooting: 45, passing: 70, dribbling: 55, defending: 88, physical: 85 },
  },
  {
    id: '4',
    name: 'Lucas Oliveira',
    nickname: 'Lukinha',
    position: 'LAT',
    overall: 77,
    attributes: { pace: 85, shooting: 60, passing: 75, dribbling: 72, defending: 78, physical: 72 },
  },
  {
    id: '5',
    name: 'Rafael Lima',
    nickname: 'Rafa',
    position: 'GOL',
    overall: 80,
    attributes: { pace: 45, shooting: 30, passing: 65, dribbling: 40, defending: 35, physical: 82 },
  },
  {
    id: '6',
    name: 'Pedro Alves',
    nickname: 'Pedrão',
    position: 'VOL',
    overall: 78,
    attributes: { pace: 70, shooting: 55, passing: 80, dribbling: 68, defending: 82, physical: 80 },
  },
  {
    id: '7',
    name: 'Thiago Mendes',
    nickname: 'Titi',
    position: 'MEI',
    overall: 81,
    attributes: { pace: 78, shooting: 82, passing: 85, dribbling: 80, defending: 55, physical: 68 },
  },
  {
    id: '8',
    name: 'Marcos Souza',
    nickname: 'Marquinhos',
    position: 'ATA',
    overall: 83,
    attributes: { pace: 90, shooting: 85, passing: 70, dribbling: 88, defending: 35, physical: 72 },
  },
];

export const mockCurrentPlayer: Player = mockPlayers[0];

export const mockMatch: Match = {
  id: '1',
  title: 'Pelada de Quinta',
  location: 'Arena Soccer House',
  address: 'Rua das Flores, 123 - Centro',
  date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  time: '20:00',
  price: 25,
  maxPlayers: 14,
  confirmedPlayers: mockPlayers.slice(0, 6),
  waitingList: mockPlayers.slice(6, 8),
  organizerId: '1',
};

export const mockFeedPosts: FeedPost[] = [
  {
    id: '1',
    authorId: '2',
    authorName: 'Bruninho',
    content: 'Golaço de ontem! 🔥⚽',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reactions: { ball: 12, redCard: 0, applause: 8 },
    userReaction: 'ball',
  },
  {
    id: '2',
    authorId: '3',
    authorName: 'Dedé',
    content: 'Defesa impenetrável hoje! 💪',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    reactions: { ball: 5, redCard: 2, applause: 15 },
    userReaction: null,
  },
  {
    id: '3',
    authorId: '8',
    authorName: 'Marquinhos',
    content: 'Hat-trick na última pelada! Quem vai me parar?',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reactions: { ball: 25, redCard: 3, applause: 18 },
    userReaction: 'applause',
  },
];

export const positionLabels: Record<string, string> = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  VOL: 'Volante',
  MEI: 'Meia',
  ATA: 'Atacante',
};
