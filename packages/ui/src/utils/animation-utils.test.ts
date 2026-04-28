import { describe, expect, test } from "vitest";

import {
  EASE_MODERN,
  fadeSlideDown,
  fadeSlideUp,
  hoverLift,
  hoverScale,
  popIn,
  scaleIn,
  shakeAnimation,
  SPRING_BOUNCY,
  SPRING_SMOOTH,
  SPRING_SNAPPY,
  staggerContainer,
  staggerItem,
  tapFeedback,
  TWEEN_FAST,
  TWEEN_NORMAL,
  TWEEN_SLOW,
} from "./animation-utils";

describe("animation-utils", () => {
  describe("spring presets", () => {
    test.each([
      { name: "SPRING_SNAPPY", spring: SPRING_SNAPPY },
      { name: "SPRING_SMOOTH", spring: SPRING_SMOOTH },
      { name: "SPRING_BOUNCY", spring: SPRING_BOUNCY },
    ])("$name has spring type and valid config", ({ spring }) => {
      expect(spring).toHaveProperty("type", "spring");
      expect(spring).toHaveProperty("stiffness");
      expect(spring).toHaveProperty("damping");
      expect(spring).toHaveProperty("mass");

      const { stiffness, damping, mass } = spring as {
        stiffness: number;
        damping: number;
        mass: number;
      };
      expect(stiffness).toBeGreaterThan(0);
      expect(damping).toBeGreaterThan(0);
      expect(mass).toBeGreaterThan(0);
    });

    test("SPRING_SNAPPY is snappier than SPRING_SMOOTH (higher stiffness)", () => {
      expect((SPRING_SNAPPY as { stiffness: number }).stiffness).toBeGreaterThan(
        (SPRING_SMOOTH as { stiffness: number }).stiffness
      );
    });

    test("SPRING_BOUNCY has lower damping than SPRING_SNAPPY (allows more bounce)", () => {
      expect((SPRING_BOUNCY as { damping: number }).damping).toBeLessThan(
        (SPRING_SNAPPY as { damping: number }).damping
      );
    });
  });

  describe("tween presets", () => {
    test("EASE_MODERN is a 4-element array (cubic-bezier)", () => {
      expect(EASE_MODERN).toHaveLength(4);
      EASE_MODERN.forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      });
    });

    test.each([
      { name: "TWEEN_FAST", tween: TWEEN_FAST, maxDuration: 0.2 },
      { name: "TWEEN_NORMAL", tween: TWEEN_NORMAL, maxDuration: 0.25 },
      { name: "TWEEN_SLOW", tween: TWEEN_SLOW, maxDuration: 0.35 },
    ])("$name duration is within sweet spot (150ms-350ms)", ({ tween, maxDuration }) => {
      expect(tween.duration).toBeGreaterThanOrEqual(0.15);
      expect(tween.duration).toBeLessThanOrEqual(maxDuration);
      expect(tween.ease).toEqual(EASE_MODERN);
    });

    test("TWEEN_FAST < TWEEN_NORMAL < TWEEN_SLOW in duration", () => {
      expect(TWEEN_FAST.duration).toBeLessThan(TWEEN_NORMAL.duration);
      expect(TWEEN_NORMAL.duration).toBeLessThan(TWEEN_SLOW.duration);
    });
  });

  describe("variants — entrance/exit", () => {
    test.each([
      { name: "fadeSlideUp", variants: fadeSlideUp },
      { name: "fadeSlideDown", variants: fadeSlideDown },
      { name: "scaleIn", variants: scaleIn },
      { name: "popIn", variants: popIn },
    ])("$name has hidden, visible, and exit states", ({ variants }) => {
      expect(variants).toHaveProperty("hidden");
      expect(variants).toHaveProperty("visible");
      expect(variants).toHaveProperty("exit");
    });

    test("fadeSlideUp hidden state starts at opacity 0 and y > 0", () => {
      const hidden = fadeSlideUp.hidden as { opacity: number; y: number };
      expect(hidden.opacity).toBe(0);
      expect(hidden.y).toBeGreaterThan(0);
    });

    test("fadeSlideDown hidden state starts at opacity 0 and y < 0", () => {
      const hidden = fadeSlideDown.hidden as { opacity: number; y: number };
      expect(hidden.opacity).toBe(0);
      expect(hidden.y).toBeLessThan(0);
    });

    test("scaleIn hidden state starts at opacity 0 and scale < 1", () => {
      const hidden = scaleIn.hidden as { opacity: number; scale: number };
      expect(hidden.opacity).toBe(0);
      expect(hidden.scale).toBeLessThan(1);
      expect(hidden.scale).toBeGreaterThan(0.8);
    });

    test("popIn hidden state starts at opacity 0 and scale significantly below 1", () => {
      const hidden = popIn.hidden as { opacity: number; scale: number };
      expect(hidden.opacity).toBe(0);
      expect(hidden.scale).toBeLessThan(0.8);
      expect(hidden.scale).toBeGreaterThan(0.4);
    });

    test("fadeSlideUp visible state reaches full opacity and y=0", () => {
      const visible = fadeSlideUp.visible as { opacity: number; y: number };
      expect(visible.opacity).toBe(1);
      expect(visible.y).toBe(0);
    });
  });

  describe("variants — stagger (lists)", () => {
    test("staggerContainer has hidden and visible states", () => {
      expect(staggerContainer).toHaveProperty("hidden");
      expect(staggerContainer).toHaveProperty("visible");
    });

    test("staggerContainer visible transition has staggerChildren between 40ms and 100ms", () => {
      const visible = staggerContainer.visible as {
        transition: { staggerChildren: number; delayChildren: number };
      };
      expect(visible.transition.staggerChildren).toBeGreaterThanOrEqual(0.04);
      expect(visible.transition.staggerChildren).toBeLessThanOrEqual(0.1);
    });

    test("staggerContainer has a small delayChildren", () => {
      const visible = staggerContainer.visible as {
        transition: { delayChildren: number };
      };
      expect(visible.transition.delayChildren).toBeGreaterThan(0);
      expect(visible.transition.delayChildren).toBeLessThanOrEqual(0.1);
    });

    test("staggerItem has hidden, visible states", () => {
      expect(staggerItem).toHaveProperty("hidden");
      expect(staggerItem).toHaveProperty("visible");
    });

    test("staggerItem hidden state starts at opacity 0 and y > 0", () => {
      const hidden = staggerItem.hidden as { opacity: number; y: number };
      expect(hidden.opacity).toBe(0);
      expect(hidden.y).toBeGreaterThan(0);
    });
  });

  describe("motion props — reusable interactions", () => {
    test.each([
      { name: "hoverLift", props: hoverLift },
      { name: "hoverScale", props: hoverScale },
      { name: "tapFeedback", props: tapFeedback },
    ])("$name has whileHover and whileTap", ({ props }) => {
      expect(props).toHaveProperty("whileHover");
      expect(props).toHaveProperty("whileTap");
    });

    test("hoverLift whileHover uses negative y (lift up)", () => {
      const y = (hoverLift.whileHover as { y: number }).y;
      expect(y).toBeLessThan(0);
      expect(y).toBeGreaterThanOrEqual(-5);
    });

    test("hoverScale whileHover scales slightly above 1", () => {
      const scale = (hoverScale.whileHover as { scale: number }).scale;
      expect(scale).toBeGreaterThan(1);
      expect(scale).toBeLessThanOrEqual(1.05);
    });

    test("tapFeedback whileTap scales below 1 (press down)", () => {
      const scale = (tapFeedback.whileTap as { scale: number }).scale;
      expect(scale).toBeLessThan(1);
      expect(scale).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe("shakeAnimation", () => {
    test("has x keyframes array with odd number of frames (start and end at 0)", () => {
      const x = shakeAnimation.x as number[];
      expect(x.length).toBeGreaterThan(0);
      expect(x[0]).toBe(0);
      expect(x[x.length - 1]).toBe(0);
    });

    test("has transition with duration between 150ms and 500ms", () => {
      expect(shakeAnimation.transition).toHaveProperty("duration");
      const duration = (shakeAnimation.transition as { duration: number }).duration;
      expect(duration).toBeGreaterThanOrEqual(0.15);
      expect(duration).toBeLessThanOrEqual(0.5);
    });

    test("shake amplitude decreases over time (damped)", () => {
      const x = shakeAnimation.x as number[];
      // Check that the middle frames have larger absolute values than the end frames
      const midAmplitude = Math.max(...x.slice(1, Math.floor(x.length / 2)).map(Math.abs));
      const endAmplitude = Math.max(...x.slice(Math.floor(x.length / 2)).map(Math.abs));
      expect(midAmplitude).toBeGreaterThanOrEqual(endAmplitude);
    });
  });
});