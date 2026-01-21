import { useState } from 'react';
import { Player, Team } from '@/types';
import { PlayerCard } from './PlayerCard';
import { Shuffle, Users } from 'lucide-react';

interface TeamSorterProps {
  players: Player[];
}

export function TeamSorter({ players }: TeamSorterProps) {
  const [teams, setTeams] = useState<{ vest: Player[]; noVest: Player[] } | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  const shuffleTeams = () => {
    setIsShuffling(true);
    
    // Simulate shuffle animation
    setTimeout(() => {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const half = Math.ceil(shuffled.length / 2);
      
      setTeams({
        vest: shuffled.slice(0, half),
        noVest: shuffled.slice(half),
      });
      setIsShuffling(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-bold">{players.length} jogadores</span>
        </div>
        <button
          onClick={shuffleTeams}
          disabled={players.length < 2 || isShuffling}
          className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
        >
          <Shuffle className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
          {isShuffling ? 'Sorteando...' : 'Sortear Times'}
        </button>
      </div>

      {teams && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team with Vest */}
          <div className="team-card team-card-vest">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-accent" />
              <h3 className="font-display text-xl tracking-wider">TIME COLETE</h3>
            </div>
            <div className="space-y-2">
              {teams.vest.map((player) => (
                <PlayerCard key={player.id} player={player} compact />
              ))}
            </div>
          </div>

          {/* Team without Vest */}
          <div className="team-card team-card-no-vest">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-primary" />
              <h3 className="font-display text-xl tracking-wider">TIME SEM COLETE</h3>
            </div>
            <div className="space-y-2">
              {teams.noVest.map((player) => (
                <PlayerCard key={player.id} player={player} compact />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
