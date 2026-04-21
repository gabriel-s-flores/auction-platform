import { useEffect, useMemo, useReducer } from "react";

// Constants matching backend
const ANTI_SNIPING_THRESHOLD_MS = 30 * 1000; // 30 seconds
const WARNING_THRESHOLD_MS = 60 * 1000; // 1 minute
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

interface CountdownState {
  timeRemaining: number;
  isExpired: boolean;
}

interface TimeBreakdown {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownUnit {
  label: string;
  value: string;
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

function padTimeValue(value: number, minimumDigits = 2): string {
  return value.toString().padStart(minimumDigits, "0");
}

function getTimeBreakdown(ms: number): TimeBreakdown {
  if (ms <= 0) {
    return {
      years: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  let remainingSeconds = Math.floor(ms / 1000);

  const years = Math.floor(remainingSeconds / SECONDS_PER_YEAR);
  remainingSeconds %= SECONDS_PER_YEAR;

  const days = Math.floor(remainingSeconds / SECONDS_PER_DAY);
  remainingSeconds %= SECONDS_PER_DAY;

  const hours = Math.floor(remainingSeconds / SECONDS_PER_HOUR);
  remainingSeconds %= SECONDS_PER_HOUR;

  const minutes = Math.floor(remainingSeconds / SECONDS_PER_MINUTE);
  const seconds = remainingSeconds % SECONDS_PER_MINUTE;

  return {
    years,
    days,
    hours,
    minutes,
    seconds,
  };
}

function formatTimeBreakdown(parts: TimeBreakdown): string {
  const clock = `${padTimeValue(parts.hours)}:${padTimeValue(parts.minutes)}:${padTimeValue(parts.seconds)}`;
  const prefixes: string[] = [];

  if (parts.years > 0) {
    prefixes.push(`${parts.years}a`);
  }

  if (parts.years > 0 || parts.days > 0) {
    prefixes.push(`${parts.days}d`);
  }

  return prefixes.length > 0 ? `${prefixes.join(" ")} ${clock}` : clock;
}

function getVisibleTimeUnits(parts: TimeBreakdown): CountdownUnit[] {
  const units: CountdownUnit[] = [];

  if (parts.years > 0) {
    units.push({ label: "anos", value: padTimeValue(parts.years) });
  }

  if (parts.years > 0 || parts.days > 0) {
    units.push({ label: "dias", value: padTimeValue(parts.days) });
  }

  units.push(
    { label: "horas", value: padTimeValue(parts.hours) },
    { label: "min", value: padTimeValue(parts.minutes) },
    { label: "seg", value: padTimeValue(parts.seconds) }
  );

  return units;
}

function formatTime(ms: number): string {
  return formatTimeBreakdown(getTimeBreakdown(ms));
}

function formatTimeCompact(ms: number): string {
  if (ms <= 0) {
    return "Encerrado";
  }

  const { years, days, hours, minutes, seconds } = getTimeBreakdown(ms);

  if (years > 0) {
    return `${years}a ${days}d`;
  }

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
  const breakdown = getTimeBreakdown(timeRemaining);

  return {
    isExpired: timeRemaining <= 0,
    isCritical: timeRemaining > 0 && timeRemaining <= ANTI_SNIPING_THRESHOLD_MS,
    isWarning: timeRemaining > ANTI_SNIPING_THRESHOLD_MS && timeRemaining <= WARNING_THRESHOLD_MS,
    breakdown,
    formattedTime: formatTime(timeRemaining),
    displayText: formatTimeCompact(timeRemaining),
    units: getVisibleTimeUnits(breakdown),
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

function getTimerUnitSurfaceClass(isExpired: boolean, isCritical: boolean, isWarning: boolean): string {
  if (isExpired) {
    return "border-stone-200 bg-stone-100/80";
  }

  if (isCritical) {
    return "border-rose-200 bg-rose-50";
  }

  if (isWarning) {
    return "border-amber-200 bg-amber-50";
  }

  return "border-stone-200 bg-white";
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

interface TimeUnitCardProps {
  isAnimated?: boolean;
  label: string;
  surfaceClassName: string;
  value: string;
  valueClassName: string;
}

function TimeUnitCard({
  isAnimated = false,
  label,
  surfaceClassName,
  value,
  valueClassName,
}: TimeUnitCardProps) {
  return (
    <div
      className={`min-w-[88px] flex-1 rounded-2xl border px-3 py-3 sm:min-w-[96px] sm:px-3.5 ${surfaceClassName}`}
    >
      <span
        className={`timer-display block text-2xl leading-none sm:text-3xl ${valueClassName} ${
          isAnimated ? "animate-countdown-pulse" : ""
        }`}
      >
        {value}
      </span>
      <span className="mt-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
    </div>
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
  const timerUnitSurfaceClass = getTimerUnitSurfaceClass(
    timeState.isExpired,
    timeState.isCritical,
    timeState.isWarning
  );

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`rounded-full p-2.5 ${getTimerIconBgClass(timeState.isCritical)}`}>
            <TimerIcon
              className={`h-5 w-5 ${
                timeState.isCritical ? "text-rose-600 animate-pulse" : "text-slate-600"
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div
              aria-label={`Tempo restante: ${timeState.formattedTime}`}
              className="flex flex-wrap gap-2.5"
            >
              {timeState.units.map((unit) => (
                <TimeUnitCard
                  key={unit.label}
                  isAnimated={timeState.isCritical && unit.label === "seg"}
                  label={unit.label}
                  surfaceClassName={timerUnitSurfaceClass}
                  value={unit.value}
                  valueClassName={urgencyColor}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Tempo restante
          </span>
          <span className="text-xs text-slate-400">{timeState.formattedTime}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CountdownStatusLabel
            isExpired={timeState.isExpired}
            isCritical={timeState.isCritical}
            isWarning={timeState.isWarning}
          />
        </div>
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
