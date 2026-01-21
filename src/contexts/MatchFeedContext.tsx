import { createContext, useContext, useState, ReactNode } from 'react';
import { FeedPost } from '@/types';

interface MatchFeedContextType {
  matchPosts: Record<string, FeedPost[]>;
  addPost: (matchId: string, post: Omit<FeedPost, 'id' | 'createdAt' | 'reactions' | 'userReaction'>) => void;
  reactToPost: (matchId: string, postId: string, reaction: 'ball' | 'redCard' | 'applause') => void;
  getMatchPosts: (matchId: string) => FeedPost[];
}

const MatchFeedContext = createContext<MatchFeedContextType | undefined>(undefined);

// Initial mock data for match feeds
const initialMatchPosts: Record<string, FeedPost[]> = {
  '1': [
    {
      id: 'mp1',
      authorId: '2',
      authorName: 'Bruninho',
      content: 'Bora que quinta tem mais! ⚽🔥',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      matchId: '1',
      reactions: { ball: 5, redCard: 0, applause: 3 },
      userReaction: null,
    },
    {
      id: 'mp2',
      authorId: '3',
      authorName: 'Dedé',
      content: 'Alguém leva a bola? A minha furou 😅',
      imageUrl: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      matchId: '1',
      reactions: { ball: 2, redCard: 1, applause: 8 },
      userReaction: 'applause',
    },
  ],
};

export function MatchFeedProvider({ children }: { children: ReactNode }) {
  const [matchPosts, setMatchPosts] = useState<Record<string, FeedPost[]>>(initialMatchPosts);

  const addPost = (
    matchId: string,
    post: Omit<FeedPost, 'id' | 'createdAt' | 'reactions' | 'userReaction'>
  ) => {
    const newPost: FeedPost = {
      ...post,
      id: `mp${Date.now()}`,
      createdAt: new Date(),
      reactions: { ball: 0, redCard: 0, applause: 0 },
      userReaction: null,
    };

    setMatchPosts((prev) => ({
      ...prev,
      [matchId]: [newPost, ...(prev[matchId] || [])],
    }));
  };

  const reactToPost = (matchId: string, postId: string, reaction: 'ball' | 'redCard' | 'applause') => {
    setMatchPosts((prev) => {
      const posts = prev[matchId] || [];
      return {
        ...prev,
        [matchId]: posts.map((post) => {
          if (post.id === postId) {
            const wasActive = post.userReaction === reaction;
            return {
              ...post,
              userReaction: wasActive ? null : reaction,
              reactions: {
                ...post.reactions,
                [reaction]: wasActive ? post.reactions[reaction] - 1 : post.reactions[reaction] + 1,
              },
            };
          }
          return post;
        }),
      };
    });
  };

  const getMatchPosts = (matchId: string) => {
    return matchPosts[matchId] || [];
  };

  return (
    <MatchFeedContext.Provider
      value={{
        matchPosts,
        addPost,
        reactToPost,
        getMatchPosts,
      }}
    >
      {children}
    </MatchFeedContext.Provider>
  );
}

export function useMatchFeed() {
  const context = useContext(MatchFeedContext);
  if (context === undefined) {
    throw new Error('useMatchFeed must be used within a MatchFeedProvider');
  }
  return context;
}
