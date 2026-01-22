import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { MatchCardSkeleton } from '@/components/MatchCardSkeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/useMatches';
import { Plus, Globe } from 'lucide-react';

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: matches, isLoading } = useMatches(true);

  const transformMatch = (match: any) => ({
    id: match.id,
    title: match.title,
    location: match.location,
    address: match.address || '',
    date: new Date(match.date),
    time: match.time,
    price: Number(match.price),
    maxPlayers: match.max_players,
    confirmedPlayers: match.participants
      ?.filter((p: any) => p.status === 'confirmed')
      .map((p: any) => ({
        id: p.profiles?.id || p.user_id,
        name: p.profiles?.name || 'Jogador',
        nickname: p.profiles?.nickname || 'Jogador',
        position: p.profiles?.position || 'MEI',
        overall: p.profiles?.overall || 70,
        attributes: { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 },
      })) || [],
    waitingList: [],
    organizerId: match.creator_id,
  });

  const upcomingMatches = matches?.filter((m) => new Date(m.date) >= new Date()) || [];

  return (
    <Layout title="PARTIDAS">
      <div className="p-4 space-y-6">
        {user && (
          <button
            onClick={() => navigate('/matches/new')}
            className="w-full btn-gold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Pelada
          </button>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl tracking-wider">PELADAS PÚBLICAS</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <MatchCardSkeleton />
              <MatchCardSkeleton />
            </div>
          ) : upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={transformMatch(match)}
                onClick={() => navigate(`/matches/${match.id}`)}
              />
            ))
          ) : (
            <div className="player-card p-6 text-center">
              <p className="text-muted-foreground">Nenhuma pelada pública agendada</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Matches;
