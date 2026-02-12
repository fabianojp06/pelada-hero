import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MatchOrganizer {
  id: string;
  match_id: string;
  user_id: string;
  promoted_by: string;
  created_at: string;
}

export const useMatchOrganizers = (matchId: string | undefined) => {
  return useQuery({
    queryKey: ['match-organizers', matchId],
    queryFn: async () => {
      if (!matchId) return [];
      const { data, error } = await supabase
        .from('match_organizers')
        .select('*')
        .eq('match_id', matchId);
      if (error) throw error;
      return (data || []) as MatchOrganizer[];
    },
    enabled: !!matchId,
  });
};

export const usePromoteOrganizer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ matchId, userId }: { matchId: string; userId: string }) => {
      if (!user?.id) throw new Error('Você precisa estar logado');

      const { data, error } = await supabase
        .from('match_organizers')
        .insert({
          match_id: matchId,
          user_id: userId,
          promoted_by: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Este jogador já é organizador');
        if (error.message?.includes('row-level security')) throw new Error('Limite de 5 organizadores atingido ou sem permissão');
        throw new Error(error.message || 'Erro ao promover organizador');
      }
      return data;
    },
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['match-organizers', matchId] });
    },
  });
};

export const useRemoveOrganizer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, organizerId }: { matchId: string; organizerId: string }) => {
      const { error } = await supabase
        .from('match_organizers')
        .delete()
        .eq('id', organizerId)
        .eq('match_id', matchId);

      if (error) throw new Error(error.message || 'Erro ao remover organizador');
    },
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['match-organizers', matchId] });
    },
  });
};
