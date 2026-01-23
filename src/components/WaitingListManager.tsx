import { useState } from 'react';
import { useApproveParticipant, useRejectParticipant } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';
import { Check, X, User, Loader2, Clock } from 'lucide-react';

interface Participant {
  id: string;
  user_id: string;
  status: string;
  profiles: {
    id: string;
    name: string;
    nickname: string | null;
    position: string;
    overall: number;
    avatar_url: string | null;
  };
}

interface WaitingListManagerProps {
  matchId: string;
  waitingList: Participant[];
  maxPlayers: number;
  confirmedCount: number;
}

export function WaitingListManager({ 
  matchId, 
  waitingList, 
  maxPlayers, 
  confirmedCount 
}: WaitingListManagerProps) {
  const { toast } = useToast();
  const approveParticipant = useApproveParticipant();
  const rejectParticipant = useRejectParticipant();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const spotsLeft = maxPlayers - confirmedCount;

  const handleApprove = async (participantId: string, userId: string, playerName: string) => {
    if (spotsLeft <= 0) {
      toast({
        title: 'Lista cheia',
        description: 'Não há mais vagas disponíveis para confirmar jogadores.',
        variant: 'destructive',
      });
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(participantId));

    try {
      await approveParticipant.mutateAsync({ matchId, participantId });
      toast({
        title: 'Jogador aprovado!',
        description: `${playerName} foi adicionado à lista de confirmados.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(participantId);
        return next;
      });
    }
  };

  const handleReject = async (participantId: string, playerName: string) => {
    setProcessingIds((prev) => new Set(prev).add(participantId));

    try {
      await rejectParticipant.mutateAsync({ matchId, participantId });
      toast({
        title: 'Solicitação recusada',
        description: `A solicitação de ${playerName} foi removida.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao recusar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(participantId);
        return next;
      });
    }
  };

  if (waitingList.length === 0) {
    return (
      <div className="player-card p-6 text-center">
        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">
          Nenhuma solicitação pendente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-accent">Solicitações Pendentes</h3>
        <span className="presence-badge presence-waiting">
          {waitingList.length}
        </span>
      </div>

      {spotsLeft <= 0 && (
        <div className="player-card p-3 text-center border-destructive/50 bg-destructive/10 mb-4">
          <p className="text-sm text-destructive">
            Lista de confirmados está cheia. Remova alguém para aprovar novos jogadores.
          </p>
        </div>
      )}

      {waitingList.map((participant) => {
        const profile = participant.profiles;
        const isProcessing = processingIds.has(participant.id);
        const playerName = profile.nickname || profile.name;

        return (
          <div 
            key={participant.id} 
            className="player-card p-3 flex items-center gap-3"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={playerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{playerName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-secondary">{profile.position}</span>
                <span>OVR {profile.overall}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(participant.id, participant.user_id, playerName)}
                disabled={isProcessing || spotsLeft <= 0}
                className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => handleReject(participant.id, playerName)}
                disabled={isProcessing}
                className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
