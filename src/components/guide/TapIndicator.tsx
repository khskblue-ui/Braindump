'use client';

import { motion } from 'framer-motion';

interface TapIndicatorProps {
  active: boolean;
  x?: string;
  y?: string;
  size?: number;
  color?: string;
}

export function TapIndicator({
  active,
  x = '50%',
  y = '50%',
  size = 28,
  color = '#3B82F6',
}: TapIndicatorProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-20"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
      animate={
        active
          ? { scale: [0.3, 1, 0.8], opacity: [0, 0.5, 0] }
          : { scale: 0, opacity: 0 }
      }
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color + '30',
          border: `2px solid ${color}50`,
        }}
      />
    </motion.div>
  );
}
