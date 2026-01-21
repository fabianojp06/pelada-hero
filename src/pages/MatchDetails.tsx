import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PlayerCard } from '@/components/PlayerCard';
import { TeamSorter } from '@/components/TeamSorter';
import { mockMatch, mockCurrentPlayer } from '@/data/mockData';
import { MapPin, Calendar, Clock, DollarSign, ArrowLeft, Users, Shuffle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'presence' | 'teams'>('presence');
  const [isConfirmed, setIsConfirmed] = useState(
    mockMatch.confirmedPlayers.some((p) => p.id === mockCurrentPlayer.id)
  );
  const isOrganizer = mockCurrentPlayer.isOrganizer;
  const spotsLeft = mockMatch.maxPlayers - mockMatch.confirmedPlayers.length;

  const handleConfirm = () => {
    setIsConfirmed(!isConfirmed);
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

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-display tracking-wider">{mockMatch.title.toUpperCase()}</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{mockMatch.location}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Match Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="player-card p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{format(mockMatch.date, 'dd/MM')}</p>
            <p className="text-xs text-muted-foreground">
              {format(mockMatch.date, 'EEE', { locale: ptBR })}
            </p>
          </div>
          <div className="player-card p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{mockMatch.time}</p>
            <p className="text-xs text-muted-foreground">Horário</p>
          </div>
          <div className="player-card p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-accent" />
            <p className="text-sm font-bold">R$ {mockMatch.price}</p>
            <p className="text-xs text-muted-foreground">Por pessoa</p>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            isConfirmed
              ? 'bg-primary/20 text-primary border-2 border-primary'
              : 'btn-primary'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          {isConfirmed ? 'Presença Confirmada' : 'Confirmar Presença'}
        </button>

        {/* Tabs */}
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
            Lista ({mockMatch.confirmedPlayers.length})
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
        {activeTab === 'presence' ? (
          <div className="space-y-6">
            {/* Confirmed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-primary">Confirmados</h3>
                <span className="presence-badge presence-confirmed">
                  {mockMatch.confirmedPlayers.length}/{mockMatch.maxPlayers}
                </span>
              </div>
              <div className="space-y-2">
                {mockMatch.confirmedPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} compact />
                ))}
              </div>
            </div>

            {/* Waiting List */}
            {mockMatch.waitingList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-accent">Lista de Espera</h3>
                  <span className="presence-badge presence-waiting">
                    {mockMatch.waitingList.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {mockMatch.waitingList.map((player) => (
                    <PlayerCard key={player.id} player={player} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <TeamSorter players={mockMatch.confirmedPlayers} />
        )}
      </div>
    </Layout>
  );
};

export default MatchDetails;
