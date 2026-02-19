import { Layout } from '@/components/Layout';
import { MatchCard } from '@/components/MatchCard';
import { MatchCardSkeleton } from '@/components/MatchCardSkeleton';
import { mockMatch, mockCurrentPlayer, positionLabels } from '@/data/mockData';
import { Plus, TrendingUp, Trophy, Zap, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: matches, isLoading: matchesLoading } = useMatches();

  // Get next upcoming match (future only)
  const today = (() => {const d = new Date();return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;})();
  const nextMatch = matches?.filter((m) => m.date >= today)?.[0];

  // Build player data from profile or use mock
  const currentPlayer = profile ? {
    id: profile.id,
    name: profile.name,
    nickname: profile.nickname || profile.name.split(' ')[0],
    position: profile.position,
    overall: profile.overall,
    attributes: {
      pace: profile.pace,
      shooting: profile.shooting,
      passing: profile.passing,
      dribbling: profile.dribbling,
      defending: profile.defending,
      physical: profile.physical
    },
    isOrganizer: false // Will be determined per match
  } : mockCurrentPlayer;

  const isLoading = authLoading || user && profileLoading;

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1 animate-fade-in">
          {isLoading ?
          <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-40 bg-muted rounded animate-pulse" />
            </div> :
          user ?
          <>
              <p className="text-muted-foreground">Fala, jogador</p>
              <h2 className="text-3xl font-display tracking-wider">
                {(profile?.nickname || profile?.name?.split(' ')[0] || 'JOGADOR').toUpperCase()}! 👋
              </h2>
            </> :

          <>
              <p className="text-muted-foreground">Bem-vindo ao</p>
              <h2 className="text-3xl font-display tracking-wider">PELADA HERO! ⚽</h2>
            </>
          }
        </div>

        {/* Login prompt for unauthenticated users */}
        {!authLoading && !user &&
        <div className="player-card p-4 border-primary/30 card-glow animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold">Entre para participar</h4>
                <p className="text-sm text-muted-foreground">
                  Crie sua conta e organize suas peladas
                </p>
              </div>
              <Link to="/auth">
                <Button className="btn-primary">Entrar</Button>
              </Link>
            </div>
          </div>
        }

        {/* Quick Stats - only for authenticated users */}
        {user &&
        <div className="grid grid-cols-3 gap-3 animate-slide-up">
            <div className="player-card p-3 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-accent" />
              <p className="text-xl font-display gradient-text-gold">-</p>
              <p className="text-xs text-muted-foreground">Vitórias</p>
            </div>
            <div className="player-card p-3 text-center">
              <Zap className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xl font-display gradient-text-green">{profile?.overall || '-'}</p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
            <div className="player-card p-3 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xl font-display">-</p>
              <p className="text-xs text-muted-foreground">Partidas</p>
            </div>
          </div>
        }

        {/* Next Match */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display tracking-wider">PRÓXIMA PELADA</h3>
            {user &&
            <button
              onClick={() => navigate('/matches/new')}
              className="btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2">

                <Plus className="w-4 h-4" />
                Nova
              </button>
            }
          </div>
          
          {matchesLoading ?
          <MatchCardSkeleton /> :
          nextMatch ?
          <MatchCard
            match={{
              id: nextMatch.id,
              title: nextMatch.title,
              location: nextMatch.location,
              address: nextMatch.address || '',
              date: new Date(nextMatch.date + 'T00:00:00'),
              time: nextMatch.time,
              price: Number(nextMatch.price),
              maxPlayers: nextMatch.max_players,
              confirmedPlayers: nextMatch.participants?.
              filter((p: any) => p.status === 'confirmed').
              map((p: any) => ({
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
                  physical: p.profiles?.physical || 70
                }
              })) || [],
              waitingList: nextMatch.participants?.
              filter((p: any) => p.status === 'waiting').
              map((p: any) => ({
                id: p.profiles?.id || p.user_id,
                name: p.profiles?.name || 'Jogador',
                nickname: p.profiles?.nickname || 'Jogador',
                position: p.profiles?.position || 'MEI',
                overall: p.profiles?.overall || 70,
                attributes: {
                  pace: 70, shooting: 70, passing: 70,
                  dribbling: 70, defending: 70, physical: 70
                }
              })) || [],
              organizerId: nextMatch.creator_id
            }}
            featured
            onClick={() => navigate(`/matches/${nextMatch.id}`)} /> :


          <div className="player-card p-6 text-center">
              <p className="text-muted-foreground">Nenhuma pelada agendada</p>
              {user &&
            <button
              onClick={() => navigate('/matches/new')}
              className="mt-4 btn-primary px-6 py-2 rounded-xl">

                  Criar Pelada
                </button>
            }
            </div>
          }
        </div>

        {/* Sports Ads Section */}
        <div className="space-y-3 animate-slide-up">
          <h3 className="text-xl font-display tracking-wider">DESTAQUES</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="player-card p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">👟</span>
              </div>
              <p className="font-bold text-sm">Chuteiras</p>
              <p className="text-xs text-muted-foreground">A partir de R$ 199</p>
            </div>
            <div className="player-card p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl">👕</span>
              </div>
              <p className="font-bold text-sm">Uniformes</p>
              <p className="text-xs text-muted-foreground">Personalizados</p>
            </div>
            <div className="player-card p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🏋️</span>
              </div>
              <p className="font-bold text-sm">Suplementos</p>
              <p className="text-xs text-muted-foreground">Whey & Creatina</p>
            </div>
            <div className="player-card p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl">⚽</span>
              </div>
              <p className="font-bold text-sm">Acessórios</p>
              <p className="text-xs text-muted-foreground">Bolas & Caneleiras</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>);

};

export default Index;