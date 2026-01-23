import { MapPin, X, Navigation, AlertCircle } from 'lucide-react';

interface LocationPermissionBannerProps {
  onRequestLocation: () => void;
  onDismiss: () => void;
  loading?: boolean;
  error?: string | null;
  permissionDenied?: boolean;
}

export function LocationPermissionBanner({
  onRequestLocation,
  onDismiss,
  loading = false,
  error,
  permissionDenied,
}: LocationPermissionBannerProps) {
  if (permissionDenied) {
    return (
      <div className="player-card p-4 border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Localização bloqueada</p>
            <p className="text-xs text-muted-foreground mt-1">
              Para ver peladas próximas, ative a localização nas configurações do seu navegador e recarregue a página.
            </p>
          </div>
          <button onClick={onDismiss} className="p-1 hover:bg-secondary rounded">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-card p-4 border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Erro de localização</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <button
              onClick={onRequestLocation}
              className="mt-2 text-xs text-primary font-bold"
            >
              Tentar novamente
            </button>
          </div>
          <button onClick={onDismiss} className="p-1 hover:bg-secondary rounded">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-card p-4 border-primary/30 bg-primary/5">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-sm">Encontre peladas perto de você</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ative a localização para ver as peladas mais próximas primeiro.
          </p>
          <button
            onClick={onRequestLocation}
            disabled={loading}
            className="mt-3 btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Navigation className="w-4 h-4 animate-pulse" />
                Obtendo localização...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Permitir localização
              </>
            )}
          </button>
        </div>
        <button onClick={onDismiss} className="p-1 hover:bg-secondary rounded">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
