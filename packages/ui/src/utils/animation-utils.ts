import type { Transition, Variants } from "framer-motion";

// ── Spring presets ──────────────────────────────────────────────
/** Suave e ágil — para hover/tap interactions */
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};
''
/** Ainda mais suave — para entradas lentas e elegantes */
export const SPRING_SMOOTHER: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 32,
  mass: 1.0,
};

/** Mais suave — para entradas/saídas de elementos */
export const SPRING_SMOOTH: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 0.9,
};

/** Sutil bounce — para feedback de sucesso / pop-in */
export const SPRING_BOUNCY: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  mass: 0.6,
};

// ── Tween presets ───────────────────────────────────────────────
/** Material Design ease-in-out moderno */
export const EASE_MODERN = [0.4, 0.0, 0.2, 1] as const;

export const TWEEN_FAST = { duration: 0.15, ease: EASE_MODERN } as const;
export const TWEEN_NORMAL = { duration: 0.2, ease: EASE_MODERN } as const;
export const TWEEN_SLOW = { duration: 0.3, ease: EASE_MODERN } as const;

// ── Variants — Entrada/Saída ────────────────────────────────────
/** Fade + slide-up sutil */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SMOOTH,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: EASE_MODERN },
  },
};

/** Fade + slide-down (ideal para dropdowns, popovers) */
export const fadeSlideDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SMOOTH,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: EASE_MODERN },
  },
};

/** Scale-in (ideal para modais, popovers) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_SMOOTH,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: EASE_MODERN },
  },
};

/** Pop-in com bounce sutil (ideal para badges, notificações) */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_BOUNCY,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.12, ease: EASE_MODERN },
  },
};

// ── Variants — Stagger (listas) ─────────────────────────────────
/** Container que aplica stagger nos filhos */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/** Container com stagger mais lento — para cards com entrada suave */
export const staggerContainerCards: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Item individual dentro de um stagger */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SMOOTH,
  },
};

/** Item individual para stagger mais lento — cards, seções */
export const staggerItemCards: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SMOOTHER,
  },
};

// ── Motion props reutilizáveis ──────────────────────────────────

/** Props para hover lift (cards, botões interativos) */
export const hoverLift = {
  whileHover: {
    y: -2,
    transition: SPRING_SNAPPY,
  },
  whileTap: {
    scale: 0.98,
    transition: SPRING_SNAPPY,
  },
};

/** Props para hover scale sutil */
export const hoverScale = {
  whileHover: {
    scale: 1.02,
    transition: SPRING_SNAPPY,
  },
  whileTap: {
    scale: 0.97,
    transition: SPRING_SNAPPY,
  },
};

/** Props para tap feedback em botões */
export const tapFeedback = {
  whileHover: {
    scale: 1.02,
    transition: SPRING_SNAPPY,
  },
  whileTap: {
    scale: 0.96,
    transition: SPRING_SNAPPY,
  },
};

// ── Erro shake ──────────────────────────────────────────────────
export const shakeAnimation = {
  x: [0, -6, 6, -4, 4, -2, 2, 0],
  transition: { duration: 0.4, ease: EASE_MODERN },
};