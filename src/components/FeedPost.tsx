import { FeedPost as FeedPostType } from '@/types';
import { User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FeedPostProps {
  post: FeedPostType;
  onReact: (postId: string, reaction: 'ball' | 'redCard' | 'applause') => void;
}

export function FeedPost({ post, onReact }: FeedPostProps) {
  return (
    <div className="feed-card animate-slide-up">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold">{post.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p>{post.content}</p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="relative">
          <img src={post.imageUrl} alt="Post" className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Video */}
      {post.videoUrl && (
        <div className="relative">
          <video
            src={post.videoUrl}
            controls
            className="w-full max-h-96 object-cover"
            preload="metadata"
          />
        </div>
      )}

      {/* Reactions */}
      <div className="p-4 flex gap-2">
        <button
          className={`reaction-btn ${post.userReaction === 'ball' ? 'active' : ''}`}
          onClick={() => onReact(post.id, 'ball')}
        >
          <span>⚽</span>
          <span>{post.reactions.ball}</span>
        </button>
        <button
          className={`reaction-btn ${post.userReaction === 'redCard' ? 'active' : ''}`}
          onClick={() => onReact(post.id, 'redCard')}
        >
          <span>🟥</span>
          <span>{post.reactions.redCard}</span>
        </button>
        <button
          className={`reaction-btn ${post.userReaction === 'applause' ? 'active' : ''}`}
          onClick={() => onReact(post.id, 'applause')}
        >
          <span>👏</span>
          <span>{post.reactions.applause}</span>
        </button>
      </div>
    </div>
  );
}
