import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Countdown, getTimeRemainingState } from "./Countdown";

const fixedNow = new Date("2026-05-03T12:00:00.000Z");

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders the default remaining time", () => {
    render(<Countdown endsAt="2026-05-03T13:02:03.000Z" />);

    expect(screen.getByText("Tempo restante:")).toBeInTheDocument();
    expect(screen.getByText("01:02:03")).toBeInTheDocument();
  });

  test("renders compact and hero variants", () => {
    const endsAt = "2026-05-03T12:10:05.000Z";
    const { rerender } = render(<Countdown endsAt={endsAt} variant="compact" />);

    expect(screen.getByText("10m 5s")).toBeInTheDocument();

    rerender(<Countdown endsAt={endsAt} variant="hero" />);

    expect(screen.getByLabelText("Tempo restante: 00:10:05")).toBeInTheDocument();
    expect(screen.getAllByText("Tempo restante")).toHaveLength(1);
  });

  test("marks warning, critical, and expired states", () => {
    expect(getTimeRemainingState(45_000)).toMatchObject({
      isCritical: false,
      isExpired: false,
      isWarning: true,
    });
    expect(getTimeRemainingState(20_000)).toMatchObject({
      isCritical: true,
      isExpired: false,
      isWarning: false,
    });
    expect(getTimeRemainingState(0)).toMatchObject({
      displayText: "Encerrado",
      isExpired: true,
    });
  });

  test("calls onExpire when the timer reaches zero", () => {
    const onExpire = vi.fn();

    render(<Countdown endsAt="2026-05-03T12:00:01.000Z" onExpire={onExpire} />);

    vi.advanceTimersByTime(1000);

    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(screen.getByText("00:00:00")).toBeInTheDocument();
  });
});
