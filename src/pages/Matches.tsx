import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { mockMatch, mockCurrentPlayer, mockPlayers } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useUserMatches } from '@/contexts/UserMatchesContext';
import { Plus, Calendar, Globe } from 'lucide-react';

// All available matches (public)
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
    isPublic: true,
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
    isPublic: true,
  },
];

const Matches = () => {
  const navigate = useNavigate();
  const { isMatchJoined } = useUserMatches();
  const isOrganizer = mockCurrentPlayer.isOrganizer;

  // Sort matches: upcoming first
  const upcomingMatches = allMatches.filter((m) => m.date >= new Date());
  const pastMatches = [
    {
      ...mockMatch,
      id: 'past1',
      title: 'Pelada de Terça',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      ...mockMatch,
      id: 'past2',
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
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl tracking-wider">PELADAS PÚBLICAS</h3>
          </div>
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <div key={match.id} className="relative">
                <MatchCard
                  match={match}
                  featured={isMatchJoined(match.id)}
                  onClick={() => navigate(`/matches/${match.id}`)}
                />
                {isMatchJoined(match.id) && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
                    <span className="text-xs font-bold text-primary">PARTICIPANDO</span>
                  </div>
                )}
              </div>
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
