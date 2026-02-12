import { useState, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export function MatchTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    startTimeRef.current = Date.now() - elapsed * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [running, elapsed]);

  const pause = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
  }, []);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="player-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Timer className="w-5 h-5 text-primary" />
        <span className="font-display text-3xl tracking-wider tabular-nums">
          {mins}:{secs}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!running ? (
          <button
            onClick={start}
            className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            <Play className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={pause}
            className="p-2 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
          >
            <Pause className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={reset}
          className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
