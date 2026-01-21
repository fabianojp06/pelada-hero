import { Player } from '@/types';
import { positionLabels } from '@/data/mockData';
import { User } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  compact?: boolean;
}

const StatBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="font-bold text-primary">{value}</span>
    </div>
    <div className="stat-bar">
      <div className="stat-bar-fill" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export function PlayerCard({ player, compact = false }: PlayerCardProps) {
  if (compact) {
    return (
      <div className="player-card p-3 flex items-center gap-3 animate-scale-in">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold">{player.nickname}</p>
          <p className="text-xs text-muted-foreground">{positionLabels[player.position]}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-display gradient-text-gold">{player.overall}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="player-card p-6 animate-slide-up">
      {/* Header with Overall and Position */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-6xl font-display gradient-text-gold">{player.overall}</span>
          <div className="position-badge mt-2">{player.position}</div>
        </div>
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/30">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Name */}
      <div className="mb-6">
        <h2 className="text-3xl font-display tracking-wider">{player.nickname.toUpperCase()}</h2>
        <p className="text-sm text-muted-foreground">{player.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatBar label="RIT" value={player.attributes.pace} />
        <StatBar label="FIN" value={player.attributes.shooting} />
        <StatBar label="PAS" value={player.attributes.passing} />
        <StatBar label="DRI" value={player.attributes.dribbling} />
        <StatBar label="DEF" value={player.attributes.defending} />
        <StatBar label="FIS" value={player.attributes.physical} />
      </div>
    </div>
  );
}
