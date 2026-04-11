'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CaptionStep {
  text: string;
  icon?: string;
}

interface StepCaptionProps {
  steps: CaptionStep[];
  currentStep: number;
  color?: string;
}

export function MobileStepIndicator({ steps, currentStep, color = '#3B82F6' }: StepCaptionProps) {
  if (currentStep < 0 || currentStep >= steps.length) return null;
  const step = steps[currentStep];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2.5"
      >
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentStep ? 16 : 6,
                backgroundColor: i === currentStep ? color : '#D1D5DB',
              }}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-gray-700">{step.text}</p>
      </motion.div>
    </AnimatePresence>
  );
}

export function StepCaption({ steps, currentStep, color = '#3B82F6' }: StepCaptionProps) {
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isPast = i < currentStep;
        return (
          <motion.div
            key={i}
            className="flex items-center gap-3"
            animate={{
              opacity: isActive ? 1 : isPast ? 0.5 : 0.25,
              x: isActive ? 4 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 20,
            }}
          >
            <motion.div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              animate={{
                backgroundColor: isActive ? color : isPast ? '#e5e7eb' : '#f3f4f6',
                color: isActive ? '#ffffff' : isPast ? '#9ca3af' : '#d1d5db',
                scale: isActive ? 1.1 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              {i + 1}
            </motion.div>
            <p
              className="text-sm leading-relaxed transition-colors duration-300"
              style={{
                color: isActive ? '#111827' : '#9CA3AF',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {step.text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
