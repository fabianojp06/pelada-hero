import { useState, useMemo } from 'react';
import { Player } from '@/types';
import { PlayerCard } from './PlayerCard';
import { Shuffle, Users, Zap, Trophy } from 'lucide-react';

interface SmartTeamSorterProps {
  players: Player[];
  playersPerSide: number;
}

interface Team {
  name: string;
  players: Player[];
  averageOverall: number;
}

export function SmartTeamSorter({ players, playersPerSide }: SmartTeamSorterProps) {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [sortMode, setSortMode] = useState<'balanced' | 'random'>('balanced');

  const numTeams = useMemo(() => {
    if (players.length <= playersPerSide * 2) return 2;
    return Math.ceil(players.length / playersPerSide);
  }, [players.length, playersPerSide]);

  const balancedSort = (playerList: Player[]): Team[] => {
    // Sort players by overall rating descending
    const sortedPlayers = [...playerList].sort((a, b) => b.overall - a.overall);
    
    // Initialize teams
    const teamArrays: Player[][] = Array.from({ length: numTeams }, () => []);
    const teamTotals: number[] = Array.from({ length: numTeams }, () => 0);
    
    // Snake draft: distribute players to balance teams
    sortedPlayers.forEach((player) => {
      // Find the team with lowest total overall
      let minIndex = 0;
      let minTotal = teamTotals[0];
      
      for (let i = 1; i < numTeams; i++) {
        // Also consider team size to keep teams even
        const adjustedTotal = teamTotals[i] + (teamArrays[i].length * 5);
        const adjustedMin = minTotal + (teamArrays[minIndex].length * 5);
        
        if (adjustedTotal < adjustedMin && teamArrays[i].length < playersPerSide) {
          minIndex = i;
          minTotal = teamTotals[i];
        }
      }
      
      teamArrays[minIndex].push(player);
      teamTotals[minIndex] += player.overall;
    });
    
    const teamNames = ['Time A', 'Time B', 'Time C', 'Time D', 'Time E'];
    
    return teamArrays.map((teamPlayers, index) => ({
      name: teamNames[index] || `Time ${index + 1}`,
      players: teamPlayers,
      averageOverall: teamPlayers.length > 0 
        ? Math.round(teamPlayers.reduce((sum, p) => sum + p.overall, 0) / teamPlayers.length)
        : 0,
    }));
  };

  const randomSort = (playerList: Player[]): Team[] => {
    const shuffled = [...playerList].sort(() => Math.random() - 0.5);
    const teamArrays: Player[][] = Array.from({ length: numTeams }, () => []);
    
    shuffled.forEach((player, index) => {
      const teamIndex = index % numTeams;
      if (teamArrays[teamIndex].length < playersPerSide) {
        teamArrays[teamIndex].push(player);
      } else {
        // Find a team with space
        for (let i = 0; i < numTeams; i++) {
          if (teamArrays[i].length < playersPerSide) {
            teamArrays[i].push(player);
            break;
          }
        }
      }
    });
    
    const teamNames = ['Time A', 'Time B', 'Time C', 'Time D', 'Time E'];
    
    return teamArrays.map((teamPlayers, index) => ({
      name: teamNames[index] || `Time ${index + 1}`,
      players: teamPlayers,
      averageOverall: teamPlayers.length > 0 
        ? Math.round(teamPlayers.reduce((sum, p) => sum + p.overall, 0) / teamPlayers.length)
        : 0,
    }));
  };

  const shuffleTeams = () => {
    setIsShuffling(true);
    
    setTimeout(() => {
      const sortedTeams = sortMode === 'balanced' 
        ? balancedSort(players) 
        : randomSort(players);
      setTeams(sortedTeams);
      setIsShuffling(false);
    }, 1000);
  };

  const overallDifference = useMemo(() => {
    if (!teams || teams.length < 2) return 0;
    const overalls = teams.map(t => t.averageOverall);
    return Math.max(...overalls) - Math.min(...overalls);
  }, [teams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-bold">{players.length} jogadores</span>
          <span className="text-muted-foreground text-sm">
            ({playersPerSide} x {playersPerSide})
          </span>
        </div>
      </div>

      {/* Sort Mode Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSortMode('balanced')}
          className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            sortMode === 'balanced'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Zap className="w-4 h-4" />
          Equilibrado
        </button>
        <button
          onClick={() => setSortMode('random')}
          className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            sortMode === 'random'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          Aleatório
        </button>
      </div>

      {/* Shuffle Button */}
      <button
        onClick={shuffleTeams}
        disabled={players.length < 2 || isShuffling}
        className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Shuffle className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
        {isShuffling ? 'Sorteando...' : 'Sortear Times'}
      </button>

      {/* Teams Display */}
      {teams && (
        <>
          {/* Balance Indicator */}
          {sortMode === 'balanced' && (
            <div className={`player-card p-3 text-center ${
              overallDifference <= 3 ? 'border-primary' : overallDifference <= 6 ? 'border-accent' : 'border-destructive'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <Trophy className={`w-5 h-5 ${
                  overallDifference <= 3 ? 'text-primary' : overallDifference <= 6 ? 'text-accent' : 'text-destructive'
                }`} />
                <span className="font-bold">
                  {overallDifference <= 3 
                    ? 'Times bem equilibrados!' 
                    : overallDifference <= 6 
                      ? 'Times razoavelmente equilibrados' 
                      : 'Diferença significativa entre times'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Diferença média: {overallDifference} pontos
              </p>
            </div>
          )}

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team, index) => (
              <div 
                key={team.name} 
                className={`team-card ${index === 0 ? 'team-card-vest' : 'team-card-no-vest'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded ${index === 0 ? 'bg-accent' : 'bg-primary'}`} />
                    <h3 className="font-display text-xl tracking-wider">{team.name.toUpperCase()}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Média:</span>
                    <span className="font-bold text-primary">{team.averageOverall}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {team.players.map((player) => (
                    <PlayerCard key={player.id} player={player} compact />
                  ))}
                  {team.players.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Sem jogadores
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Instructions */}
      {!teams && (
        <div className="player-card p-6 text-center">
          <p className="text-muted-foreground">
            {sortMode === 'balanced' 
              ? 'O sorteio equilibrado usa os atributos técnicos (Overall) para criar times justos.'
              : 'O sorteio aleatório distribui os jogadores sem considerar habilidades.'}
          </p>
        </div>
      )}
    </div>
  );
}
