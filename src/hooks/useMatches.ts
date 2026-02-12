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
      let query = supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:user_matches(*, profiles!user_matches_user_id_fkey(*))
        `)
        .order('date', { ascending: true });

      if (publicOnly) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('[useMatches] Error fetching matches:', error);
        throw error;
      }
      return (data || []) as unknown as MatchWithDetails[];
    },
  });
};

export const useMatch = (matchId: string | undefined) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      if (!matchId) return null;
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:user_matches(*, profiles!user_matches_user_id_fkey(*))
        `)
        .eq('id', matchId)
        .maybeSingle();
      
      if (error) {
        console.error('[useMatch] Error fetching match:', error);
        throw error;
      }
      return data as unknown as MatchWithDetails | null;
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
      const { data: createdMatches, error: createdError } = await supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:user_matches(*, profiles!user_matches_user_id_fkey(*))
        `)
        .eq('creator_id', user.id);
      
      if (createdError) {
        console.error('[useMyMatches] Error fetching created matches:', createdError);
        throw createdError;
      }

      // Get matches where user has joined
      const { data: joinedMatchIds, error: joinedError } = await supabase
        .from('user_matches')
        .select('match_id')
        .eq('user_id', user.id);
      
      if (joinedError) {
        console.error('[useMyMatches] Error fetching joined matches:', joinedError);
        throw joinedError;
      }

      const matchIds = joinedMatchIds?.map((m) => m.match_id) || [];
      
      if (matchIds.length > 0) {
        const { data: joinedMatches, error: matchesError } = await supabase
          .from('matches')
        .select(`
            *,
            creator:profiles!matches_creator_id_fkey(*),
            participants:user_matches(*, profiles!user_matches_user_id_fkey(*))
          `)
          .in('id', matchIds);
        
        if (matchesError) {
          console.error('[useMyMatches] Error fetching joined match details:', matchesError);
          throw matchesError;
        }

        // Combine and deduplicate
        const allMatches = [...(createdMatches || []), ...(joinedMatches || [])];
        const uniqueMatches = allMatches.filter((match, index, self) =>
          index === self.findIndex((m) => m.id === match.id)
        );
        
        return uniqueMatches as unknown as MatchWithDetails[];
      }

      return (createdMatches || []) as unknown as MatchWithDetails[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      if (!user?.id) {
        console.error('[useCreateMatch] User not authenticated');
        throw new Error('Você precisa estar logado para criar uma pelada');
      }
      
      const insertData = {
        title: input.title,
        location: input.location,
        address: input.address,
        date: input.date,
        time: input.time,
        price: input.price,
        max_players: input.max_players,
        players_per_side: input.players_per_side,
        is_public: input.is_public,
        latitude: input.latitude,
        longitude: input.longitude,
        creator_id: user.id,
      };
      
      console.log('[useCreateMatch] Inserting match:', insertData);
      
      const { data, error } = await supabase
        .from('matches')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('[useCreateMatch] Supabase error:', error);
        throw new Error(error.message || 'Erro ao salvar partida no banco de dados');
      }
      
      console.log('[useCreateMatch] Match created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['my-matches'] });
    },
    onError: (error) => {
      console.error('[useCreateMatch] Mutation error:', error);
    },
  });
};

export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ matchId, isPublic }: { matchId: string; isPublic: boolean }) => {
      if (!user?.id) {
        console.error('[useJoinMatch] User not authenticated');
        throw new Error('Você precisa estar logado para participar');
      }
      
      // For public matches, users start as 'waiting' (pending approval)
      // For private matches or when user is creator, they start as 'confirmed'
      const status = isPublic ? 'waiting' : 'confirmed';
      
      console.log('[useJoinMatch] Joining match:', { matchId, status });
      
      const { data, error } = await supabase
        .from('user_matches')
        .insert({
          user_id: user.id,
          match_id: matchId,
          status,
        })
        .select()
        .single();
      
      if (error) {
        console.error('[useJoinMatch] Error joining match:', error);
        throw new Error(error.message || 'Erro ao participar da pelada');
      }
      
      console.log('[useJoinMatch] Joined successfully:', data);
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
      if (!user?.id) {
        console.error('[useLeaveMatch] User not authenticated');
        throw new Error('Você precisa estar logado');
      }
      
      console.log('[useLeaveMatch] Leaving match:', matchId);
      
      const { error } = await supabase
        .from('user_matches')
        .delete()
        .eq('user_id', user.id)
        .eq('match_id', matchId);
      
      if (error) {
        console.error('[useLeaveMatch] Error leaving match:', error);
        throw new Error(error.message || 'Erro ao sair da pelada');
      }
      
      console.log('[useLeaveMatch] Left successfully');
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
      console.log('[useApproveParticipant] Approving:', { matchId, participantId });
      
      const { data, error } = await supabase
        .from('user_matches')
        .update({ status: 'confirmed' })
        .eq('id', participantId)
        .eq('match_id', matchId)
        .select()
        .single();
      
      if (error) {
        console.error('[useApproveParticipant] Error:', error);
        throw new Error(error.message || 'Erro ao aprovar participante');
      }
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
      console.log('[useRejectParticipant] Rejecting:', { matchId, participantId });
      
      const { error } = await supabase
        .from('user_matches')
        .delete()
        .eq('id', participantId)
        .eq('match_id', matchId);
      
      if (error) {
        console.error('[useRejectParticipant] Error:', error);
        throw new Error(error.message || 'Erro ao rejeitar participante');
      }
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
      console.log('[useUpdateParticipantStatus] Updating:', { matchId, userId, status });
      
      const { data, error } = await supabase
        .from('user_matches')
        .update({ status })
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('[useUpdateParticipantStatus] Error:', error);
        throw new Error(error.message || 'Erro ao atualizar status');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: Record<string, any> }) => {
      const { data: result, error } = await supabase
        .from('matches')
        .update(data)
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        console.error('[useUpdateMatch] Error:', error);
        throw new Error(error.message || 'Erro ao atualizar pelada');
      }
      return result;
    },
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['my-matches'] });
    },
  });
};

export const useTogglePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, participantId, isPaid }: { matchId: string; participantId: string; isPaid: boolean }) => {
      console.log('[useTogglePayment] Toggling:', { matchId, participantId, isPaid });
      
      const { data, error } = await supabase
        .from('user_matches')
        .update({ is_paid: isPaid })
        .eq('match_id', matchId)
        .eq('user_id', participantId)
        .select()
        .single();
      
      if (error) {
        console.error('[useTogglePayment] Error:', error);
        throw new Error(error.message || 'Erro ao atualizar pagamento');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });
};
