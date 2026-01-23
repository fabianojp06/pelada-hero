import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Match, UserMatch, Profile } from '@/types/database';

interface MatchWithDetails extends Match {
  creator: Profile | null;
  participants: (UserMatch & { profiles: Profile })[];
  latitude?: number | null;
  longitude?: number | null;
  players_per_side?: number;
}

interface CreateMatchInput {
  title: string;
  location: string;
  address: string | null;
  date: string;
  time: string;
  price: number;
  max_players: number;
  players_per_side: number;
  is_public: boolean;
  latitude: number | null;
  longitude: number | null;
}

export const useMatches = (publicOnly = true) => {
  return useQuery({
    queryKey: ['matches', publicOnly],
    queryFn: async () => {
      let query = (supabase as any)
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:user_matches(*, profiles(*))
        `)
        .order('date', { ascending: true });

      if (publicOnly) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as MatchWithDetails[];
    },
  });
};

export const useMatch = (matchId: string | undefined) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      if (!matchId) return null;
      
      const { data, error } = await (supabase as any)
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:user_matches(*, profiles(*))
        `)
        .eq('id', matchId)
        .maybeSingle();
      
      if (error) throw error;
      return data as MatchWithDetails | null;
    },
    enabled: !!matchId,
  });
};

export const useMyMatches = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get matches where user is creator
      const { data: createdMatches, error: createdError } = await (supabase as any)
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:user_matches(*, profiles(*))
        `)
        .eq('creator_id', user.id);
      
      if (createdError) throw createdError;

      // Get matches where user has joined
      const { data: joinedMatchIds, error: joinedError } = await (supabase as any)
        .from('user_matches')
        .select('match_id')
        .eq('user_id', user.id);
      
      if (joinedError) throw joinedError;

      const matchIds = joinedMatchIds?.map((m: any) => m.match_id) || [];
      
      if (matchIds.length > 0) {
        const { data: joinedMatches, error: matchesError } = await (supabase as any)
          .from('matches')
          .select(`
            *,
            creator:profiles!matches_creator_id_fkey(*),
            participants:user_matches(*, profiles(*))
          `)
          .in('id', matchIds);
        
        if (matchesError) throw matchesError;

        // Combine and deduplicate
        const allMatches = [...(createdMatches || []), ...(joinedMatches || [])];
        const uniqueMatches = allMatches.filter((match: any, index: number, self: any[]) =>
          index === self.findIndex((m: any) => m.id === match.id)
        );
        
        return uniqueMatches as MatchWithDetails[];
      }

      return (createdMatches || []) as MatchWithDetails[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await (supabase as any)
        .from('matches')
        .insert({
          ...input,
          creator_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['my-matches'] });
    },
  });
};

export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ matchId, isPublic }: { matchId: string; isPublic: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // For public matches, users start as 'waiting' (pending approval)
      // For private matches or when user is creator, they start as 'confirmed'
      const status = isPublic ? 'waiting' : 'confirmed';
      
      const { data, error } = await (supabase as any)
        .from('user_matches')
        .insert({
          user_id: user.id,
          match_id: matchId,
          status,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
      queryClient.invalidateQueries({ queryKey: ['my-matches'] });
    },
  });
};

export const useLeaveMatch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (matchId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await (supabase as any)
        .from('user_matches')
        .delete()
        .eq('user_id', user.id)
        .eq('match_id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
      queryClient.invalidateQueries({ queryKey: ['my-matches'] });
    },
  });
};

export const useApproveParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, participantId }: { matchId: string; participantId: string }) => {
      const { data, error } = await (supabase as any)
        .from('user_matches')
        .update({ status: 'confirmed' })
        .eq('id', participantId)
        .eq('match_id', matchId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useRejectParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, participantId }: { matchId: string; participantId: string }) => {
      const { error } = await (supabase as any)
        .from('user_matches')
        .delete()
        .eq('id', participantId)
        .eq('match_id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useUpdateParticipantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, userId, status }: { matchId: string; userId: string; status: string }) => {
      const { data, error } = await (supabase as any)
        .from('user_matches')
        .update({ status })
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });
};

export const useTogglePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, participantId, isPaid }: { matchId: string; participantId: string; isPaid: boolean }) => {
      const { data, error } = await (supabase as any)
        .from('user_matches')
        .update({ is_paid: isPaid })
        .eq('match_id', matchId)
        .eq('user_id', participantId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });
};
