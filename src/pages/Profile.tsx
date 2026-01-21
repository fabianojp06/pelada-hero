import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { PlayerCard } from '@/components/PlayerCard';
import { mockCurrentPlayer, positionLabels } from '@/data/mockData';
import { Position } from '@/types';
import { Edit3, Trophy, Target, Clock, Crown } from 'lucide-react';

const positions: Position[] = ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'ATA'];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position>(mockCurrentPlayer.position);

  return (
    <Layout title="PERFIL">
      <div className="p-4 space-y-6">
        {/* Player Card */}
        <PlayerCard player={{ ...mockCurrentPlayer, position: selectedPosition }} />

        {/* Position Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl tracking-wider">POSIÇÃO</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-3 gap-2">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`py-3 rounded-xl font-bold uppercase text-sm transition-all ${
                    selectedPosition === pos
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          ) : (
            <div className="player-card p-4 flex items-center justify-between">
              <span className="text-muted-foreground">{positionLabels[selectedPosition]}</span>
              <span className="position-badge">{selectedPosition}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <h3 className="font-display text-xl tracking-wider">ESTATÍSTICAS</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="player-card p-4">
              <Trophy className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-display gradient-text-gold">12</p>
              <p className="text-xs text-muted-foreground">Vitórias</p>
            </div>
            <div className="player-card p-4">
              <Target className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-display gradient-text-green">47</p>
              <p className="text-xs text-muted-foreground">Gols</p>
            </div>
            <div className="player-card p-4">
              <Clock className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="text-2xl font-display">28</p>
              <p className="text-xs text-muted-foreground">Partidas</p>
            </div>
            <div className="player-card p-4">
              <Crown className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-display">3</p>
              <p className="text-xs text-muted-foreground">MVP</p>
            </div>
          </div>
        </div>

        {/* Organizer Badge */}
        {mockCurrentPlayer.isOrganizer && (
          <div className="player-card p-4 border-accent/50 card-glow-gold">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-bold gradient-text-gold">Organizador</h4>
                <p className="text-sm text-muted-foreground">
                  Você pode criar e gerenciar peladas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
