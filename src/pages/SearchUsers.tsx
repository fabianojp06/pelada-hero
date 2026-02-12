import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { PlayerCard } from '@/components/PlayerCard';
import { supabase } from '@/integrations/supabase/client';
import { AtSign, Search, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  user_id: string;
  name: string;
  nickname: string | null;
  username: string | null;
  position: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  avatar_url: string | null;
}

const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const clean = query.replace('@', '').trim();
    if (clean.length < 2) return;

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${clean}%,name.ilike.%${clean}%,nickname.ilike.%${clean}%`)
        .limit(20);

      if (!error && data) {
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="BUSCAR JOGADORES">
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="@username ou nome"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12 bg-secondary border-muted"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 rounded-xl bg-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum jogador encontrado</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map((p) => (
            <div key={p.id} className="player-card p-4 flex items-center gap-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/30">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold">{p.nickname || p.name}</p>
                {p.username && (
                  <p className="text-xs text-primary">@{p.username}</p>
                )}
                <p className="text-xs text-muted-foreground">{p.position} · OVR {p.overall}</p>
              </div>
              <span className="text-2xl font-display gradient-text-gold">{p.overall}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SearchUsers;
