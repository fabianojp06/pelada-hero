import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { PlayerCard } from '@/components/PlayerCard';
import { mockMatch, mockCurrentPlayer } from '@/data/mockData';
import { Plus, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const isOrganizer = mockCurrentPlayer.isOrganizer;

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1 animate-fade-in">
          <p className="text-muted-foreground">Fala,</p>
          <h2 className="text-3xl font-display tracking-wider">{mockCurrentPlayer.nickname.toUpperCase()}! 👋</h2>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          <div className="player-card p-3 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-accent" />
            <p className="text-xl font-display gradient-text-gold">12</p>
            <p className="text-xs text-muted-foreground">Vitórias</p>
          </div>
          <div className="player-card p-3 text-center">
            <Zap className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-xl font-display gradient-text-green">85</p>
            <p className="text-xs text-muted-foreground">Overall</p>
          </div>
          <div className="player-card p-3 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-xl font-display">28</p>
            <p className="text-xs text-muted-foreground">Partidas</p>
          </div>
        </div>

        {/* Next Match */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display tracking-wider">PRÓXIMA PELADA</h3>
            {isOrganizer && (
              <button
                onClick={() => navigate('/matches/new')}
                className="btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova
              </button>
            )}
          </div>
          <MatchCard
            match={mockMatch}
            featured
            onClick={() => navigate(`/matches/${mockMatch.id}`)}
          />
        </div>

        {/* Your Card */}
        <div className="space-y-3">
          <h3 className="text-xl font-display tracking-wider">SEU CARD</h3>
          <PlayerCard player={mockCurrentPlayer} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
