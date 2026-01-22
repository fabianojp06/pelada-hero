import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isIOS && !isInstalled) {
    return (
      <div className="fixed bottom-20 left-4 right-4 p-4 rounded-xl bg-secondary border border-primary/20 shadow-lg z-50 animate-fade-in">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Share className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">Instale o Pelada Hero</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Toque em <span className="text-primary">Compartilhar</span> e depois em{' '}
              <span className="text-primary">"Adicionar à Tela Inicial"</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 p-4 rounded-xl bg-secondary border border-primary/20 shadow-lg z-50 animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">Instale o App</h3>
          <p className="text-xs text-muted-foreground">Acesse offline e receba notificações</p>
        </div>
        <Button
          onClick={promptInstall}
          size="sm"
          className="btn-primary"
        >
          Instalar
        </Button>
      </div>
    </div>
  );
};
