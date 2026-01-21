import { Home, Calendar, MessageSquare, Users, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Calendar, label: 'Partidas', path: '/matches' },
  { icon: MessageSquare, label: 'Feed', path: '/feed' },
  { icon: Users, label: 'Times', path: '/teams' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="nav-item text-muted-foreground"
            activeClassName="active"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
