import { useEffect, useMemo, useReducer } from "react";

// Constants matching backend
const ANTI_SNIPING_THRESHOLD_MS = 30 * 1000; // 30 seconds
const WARNING_THRESHOLD_MS = 60 * 1000; // 1 minute

interface CountdownState {
  timeRemaining: number;
  isExpired: boolean;
}

type CountdownAction =
  | { type: "TICK"; endsAt: number }
  | { type: "EXTEND"; newEndsAt: number };

function countdownReducer(state: CountdownState, action: CountdownAction): CountdownState {
  if (action.type === "TICK") {
    const timeRemaining = action.endsAt - Date.now();
    if (timeRemaining <= 0) {
      return { timeRemaining: 0, isExpired: true };
    }
    return { timeRemaining, isExpired: false };
  }
  if (action.type === "EXTEND") {
    const timeRemaining = action.newEndsAt - Date.now();
    return { timeRemaining: Math.max(timeRemaining, 0), isExpired: timeRemaining <= 0 };
  }
  return state;
}

function formatTime(ms: number): string {
  if (ms <= 0) {
    return "00:00:00";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format with consistent width using tabular-nums
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function formatTimeCompact(ms: number): string {
  if (ms <= 0) {
    return "Encerrado";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

interface CountdownProps {
  endsAt: string;
  onExpire?: () => void;
  variant?: "default" | "compact" | "hero";
}

export function getTimeRemainingState(timeRemaining: number) {
  return {
    isExpired: timeRemaining <= 0,
    isCritical: timeRemaining > 0 && timeRemaining <= ANTI_SNIPING_THRESHOLD_MS,
    isWarning: timeRemaining > ANTI_SNIPING_THRESHOLD_MS && timeRemaining <= WARNING_THRESHOLD_MS,
    formattedTime: formatTime(timeRemaining),
    displayText: formatTimeCompact(timeRemaining),
  };
}

function getUrgencyColor(isExpired: boolean, isCritical: boolean, isWarning: boolean): string {
  if (isExpired) return "text-stone-500";
  if (isCritical) return "text-rose-600";
  if (isWarning) return "text-amber-600";
  return "text-slate-700";
}

function getTimerIconBgClass(isCritical: boolean): string {
  return isCritical ? "bg-rose-100" : "bg-stone-100";
}

function TimerIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function UrgencyIndicator({ isCritical, isExpired }: { isCritical: boolean; isExpired: boolean }) {
  if (isCritical && !isExpired) {
    return <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />;
  }
  return null;
}

function CriticalPulseIndicator() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
    </span>
  );
}

function CountdownStatusLabel({
  isExpired,
  isCritical,
  isWarning,
}: {
  isExpired: boolean;
  isCritical: boolean;
  isWarning: boolean;
}) {
  if (isExpired) {
    return <span className="text-sm font-medium text-stone-500">Leilão encerrado</span>;
  }
  if (isCritical) {
    return (
      <>
        <UrgencyIndicator isCritical={isCritical} isExpired={isExpired} />
        <span className="text-sm font-semibold uppercase tracking-wide text-rose-600">
          Prorrogação ativa: menos de 30s restante!
        </span>
      </>
    );
  }
  if (isWarning) {
    return <span className="text-sm font-medium text-amber-600">Terminando em breve</span>;
  }
  return <span className="text-sm text-slate-500">Tempo restante</span>;
}

function CompactCountdown({ timeState }: { timeState: ReturnType<typeof getTimeRemainingState> }) {
  const urgencyColor = getUrgencyColor(
    timeState.isExpired,
    timeState.isCritical,
    timeState.isWarning
  );

  return (
    <div className="flex items-center gap-1.5">
      {timeState.isCritical && !timeState.isExpired && <CriticalPulseIndicator />}
      <span
        className={`text-sm font-medium ${urgencyColor} ${
          timeState.isCritical ? "animate-countdown-pulse" : ""
        }`}
      >
        {timeState.displayText}
      </span>
    </div>
  );
}

function HeroCountdown({ timeState }: { timeState: ReturnType<typeof getTimeRemainingState> }) {
  const urgencyColor = getUrgencyColor(
    timeState.isExpired,
    timeState.isCritical,
    timeState.isWarning
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${getTimerIconBgClass(timeState.isCritical)}`}>
          <TimerIcon
            className={`h-5 w-5 ${
              timeState.isCritical ? "text-rose-600 animate-pulse" : "text-slate-600"
            }`}
          />
        </div>
        <div className="relative">
          <span
            className={`timer-display text-4xl font-bold tracking-wider ${urgencyColor} ${
              timeState.isCritical ? "animate-countdown-pulse relative z-10" : ""
            }`}
          >
            {timeState.formattedTime}
          </span>
          {timeState.isCritical && !timeState.isExpired && (
            <span className="absolute inset-0 font-mono text-4xl font-bold text-rose-600 opacity-40 blur-md">
              {timeState.formattedTime}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <CountdownStatusLabel
          isExpired={timeState.isExpired}
          isCritical={timeState.isCritical}
          isWarning={timeState.isWarning}
        />
      </div>
    </div>
  );
}

function DefaultCountdown({ timeState }: { timeState: ReturnType<typeof getTimeRemainingState> }) {
  const urgencyColor = getUrgencyColor(
    timeState.isExpired,
    timeState.isCritical,
    timeState.isWarning
  );

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`text-sm ${timeState.isCritical ? "text-rose-600 font-semibold" : "text-slate-500"}`}
      >
        Tempo restante:
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={`timer-display text-2xl font-bold tracking-wider ${urgencyColor} ${
            timeState.isCritical ? "animate-countdown-pulse" : ""
          }`}
        >
          {timeState.formattedTime}
        </span>
        {timeState.isCritical && !timeState.isExpired && (
          <div className="flex items-center gap-1.5">
            <UrgencyIndicator isCritical={timeState.isCritical} isExpired={timeState.isExpired} />
            <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              Prorrogação ativa
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Countdown({
  endsAt: initialEndsAt,
  onExpire,
  variant = "default",
}: CountdownProps) {
  const endsAtTime = useMemo(() => new Date(initialEndsAt).getTime(), [initialEndsAt]);

  const [state, dispatch] = useReducer(countdownReducer, {
    timeRemaining: endsAtTime - Date.now(),
    isExpired: endsAtTime <= Date.now(),
  });

  // Tick effect
  useEffect(() => {
    if (state.isExpired) {
      return;
    }
    const interval = setInterval(() => {
      dispatch({ type: "TICK", endsAt: endsAtTime });
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAtTime, state.isExpired]);

  // Expire callback
  useEffect(() => {
    if (state.isExpired && onExpire) {
      onExpire();
    }
  }, [state.isExpired, onExpire]);

  const timeState = getTimeRemainingState(state.timeRemaining);

  if (variant === "compact") {
    return <CompactCountdown timeState={timeState} />;
  }

  if (variant === "hero") {
    return <HeroCountdown timeState={timeState} />;
  }

  return <DefaultCountdown timeState={timeState} />;
}
