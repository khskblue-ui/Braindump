'use client';

import { type Variants, type Transition } from 'framer-motion';
export { motion, AnimatePresence } from 'framer-motion';

// ── Transitions ──

export const spring: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 18,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 80,
  damping: 20,
};

export const ease: Transition = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// ── Variant Presets ──

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -14 },
  visible: { opacity: 1, y: 0 },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

// ── Stagger Container ──

export function staggerContainer(staggerChildren = 0.12, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

// ── Step-based helpers ──
// Use with: animate={step >= N ? 'visible' : 'hidden'}

export function stepState(step: number, targetStep: number) {
  return step >= targetStep ? 'visible' : 'hidden';
}

export function stepDelay(baseDelay: number, index: number, perItem = 0.1) {
  return baseDelay + index * perItem;
}

// ── Pulse / highlight variant ──

export const pulse: Variants = {
  idle: { scale: 1 },
  active: { scale: [1, 1.12, 1], transition: { type: 'tween', duration: 0.5, repeat: 1 } },
};

export const highlight: Variants = {
  idle: { backgroundColor: 'rgba(0,0,0,0)' },
  active: { backgroundColor: 'rgba(59, 130, 246, 0.08)' },
};

// ── Slide down (for new items inserting at top) ──

export const slideDown: Variants = {
  hidden: { opacity: 0, height: 0, y: -16 },
  visible: { opacity: 1, height: 'auto', y: 0 },
};

// ── Type reveal (width-based typing) ──

export const typeReveal: Variants = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: 'auto', opacity: 1 },
};
