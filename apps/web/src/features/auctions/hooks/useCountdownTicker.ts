import { useEffect, useState } from "react";

interface UseCountdownTickerOptions {
  enabled?: boolean;
  intervalInMs?: number;
}

export function useCountdownTicker({
  enabled = true,
  intervalInMs = 1000,
}: UseCountdownTickerOptions = {}) {
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setCurrentTimestamp(Date.now());

    const intervalId = window.setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, intervalInMs);

    return () => window.clearInterval(intervalId);
  }, [enabled, intervalInMs]);

  return currentTimestamp;
}