import { useState } from 'react';
import { FeedPost } from '@/components/FeedPost';
import { useMatchFeed } from '@/contexts/MatchFeedContext';
import { mockCurrentPlayer } from '@/data/mockData';
import { Plus, Image, Send, X } from 'lucide-react';

interface MatchInternalFeedProps {
  matchId: string;
}

export function MatchInternalFeed({ matchId }: MatchInternalFeedProps) {
  const { getMatchPosts, addPost, reactToPost } = useMatchFeed();
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  const posts = getMatchPosts(matchId);

  const handleSubmitPost = () => {
    if (!newPostContent.trim()) return;

    addPost(matchId, {
      authorId: mockCurrentPlayer.id,
      authorName: mockCurrentPlayer.nickname,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      matchId,
    });

    setNewPostContent('');
    setNewPostImage('');
    setShowNewPost(false);
  };

  const handleReact = (postId: string, reaction: 'ball' | 'redCard' | 'applause') => {
    reactToPost(matchId, postId, reaction);
  };

  return (
    <div className="space-y-4">
      {/* New Post Button */}
      {!showNewPost ? (
        <button
          onClick={() => setShowNewPost(true)}
          className="w-full player-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="text-muted-foreground">Compartilhe algo com o grupo...</span>
        </button>
      ) : (
        <div className="player-card p-4 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">Nova Postagem</h4>
            <button onClick={() => setShowNewPost(false)} className="p-1">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="O que rolou na pelada?"
            className="w-full bg-secondary rounded-xl p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={newPostImage}
              onChange={(e) => setNewPostImage(e.target.value)}
              placeholder="URL da imagem (opcional)"
              className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="p-2 bg-secondary rounded-xl">
              <Image className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={handleSubmitPost}
            disabled={!newPostContent.trim()}
            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Publicar
          </button>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} onReact={handleReact} />
          ))}
        </div>
      ) : (
        <div className="player-card p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma postagem ainda. Seja o primeiro a compartilhar!
          </p>
        </div>
      )}
    </div>
  );
}
