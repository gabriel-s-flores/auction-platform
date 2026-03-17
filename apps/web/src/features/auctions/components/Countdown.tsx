import { useEffect, useReducer, useState } from "react";

// Constants matching backend
const ANTI_SNIPING_THRESHOLD_MS = 30 * 1000; // 30 seconds

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
 return {
 timeRemaining: Math.max(timeRemaining, 0),
 isExpired: timeRemaining <= 0,
 };
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

 if (days > 0) {
 return `${days}d ${hours}h`;
 }

 if (hours > 0) {
 return `${hours}h ${minutes}m`;
 }

 return `${minutes}m`;
}

interface CountdownProps {
 endsAt: string;
 onExpire?: () => void;
 variant?: "default" | "compact";
}

function getCompactTextColor(isExpired: boolean, isCritical: boolean): string {
 if (isExpired) {
 return "text-rose-600 font-medium";
 }
 if (isCritical) {
 return "text-red-600 font-semibold";
 }
 return "text-slate-600";
}

function getTimerTextColor(isExpired: boolean, isCritical: boolean): string {
 if (isExpired) {
 return "text-rose-600";
 }
 if (isCritical) {
 return "text-red-600 animate-pulse";
 }
 return "text-slate-900";
}

export function Countdown({ endsAt: initialEndsAt, onExpire, variant = "default" }: CountdownProps) {
 const [endsAt, setEndsAt] = useState(initialEndsAt);
 const endsAtTime = new Date(endsAt).getTime();

 const [state, dispatch] = useReducer(countdownReducer, {
 timeRemaining: endsAtTime - Date.now(),
 isExpired: endsAtTime <= Date.now(),
 });

 // Allow external updates to endsAt (e.g., from WebSocket)
 useEffect(() => {
 if (endsAt !== initialEndsAt) {
 setEndsAt(initialEndsAt);
 dispatch({ type: "EXTEND", newEndsAt: new Date(initialEndsAt).getTime() });
 }
 }, [endsAt, initialEndsAt]);

 useEffect(() => {
 if (state.isExpired) {
 return;
 }

 const interval = setInterval(() => {
 dispatch({ type: "TICK", endsAt: endsAtTime });
 }, 1000);

 return () => {
 clearInterval(interval);
 };
 }, [endsAtTime, state.isExpired]);

 useEffect(() => {
 if (state.isExpired && onExpire) {
 onExpire();
 }
 }, [state.isExpired, onExpire]);

 // Determine if in critical zone (< 30 seconds)
 const isCritical = state.timeRemaining > 0 && state.timeRemaining <= ANTI_SNIPING_THRESHOLD_MS;

 if (variant === "compact") {
 return (
 <span className={`text-sm ${getCompactTextColor(state.isExpired, isCritical)}`}>
 {formatTimeCompact(state.timeRemaining)}
 </span>
 );
 }

 return (
 <div className="flex flex-col gap-1">
 <span className={`text-sm ${isCritical ? "text-red-600 font-semibold" : "text-slate-600"}`}>
 Tempo restante:
 </span>

 {/* Critical zone styling with pulse animation */}
 <div className={`relative ${isCritical ? "animate-pulse-subtle" : ""}`}>
 <span
 className={`font-mono text-2xl font-bold ${getTimerTextColor(state.isExpired, isCritical)}`}
 style={
 isCritical
 ? {
 textShadow: "0 0 10px rgba(220, 38, 38, 0.5)",
 }
 : undefined
 }
 >
 {formatTime(state.timeRemaining)}
 </span>

 {/* Red glow effect for critical state */}
 {isCritical && (
 <span
 className="absolute inset-0 font-mono text-2xl font-bold text-red-600 opacity-50 blur-sm animate-pulse"
 aria-hidden="true"
 >
 {formatTime(state.timeRemaining)}
 </span>
 )}
 </div>

 {/* Extension notice */}
 {isCritical && !state.isExpired && (
 <div className="flex items-center gap-1.5 mt-1">
 <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse" />
 <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
 PRORROGAÇÃO ATIVA: {"<"} 30s restante!
 </span>
 </div>
 )}

 {state.isExpired && (
 <span className="text-sm font-medium text-rose-600">Leilão encerrado</span>
 )}
 </div>
 );
}
