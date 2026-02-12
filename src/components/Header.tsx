import { Bell, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showActions?: boolean;
}

export function Header({ title = 'PELADA FC', showActions = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-2xl font-display tracking-wider gradient-text-green">{title}</h1>
        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/search')}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
