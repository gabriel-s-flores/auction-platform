import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "./Button";

type CustomDatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
  placeholder?: string;
  min?: string;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseValue(value: string) {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split("T");
  if (!datePart) {
    return null;
  }

  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const [hours = 0, minutes = 0] = (timePart ?? "").split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatValue(date: Date, includeTime: boolean, time: string) {
  const dateValue = toDateKey(date);
  return includeTime ? `${dateValue}T${time}` : dateValue;
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function CustomDatePicker({
  id,
  value,
  onChange,
  includeTime = false,
  placeholder = includeTime ? "Selecione data e hora" : "Selecione uma data",
  min,
  disabled = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: CustomDatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const selectedDate = useMemo(() => parseValue(value), [value]);
  const minDate = useMemo(() => parseValue(min ?? ""), [min]);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());
  const [focusedDate, setFocusedDate] = useState(() => selectedDate ?? new Date());
  const [time, setTime] = useState(() => value.split("T")[1]?.slice(0, 5) ?? "12:00");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate);
      setFocusedDate(selectedDate);
      setTime(value.split("T")[1]?.slice(0, 5) ?? "12:00");
    }
  }, [selectedDate, value]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const monthDays = getMonthDays(visibleMonth);
  const selectedKey = selectedDate ? toDateKey(selectedDate) : "";
  const focusedKey = toDateKey(focusedDate);
  const displayValue = selectedDate
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        ...(includeTime ? { timeStyle: "short" as const } : {}),
      }).format(selectedDate)
    : "";

  function commitDate(date: Date, nextTime = time) {
    onChange(formatValue(date, includeTime, nextTime));
    setFocusedDate(date);
    setVisibleMonth(date);
    if (!includeTime) {
      setIsOpen(false);
    }
  }

  function moveFocus(days: number) {
    const next = new Date(focusedDate);
    next.setDate(focusedDate.getDate() + days);
    setFocusedDate(next);
    setVisibleMonth(next);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-invalid={ariaInvalid}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 outline-hidden transition hover:border-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        disabled={disabled}
        id={inputId}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={displayValue ? "" : "text-slate-400"}>{displayValue || placeholder}</span>
      </button>

      {isOpen ? (
        <div
          aria-label="Calendário"
          className="absolute z-30 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-xl"
          role="dialog"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              aria-label="Mês anterior"
              className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-100"
              type="button"
              onClick={() =>
                setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <p className="text-sm font-semibold text-slate-900">
              {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(visibleMonth)}
            </p>
            <button
              aria-label="Próximo mês"
              className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-100"
              type="button"
              onClick={() =>
                setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1" role="grid">
            {monthDays.map((date) => {
              const key = toDateKey(date);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = key === selectedKey;
              const isFocused = key === focusedKey;
              const isDisabled = minDate ? date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`h-9 rounded-md text-sm transition focus:outline-hidden focus:ring-2 focus:ring-amber-100 ${
                    isSelected
                      ? "bg-amber-600 font-semibold text-white hover:bg-amber-700"
                      : "text-slate-800 hover:bg-amber-50"
                  } ${isCurrentMonth ? "" : "text-slate-400"} ${isFocused && !isSelected ? "ring-2 ring-amber-100" : ""} disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent`}
                  disabled={isDisabled}
                  key={key}
                  type="button"
                  onClick={() => commitDate(date)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveFocus(-1);
                    } else if (event.key === "ArrowRight") {
                      event.preventDefault();
                      moveFocus(1);
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveFocus(-7);
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveFocus(7);
                    } else if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      commitDate(focusedDate);
                    } else if (event.key === "Escape") {
                      setIsOpen(false);
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {includeTime ? (
            <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
              <label className="text-sm font-medium text-slate-700" htmlFor={`${inputId}-time`}>
                Hora
              </label>
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-hidden transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                id={`${inputId}-time`}
                inputMode="numeric"
                placeholder="HH:mm"
                type="text"
                value={time}
                onChange={(event) => {
                  const nextTime = event.target.value.replace(/[^\d:]/g, "").slice(0, 5);
                  setTime(nextTime);
                  if (selectedDate) {
                    onChange(formatValue(selectedDate, true, nextTime));
                  }
                }}
              />
              <Button className="ml-auto" type="button" onClick={() => setIsOpen(false)}>
                OK
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
