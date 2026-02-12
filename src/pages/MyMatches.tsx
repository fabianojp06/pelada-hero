import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { MatchCardSkeleton } from '@/components/MatchCardSkeleton';
import { useMyMatches } from '@/hooks/useMatches';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';

const MyMatches = () => {
  const navigate = useNavigate();
  const { data: matches, isLoading } = useMyMatches();

  const now = new Date();
  const upcoming = matches?.filter((m) => new Date(m.date) >= new Date(now.toISOString().split('T')[0])) || [];
  const past = matches?.filter((m) => new Date(m.date) < new Date(now.toISOString().split('T')[0])) || [];

  const mapMatch = (m: any) => ({
    id: m.id,
    title: m.title,
    location: m.location,
    address: m.address || '',
    date: new Date(m.date),
    time: m.time,
    price: Number(m.price),
    maxPlayers: m.max_players,
    confirmedPlayers:
      m.participants
        ?.filter((p: any) => p.status === 'confirmed')
        .map((p: any) => ({
          id: p.profiles?.id || p.user_id,
          name: p.profiles?.name || 'Jogador',
          nickname: p.profiles?.nickname || 'Jogador',
          position: p.profiles?.position || 'MEI',
          overall: p.profiles?.overall || 70,
          attributes: {
            pace: p.profiles?.pace || 70,
            shooting: p.profiles?.shooting || 70,
            passing: p.profiles?.passing || 70,
            dribbling: p.profiles?.dribbling || 70,
            defending: p.profiles?.defending || 70,
            physical: p.profiles?.physical || 70,
          },
        })) || [],
    waitingList:
      m.participants
        ?.filter((p: any) => p.status === 'waiting')
        .map((p: any) => ({
          id: p.profiles?.id || p.user_id,
          name: p.profiles?.name || 'Jogador',
          nickname: p.profiles?.nickname || 'Jogador',
          position: p.profiles?.position || 'MEI',
          overall: p.profiles?.overall || 70,
          attributes: {
            pace: 70, shooting: 70, passing: 70,
            dribbling: 70, defending: 70, physical: 70,
          },
        })) || [],
    organizerId: m.creator_id,
  });

  return (
    <Layout title="MINHAS PELADAS">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          <p className="text-muted-foreground">Peladas que você participa</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        ) : upcoming.length > 0 || past.length > 0 ? (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Próximas</h3>
                {upcoming.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={mapMatch(m)}
                    onClick={() => navigate(`/matches/${m.id}`)}
                  />
                ))}
              </div>
            )}
            {past.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Passadas</h3>
                {past.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={mapMatch(m)}
                    onClick={() => navigate(`/matches/${m.id}`)}
                  />
                ))}
              </div>
            )}
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
