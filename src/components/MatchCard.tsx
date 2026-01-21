import { Match } from '@/types';
import { MapPin, Calendar, Clock, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MatchCardProps {
  match: Match;
  featured?: boolean;
  onClick?: () => void;
}

export function MatchCard({ match, featured = false, onClick }: MatchCardProps) {
  const spotsLeft = match.maxPlayers - match.confirmedPlayers.length;
  const isFull = spotsLeft <= 0;

  return (
    <div
      className={`match-card cursor-pointer transition-transform hover:scale-[1.02] ${
        featured ? 'match-card-featured animate-pulse-glow' : ''
      }`}
      onClick={onClick}
    >
      {featured && (
        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
          PRÓXIMA
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-display tracking-wider">{match.title.toUpperCase()}</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{match.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(match.date, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{match.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">
                {match.confirmedPlayers.length}/{match.maxPlayers}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold">R$ {match.price}</span>
            </div>
          </div>

          <span
            className={`presence-badge ${
              isFull ? 'presence-waiting' : 'presence-confirmed'
            }`}
          >
            {isFull ? `${match.waitingList.length} na espera` : `${spotsLeft} vagas`}
          </span>
        </div>
      </div>
    </div>
  );
}
