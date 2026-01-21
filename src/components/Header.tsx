import { Bell, Settings } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showActions?: boolean;
}

export function Header({ title = 'PELADA FC', showActions = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-2xl font-display tracking-wider gradient-text-green">{title}</h1>
        {showActions && (
          <div className="flex items-center gap-2">
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
