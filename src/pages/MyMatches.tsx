import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { mockMatch, mockPlayers } from '@/data/mockData';
import { useUserMatches } from '@/contexts/UserMatchesContext';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';

// Mock all available matches (public)
const allMatches = [
  mockMatch,
  {
    ...mockMatch,
    id: '2',
    title: 'Pelada de Terça',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    organizerId: '2',
    isPublic: true,
  },
  {
    ...mockMatch,
    id: '3',
    title: 'Pelada da Galera',
    location: 'Quadra do Parque',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    organizerId: '3',
    isPublic: true,
  },
];

const MyMatches = () => {
  const navigate = useNavigate();
  const { joinedMatchIds } = useUserMatches();

  const myMatches = allMatches.filter((match) => joinedMatchIds.includes(match.id));

  return (
    <Layout title="MINHAS PELADAS">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          <p className="text-muted-foreground">
            Peladas que você participa
          </p>
        </div>

        {/* My Matches List */}
        {myMatches.length > 0 ? (
          <div className="space-y-3">
            {myMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                featured={match.id === '1'}
                onClick={() => navigate(`/matches/${match.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="player-card p-8 text-center space-y-4">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-bold text-lg">Nenhuma pelada ainda</p>
              <p className="text-muted-foreground text-sm">
                Explore as peladas públicas e participe!
              </p>
            </div>
            <button
              onClick={() => navigate('/matches')}
              className="btn-primary px-6 py-3 rounded-xl"
            >
              Explorar Peladas
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyMatches;
