import { Player } from '@/types';
import { DollarSign, Check, User } from 'lucide-react';
import { positionLabels } from '@/data/mockData';

interface PlayerListItemProps {
  player: Player;
  isOrganizer: boolean;
  isPaid: boolean;
  onTogglePayment?: () => void;
}

export function PlayerListItem({ player, isOrganizer, isPaid, onTogglePayment }: PlayerListItemProps) {
  return (
    <div className="player-card p-3 flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
        {player.avatar ? (
          <img src={player.avatar} alt={player.nickname} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold truncate">{player.nickname}</p>
          {player.isOrganizer && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
              Dono
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="position-badge">{positionLabels[player.position]}</span>
          <span>OVR {player.overall}</span>
        </div>
      </div>

      {/* Payment Status (Organizer Only) */}
      {isOrganizer && onTogglePayment && (
        <button
          onClick={onTogglePayment}
          className={`p-2 rounded-full transition-all ${
            isPaid
              ? 'bg-primary/20 text-primary'
              : 'bg-secondary text-muted-foreground hover:bg-accent/20 hover:text-accent'
          }`}
          title={isPaid ? 'Pagamento confirmado' : 'Marcar como pago'}
        >
          {isPaid ? (
            <Check className="w-5 h-5" />
          ) : (
            <DollarSign className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}
