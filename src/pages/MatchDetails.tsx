import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PlayerCard } from '@/components/PlayerCard';
import { PlayerListItem } from '@/components/PlayerListItem';
import { TeamSorter } from '@/components/TeamSorter';
import { MatchInternalFeed } from '@/components/MatchInternalFeed';
import { mockMatch, mockCurrentPlayer, mockPlayers } from '@/data/mockData';
import { useUserMatches } from '@/contexts/UserMatchesContext';
import { 
  MapPin, Calendar, Clock, DollarSign, ArrowLeft, Users, Shuffle, 
  CheckCircle, MessageSquare, Edit, LogIn, LogOut 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock all matches for lookup
const allMatches = [
  mockMatch,
  {
    ...mockMatch,
    id: '2',
    title: 'Pelada de Terça',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    organizerId: '2',
    confirmedPlayers: mockPlayers.slice(2, 6),
    waitingList: [],
  },
  {
    ...mockMatch,
    id: '3',
    title: 'Pelada da Galera',
    location: 'Quadra do Parque',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    organizerId: '3',
    confirmedPlayers: mockPlayers.slice(0, 4),
    waitingList: [],
  },
];

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMatchJoined, joinMatch, leaveMatch, togglePayment, isPlayerPaid } = useUserMatches();
  
  const match = allMatches.find((m) => m.id === id) || mockMatch;
  const isJoined = isMatchJoined(match.id);
  
  const [activeTab, setActiveTab] = useState<'presence' | 'resenha' | 'teams'>('presence');
  const [isConfirmed, setIsConfirmed] = useState(
    match.confirmedPlayers.some((p) => p.id === mockCurrentPlayer.id)
  );
  
  // Check if current user is the organizer of THIS match
  const isOrganizer = match.organizerId === mockCurrentPlayer.id;
  const spotsLeft = match.maxPlayers - match.confirmedPlayers.length;

  const handleConfirm = () => {
    setIsConfirmed(!isConfirmed);
  };

  const handleJoinMatch = () => {
    joinMatch(match.id);
  };

  const handleLeaveMatch = () => {
    leaveMatch(match.id);
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

        {/* Organizer Badge */}
        {isOrganizer && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent/20 backdrop-blur-sm">
            <span className="text-xs font-bold text-accent">ORGANIZADOR</span>
          </div>
        )}

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
            <p className="text-sm font-bold">{format(match.date, 'dd/MM')}</p>
            <p className="text-xs text-muted-foreground">
              {format(match.date, 'EEE', { locale: ptBR })}
            </p>
          </div>
          <div className="player-card p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{match.time}</p>
            <p className="text-xs text-muted-foreground">Horário</p>
          </div>
          <div className="player-card p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-accent" />
            <p className="text-sm font-bold">R$ {match.price}</p>
            <p className="text-xs text-muted-foreground">Por pessoa</p>
          </div>
        </div>

        {/* Join/Leave Match Button (for non-members) */}
        {!isJoined ? (
          <button
            onClick={handleJoinMatch}
            className="w-full btn-gold py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Participar desta Pelada
          </button>
        ) : (
          <>
            {/* Organizer Admin Panel */}
            {isOrganizer && (
              <div className="player-card p-4 space-y-3 border-accent/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Painel do Organizador</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 rounded-xl bg-secondary flex items-center justify-center gap-2 text-sm hover:bg-muted transition-colors">
                    <Edit className="w-4 h-4 text-primary" />
                    Editar Partida
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-secondary flex items-center justify-center gap-2 text-sm hover:bg-muted transition-colors">
                    <DollarSign className="w-4 h-4 text-accent" />
                    Pagamentos
                  </button>
                </div>
              </div>
            )}

            {/* Confirm/Cancel Presence Button (for members) */}
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isConfirmed
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'btn-primary'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {isConfirmed ? 'Confirmado' : 'Confirmar'}
              </button>
              {!isOrganizer && (
                <button
                  onClick={handleLeaveMatch}
                  className="py-4 px-4 rounded-xl bg-destructive/20 text-destructive font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Tabs - Only show if joined */}
        {isJoined && (
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
              {isOrganizer && (
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
              )}
            </div>

            {/* Tab Content */}
            {activeTab === 'presence' && (
              <div className="space-y-6">
                {/* Confirmed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-primary">Confirmados</h3>
                    <span className="presence-badge presence-confirmed">
                      {match.confirmedPlayers.length}/{match.maxPlayers}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {match.confirmedPlayers.map((player) => (
                      <PlayerListItem
                        key={player.id}
                        player={player}
                        isOrganizer={isOrganizer}
                        isPaid={isPlayerPaid(match.id, player.id)}
                        onTogglePayment={isOrganizer ? () => togglePayment(match.id, player.id) : undefined}
                      />
                    ))}
                  </div>
                </div>

                {/* Waiting List */}
                {match.waitingList.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-accent">Lista de Espera</h3>
                      <span className="presence-badge presence-waiting">
                        {match.waitingList.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {match.waitingList.map((player) => (
                        <PlayerListItem
                          key={player.id}
                          player={player}
                          isOrganizer={isOrganizer}
                          isPaid={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resenha' && (
              <MatchInternalFeed matchId={match.id} />
            )}

            {activeTab === 'teams' && isOrganizer && (
              <TeamSorter players={match.confirmedPlayers} />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MatchDetails;
