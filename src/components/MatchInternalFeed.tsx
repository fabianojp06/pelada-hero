import { useState, useEffect, useCallback } from 'react';
import { FeedPost } from '@/components/FeedPost';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Image, Video, Send, X, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  author_id: string;
  match_id: string;
  profiles?: {
    name: string;
    nickname: string | null;
    avatar_url: string | null;
  };
  reactions: { ball: number; redCard: number; applause: number };
  userReaction: 'ball' | 'redCard' | 'applause' | null;
}

interface MatchInternalFeedProps {
  matchId: string;
}

export function MatchInternalFeed({ matchId }: MatchInternalFeedProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    const { data: postsData, error } = await supabase
      .from('match_feed_posts')
      .select('*, profiles!match_feed_posts_author_id_fkey(name, nickname, avatar_url)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    // Fetch reactions for all posts
    const postIds = postsData?.map((p: any) => p.id) || [];
    let reactionsData: any[] = [];
    if (postIds.length > 0) {
      const { data: rData } = await supabase
        .from('post_reactions')
        .select('*')
        .in('post_id', postIds);
      reactionsData = rData || [];
    }

    const enrichedPosts = (postsData || []).map((post: any) => {
      const postReactions = reactionsData.filter((r: any) => r.post_id === post.id);
      const ball = postReactions.filter((r: any) => r.reaction_type === 'ball').length;
      const redCard = postReactions.filter((r: any) => r.reaction_type === 'redCard').length;
      const applause = postReactions.filter((r: any) => r.reaction_type === 'applause').length;
      const userReaction = postReactions.find((r: any) => r.user_id === user?.id)?.reaction_type || null;

      return {
        ...post,
        reactions: { ball, redCard, applause },
        userReaction,
      };
    });

    setPosts(enrichedPosts);
    setLoading(false);
  }, [matchId, user?.id]);

  useEffect(() => {
    fetchPosts();

    // Realtime subscription
    const channel = supabase
      .channel(`match-feed-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_feed_posts', filter: `match_id=eq.${matchId}` }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts, matchId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: `Tamanho máximo: ${type === 'video' ? '50MB' : '10MB'}`,
        variant: 'destructive',
      });
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const uploadMedia = async (file: File): Promise<{ imageUrl?: string; videoUrl?: string }> => {
    const ext = file.name.split('.').pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const isVideo = file.type.startsWith('video/');

    const { error } = await supabase.storage
      .from('match-media')
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('match-media')
      .getPublicUrl(path);

    return isVideo ? { videoUrl: publicUrl } : { imageUrl: publicUrl };
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !user) return;
    setSubmitting(true);

    try {
      let imageUrl: string | null = null;
      let videoUrl: string | null = null;

      if (mediaFile) {
        setUploading(true);
        const urls = await uploadMedia(mediaFile);
        imageUrl = urls.imageUrl || null;
        videoUrl = urls.videoUrl || null;
        setUploading(false);
      }

      const { error } = await supabase
        .from('match_feed_posts')
        .insert({
          match_id: matchId,
          author_id: user.id,
          content: newPostContent,
          image_url: imageUrl,
          video_url: videoUrl,
        });

      if (error) throw error;

      setNewPostContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setShowNewPost(false);
    } catch (err: any) {
      toast({
        title: 'Erro ao publicar',
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleReact = async (postId: string, reaction: 'ball' | 'redCard' | 'applause') => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.userReaction === reaction) {
      // Remove reaction
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      // Remove existing reaction first
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      // Add new reaction
      await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reaction,
        });
    }

    fetchPosts();
  };

  const removeMedia = () => {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="player-card p-4 animate-pulse">
            <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
            <div className="h-3 bg-secondary rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Post */}
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
            <button onClick={() => { setShowNewPost(false); removeMedia(); }} className="p-1">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="O que rolou na pelada?"
            className="w-full bg-secondary rounded-xl p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative">
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} controls className="w-full rounded-xl max-h-64 object-cover" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full rounded-xl max-h-64 object-cover" />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Media Buttons */}
          <div className="flex gap-2">
            <label className="flex-1 py-2 bg-secondary rounded-xl flex items-center justify-center gap-2 text-sm cursor-pointer hover:bg-muted transition-colors">
              <Image className="w-4 h-4 text-primary" />
              Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'image')}
              />
            </label>
            <label className="flex-1 py-2 bg-secondary rounded-xl flex items-center justify-center gap-2 text-sm cursor-pointer hover:bg-muted transition-colors">
              <Video className="w-4 h-4 text-accent" />
              Vídeo
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'video')}
              />
            </label>
          </div>

          <button
            onClick={handleSubmitPost}
            disabled={!newPostContent.trim() || submitting}
            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploading ? 'Enviando mídia...' : 'Publicando...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publicar
              </>
            )}
          </button>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={{
                id: post.id,
                authorId: post.author_id,
                authorName: post.profiles?.nickname || post.profiles?.name || 'Jogador',
                authorAvatar: post.profiles?.avatar_url || undefined,
                content: post.content,
                imageUrl: post.image_url || undefined,
                videoUrl: post.video_url || undefined,
                createdAt: new Date(post.created_at),
                matchId: post.match_id,
                reactions: post.reactions,
                userReaction: post.userReaction,
              }}
              onReact={handleReact}
            />
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
