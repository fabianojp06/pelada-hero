import { Layout } from '@/components/Layout';
import { TeamSorter } from '@/components/TeamSorter';
import { mockMatch } from '@/data/mockData';
import { Users } from 'lucide-react';

const Teams = () => {
  return (
    <Layout title="SORTEIO">
      <div className="p-4 space-y-6">
        <div className="player-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">{mockMatch.title}</h3>
              <p className="text-sm text-muted-foreground">
                {mockMatch.confirmedPlayers.length} jogadores confirmados
              </p>
            </div>
          </div>
        </div>

        <TeamSorter players={mockMatch.confirmedPlayers} />
      </div>
    </Layout>
  );
};

export default Teams;
