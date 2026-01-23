import { Navigation } from 'lucide-react';

interface DistanceBadgeProps {
  distance: string;
}

export function DistanceBadge({ distance }: DistanceBadgeProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
      <Navigation className="w-3 h-3" />
      <span>{distance}</span>
    </div>
  );
}
