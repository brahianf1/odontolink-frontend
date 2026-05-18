import { useEffect, useState } from 'react';

/**
 * Decrements the seconds left until untilMs in real time.
 * Returns the remaining seconds, or 0 if not rate limited.
 */
export function useRateLimitCountdown(untilMs: number | null): number {
  const computeRemaining = (): number => {
    if (untilMs === null) return 0;
    const remaining = Math.ceil((untilMs - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(computeRemaining);

  useEffect(() => {
    if (untilMs === null) {
      setSecondsLeft(0);
      return;
    }
    setSecondsLeft(computeRemaining());
    const tick = () => {
      const remaining = Math.ceil((untilMs - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        return;
      }
      setSecondsLeft(remaining);
    };
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [untilMs]);

  return secondsLeft;
}
