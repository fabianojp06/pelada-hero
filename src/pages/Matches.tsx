import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { mockMatch, mockCurrentPlayer } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';

const Matches = () => {
  const navigate = useNavigate();
  const isOrganizer = mockCurrentPlayer.isOrganizer;

  // Mock multiple matches
  const upcomingMatches = [mockMatch];
  const pastMatches = [
    {
      ...mockMatch,
      id: '2',
      title: 'Pelada de Terça',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      ...mockMatch,
      id: '3',
      title: 'Pelada Especial',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <Layout title="PARTIDAS">
      <div className="p-4 space-y-6">
        {/* Create Match Button (Organizer Only) */}
        {isOrganizer && (
          <button
            onClick={() => navigate('/matches/new')}
            className="w-full btn-gold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Pelada
          </button>
        )}

        {/* Upcoming Matches */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl tracking-wider">PRÓXIMAS</h3>
          </div>
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                featured
                onClick={() => navigate(`/matches/${match.id}`)}
              />
            ))
          ) : (
            <div className="player-card p-6 text-center">
              <p className="text-muted-foreground">Nenhuma pelada agendada</p>
            </div>
          )}
        </div>

        {/* Past Matches */}
        <div className="space-y-3">
          <h3 className="font-display text-xl tracking-wider text-muted-foreground">ANTERIORES</h3>
          {pastMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={() => navigate(`/matches/${match.id}`)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Matches;
