import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PlayerCard } from '@/components/PlayerCard';
import { PlayerListItem } from '@/components/PlayerListItem';
import { SmartTeamSorter } from '@/components/SmartTeamSorter';
import { MatchInternalFeed } from '@/components/MatchInternalFeed';
import { WaitingListManager } from '@/components/WaitingListManager';
import { MatchCardSkeleton } from '@/components/MatchCardSkeleton';
import { MatchTimer } from '@/components/MatchTimer';
import { ShareMatch } from '@/components/ShareMatch';
import { useAuth } from '@/contexts/AuthContext';
import { useMatch, useJoinMatch, useLeaveMatch, useTogglePayment, useDeleteMatch } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, Calendar, Clock, DollarSign, ArrowLeft, Users, Shuffle, 
  CheckCircle, MessageSquare, Edit, LogIn, LogOut, Lock, Globe,
  UserCheck, Loader2, AlertCircle, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Player } from '@/types';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: match, isLoading, error } = useMatch(id);
  const joinMatch = useJoinMatch();
  const leaveMatch = useLeaveMatch();
  const togglePayment = useTogglePayment();
  const deleteMatch = useDeleteMatch();
  
  const [activeTab, setActiveTab] = useState<'presence' | 'resenha' | 'teams' | 'waiting'>('presence');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Computed values
  const isOrganizer = user?.id === match?.creator_id;
  
  const userParticipation = useMemo(() => {
    if (!match || !user) return null;
    return match.participants?.find((p: any) => p.user_id === user.id);
  }, [match, user]);

  const isJoined = !!userParticipation;
  const isConfirmed = userParticipation?.status === 'confirmed';
  const isWaiting = userParticipation?.status === 'waiting';

  const confirmedPlayers = useMemo(() => {
    if (!match) return [];
    return match.participants
      ?.filter((p: any) => p.status === 'confirmed')
      .map((p: any) => ({
        id: p.profiles?.id || p.user_id,
        user_id: p.user_id,
        name: p.profiles?.name || 'Jogador',
        nickname: p.profiles?.nickname || 'Jogador',
        position: (p.profiles?.position || 'MEI') as any,
        overall: p.profiles?.overall || 70,
        attributes: {
          pace: p.profiles?.pace || 70,
          shooting: p.profiles?.shooting || 70,
          passing: p.profiles?.passing || 70,
          dribbling: p.profiles?.dribbling || 70,
          defending: p.profiles?.defending || 70,
          physical: p.profiles?.physical || 70,
        },
        avatar: p.profiles?.avatar_url,
        phone: p.profiles?.phone || null,
        isOrganizer: p.user_id === match.creator_id,
      })) || [];
  }, [match]);

  const waitingList = useMemo(() => {
    if (!match) return [];
    return match.participants?.filter((p: any) => p.status === 'waiting') || [];
  }, [match]);

  const spotsLeft = match ? match.max_players - confirmedPlayers.length : 0;
  const playersPerSide = (match as any)?.players_per_side || 5;

  const handleJoinMatch = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await joinMatch.mutateAsync({ 
        matchId: match!.id, 
        isPublic: match!.is_public 
      });
      
      toast({
        title: match!.is_public ? 'Solicitação enviada!' : 'Você entrou na pelada!',
        description: match!.is_public 
          ? 'Aguarde a aprovação do organizador.'
          : 'Você foi adicionado à lista de confirmados.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao participar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveMatch = async () => {
    try {
      await leaveMatch.mutateAsync(match!.id);
      toast({
        title: 'Você saiu da pelada',
        description: 'Sua participação foi cancelada.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao sair',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePayment = async (playerId: string, currentlyPaid: boolean) => {
    try {
      await togglePayment.mutateAsync({
        matchId: match!.id,
        participantId: playerId,
        isPaid: !currentlyPaid,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar pagamento',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMatch = async () => {
    try {
      await deleteMatch.mutateAsync(match!.id);
      toast({
        title: 'Pelada excluída',
        description: 'A partida foi removida com sucesso.',
      });
      navigate('/my-matches');
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout showHeader={false}>
        <div className="p-4">
          <MatchCardSkeleton />
          <div className="mt-4 space-y-4">
            <div className="h-32 bg-secondary animate-pulse rounded-xl" />
            <div className="h-64 bg-secondary animate-pulse rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !match) {
    return (
      <Layout showHeader={false}>
        <div className="p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-secondary mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="player-card p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Pelada não encontrada</h2>
            <p className="text-muted-foreground">
              Esta pelada pode ter sido removida ou você não tem permissão para visualizá-la.
            </p>
            <button
              onClick={() => navigate('/matches')}
              className="mt-4 btn-primary px-6 py-2 rounded-xl"
            >
              Ver outras peladas
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const participantPaymentStatus = (playerId: string): boolean => {
    const participant = match.participants?.find((p: any) => p.user_id === playerId);
    return participant?.is_paid || false;
  };

  return (
    <Layout showHeader={false}>
      {/* Header with Map Background */}
      <div className="relative h-48 bg-gradient-to-b from-primary/20 to-background">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/50 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isOrganizer && (
            <div className="px-3 py-1 rounded-full bg-accent/20 backdrop-blur-sm">
              <span className="text-xs font-bold text-accent">ORGANIZADOR</span>
            </div>
          )}
          <div className={`px-3 py-1 rounded-full backdrop-blur-sm ${
            match.is_public ? 'bg-primary/20' : 'bg-muted/50'
          }`}>
            {match.is_public ? (
              <Globe className="w-4 h-4 text-primary" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-display tracking-wider">{match.title.toUpperCase()}</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{match.location}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Match Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="player-card p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{format(new Date(match.date + 'T00:00:00'), 'dd/MM')}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(match.date + 'T00:00:00'), 'EEE', { locale: ptBR })}
            </p>
          </div>
          <div className="player-card p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{match.time}</p>
            <p className="text-xs text-muted-foreground">Horário</p>
          </div>
          <div className="player-card p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-accent" />
            <p className="text-sm font-bold">R$ {Number(match.price).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Por pessoa</p>
          </div>
        </div>

        {/* Share Match */}
        <ShareMatch matchId={match.id} matchTitle={match.title} />

        {/* Match Timer */}
        {(isOrganizer || isConfirmed) && <MatchTimer />}

        {/* Action Buttons */}
        {!isJoined && !isOrganizer ? (
          <button
            onClick={handleJoinMatch}
            disabled={joinMatch.isPending}
            className="w-full btn-gold py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {joinMatch.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {match.is_public ? 'Solicitar Participação' : 'Participar desta Pelada'}
          </button>
        ) : isWaiting ? (
          <div className="space-y-3">
            <div className="player-card p-4 text-center border-accent/30 bg-accent/5">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="font-bold">Solicitação enviada</p>
              <p className="text-sm text-muted-foreground">
                Aguardando aprovação do organizador
              </p>
            </div>
            <button
              onClick={handleLeaveMatch}
              disabled={leaveMatch.isPending}
              className="w-full py-3 rounded-xl bg-destructive/20 text-destructive font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {leaveMatch.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              Cancelar Solicitação
            </button>
          </div>
        ) : (
          <>
            {/* Organizer Admin Panel */}
            {isOrganizer && (
              <div className="player-card p-4 space-y-3 border-accent/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Painel do Organizador</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/matches/${match.id}/edit`)}
                    className="flex-1 py-3 rounded-xl bg-secondary flex items-center justify-center gap-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Edit className="w-4 h-4 text-primary" />
                    Editar Partida
                  </button>
                  <button 
                    onClick={() => setActiveTab('waiting')}
                    className="flex-1 py-3 rounded-xl bg-secondary flex items-center justify-center gap-2 text-sm hover:bg-muted transition-colors relative"
                  >
                    <DollarSign className="w-4 h-4 text-accent" />
                    Pagamentos
                    {waitingList.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-xs flex items-center justify-center font-bold">
                        {waitingList.length}
                      </span>
                    )}
                  </button>
                </div>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-3 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center gap-2 text-sm hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Pelada
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                    <p className="text-sm text-center text-destructive font-bold">Tem certeza? Esta ação não pode ser desfeita.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-xl bg-secondary text-sm font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteMatch}
                        disabled={deleteMatch.isPending}
                        className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {deleteMatch.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm/Leave for non-organizers who are confirmed */}
            {!isOrganizer && isConfirmed && (
              <div className="flex gap-2">
                <div className="flex-1 py-4 rounded-xl bg-primary/20 text-primary border-2 border-primary font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Confirmado
                </div>
                <button
                  onClick={handleLeaveMatch}
                  disabled={leaveMatch.isPending}
                  className="py-4 px-4 rounded-xl bg-destructive/20 text-destructive font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {leaveMatch.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Tabs - Only show if joined or organizer */}
        {(isJoined || isOrganizer) && (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('presence')}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'presence'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                Lista
              </button>
              <button
                onClick={() => setActiveTab('resenha')}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'resenha'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Resenha
              </button>
            <button
                onClick={() => setActiveTab('teams')}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'teams'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                Sortear
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'presence' && (
              <div className="space-y-6">
                {/* Confirmed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-primary">Confirmados</h3>
                    <span className="presence-badge presence-confirmed">
                      {confirmedPlayers.length}/{match.max_players}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {confirmedPlayers.length > 0 ? (
                      confirmedPlayers.map((player: Player) => (
                        <PlayerListItem
                          key={player.id}
                          player={player}
                          isOrganizer={isOrganizer}
                          isPaid={participantPaymentStatus(player.id)}
                          showPhone={isOrganizer}
                          onTogglePayment={isOrganizer ? () => handleTogglePayment(player.id, participantPaymentStatus(player.id)) : undefined}
                        />
                      ))
                    ) : (
                      <div className="player-card p-6 text-center">
                        <p className="text-muted-foreground">Nenhum jogador confirmado ainda</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Waiting List - Only show to organizer */}
                {isOrganizer && waitingList.length > 0 && (
                  <WaitingListManager
                    matchId={match.id}
                    waitingList={waitingList}
                    maxPlayers={match.max_players}
                    confirmedCount={confirmedPlayers.length}
                  />
                )}
              </div>
            )}

            {activeTab === 'resenha' && (
              <MatchInternalFeed matchId={match.id} />
            )}

            {activeTab === 'teams' && (
              <SmartTeamSorter 
                players={confirmedPlayers} 
                playersPerSide={playersPerSide}
              />
            )}

            {activeTab === 'waiting' && isOrganizer && (
              <WaitingListManager
                matchId={match.id}
                waitingList={waitingList}
                maxPlayers={match.max_players}
                confirmedCount={confirmedPlayers.length}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MatchDetails;
