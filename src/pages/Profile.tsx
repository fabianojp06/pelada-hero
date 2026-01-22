import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { PlayerCard } from '@/components/PlayerCard';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import { positionLabels } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Edit3, Trophy, Target, Clock, Crown, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { PlayerPosition } from '@/types/database';

const positions: PlayerPosition[] = ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'ATA'];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition | null>(null);

  const currentPosition = selectedPosition || profile?.position || 'MEI';

  const handlePositionChange = async (pos: PlayerPosition) => {
    setSelectedPosition(pos);
    try {
      await updateProfile.mutateAsync({ position: pos });
      toast({
        title: 'Posição atualizada!',
        description: `Agora você é ${positionLabels[pos]}`,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta',
    });
  };

  if (authLoading || profileLoading) {
    return (
      <Layout title="PERFIL">
        <div className="p-4">
          <ProfileSkeleton />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title="PERFIL">
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Perfil não encontrado</p>
        </div>
      </Layout>
    );
  }

  const currentPlayer = {
    id: profile.id,
    name: profile.name,
    nickname: profile.nickname || profile.name.split(' ')[0],
    position: currentPosition,
    overall: profile.overall,
    attributes: {
      pace: profile.pace,
      shooting: profile.shooting,
      passing: profile.passing,
      dribbling: profile.dribbling,
      defending: profile.defending,
      physical: profile.physical,
    },
  };

  return (
    <Layout title="PERFIL">
      <div className="p-4 space-y-6">
        {/* Player Card */}
        <PlayerCard player={currentPlayer} />

        {/* Position Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl tracking-wider">POSIÇÃO</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-3 gap-2">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => handlePositionChange(pos)}
                  disabled={updateProfile.isPending}
                  className={`py-3 rounded-xl font-bold uppercase text-sm transition-all ${
                    currentPosition === pos
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          ) : (
            <div className="player-card p-4 flex items-center justify-between">
              <span className="text-muted-foreground">{positionLabels[currentPosition]}</span>
              <span className="position-badge">{currentPosition}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <h3 className="font-display text-xl tracking-wider">ESTATÍSTICAS</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="player-card p-4">
              <Trophy className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-display gradient-text-gold">-</p>
              <p className="text-xs text-muted-foreground">Vitórias</p>
            </div>
            <div className="player-card p-4">
              <Target className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-display gradient-text-green">-</p>
              <p className="text-xs text-muted-foreground">Gols</p>
            </div>
            <div className="player-card p-4">
              <Clock className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="text-2xl font-display">-</p>
              <p className="text-xs text-muted-foreground">Partidas</p>
            </div>
            <div className="player-card p-4">
              <Crown className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-display">-</p>
              <p className="text-xs text-muted-foreground">MVP</p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 rounded-xl bg-destructive/20 text-destructive font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
