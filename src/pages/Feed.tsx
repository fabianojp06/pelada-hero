import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FeedPost } from '@/components/FeedPost';
import { mockFeedPosts } from '@/data/mockData';
import { FeedPost as FeedPostType } from '@/types';
import { Plus, Image, Video, Type } from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState<FeedPostType[]>(mockFeedPosts);
  const [showNewPost, setShowNewPost] = useState(false);

  const handleReact = (postId: string, reaction: 'ball' | 'redCard' | 'applause') => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const wasActive = post.userReaction === reaction;
          return {
            ...post,
            userReaction: wasActive ? null : reaction,
            reactions: {
              ...post.reactions,
              [reaction]: wasActive
                ? post.reactions[reaction] - 1
                : post.reactions[reaction] + 1,
            },
          };
        }
        return post;
      })
    );
  };

  return (
    <Layout title="RESENHA">
      <div className="p-4 space-y-4">
        {/* New Post Button */}
        <button
          onClick={() => setShowNewPost(true)}
          className="w-full player-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="text-muted-foreground">O que aconteceu na pelada?</span>
        </button>

        {/* Quick Post Actions */}
        <div className="flex gap-2">
          <button className="flex-1 py-3 rounded-xl bg-secondary flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Image className="w-4 h-4 text-primary" />
            Foto
          </button>
          <button className="flex-1 py-3 rounded-xl bg-secondary flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Video className="w-4 h-4 text-accent" />
            Vídeo
          </button>
          <button className="flex-1 py-3 rounded-xl bg-secondary flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Type className="w-4 h-4" />
            Texto
          </button>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} onReact={handleReact} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
