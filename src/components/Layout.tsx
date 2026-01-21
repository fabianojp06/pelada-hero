import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showNav?: boolean;
}

export function Layout({ children, title, showHeader = true, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header title={title} />}
      <main className={`${showNav ? 'pb-20' : ''}`}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
