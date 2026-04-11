'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type SubPhase = 'action' | 'reaction';

interface UseStepAnimationOptions {
  durations: number[];
  subStepSplit?: number[];
  loop?: boolean;
  loopDelay?: number;
  threshold?: number;
}

export function useStepAnimation({
  durations,
  subStepSplit,
  loop = true,
  loopDelay = 3000,
  threshold = 0.3,
}: UseStepAnimationOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [subPhase, setSubPhase] = useState<SubPhase>('action');
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(false);

  const totalSteps = durations.length;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (subTimerRef.current) {
      clearTimeout(subTimerRef.current);
      subTimerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (step: number) => {
      if (!isVisibleRef.current) return;

      if (step < totalSteps) {
        setCurrentStep(step);
        setSubPhase('action');

        // Schedule action → reaction transition
        const splitMs = subStepSplit?.[step] ?? Math.floor(durations[step] * 0.4);
        subTimerRef.current = setTimeout(() => {
          setSubPhase('reaction');
        }, splitMs);

        // Schedule next step
        timerRef.current = setTimeout(() => {
          scheduleNext(step + 1);
        }, durations[step]);
      } else if (loop) {
        // Last step done — wait loopDelay then restart from 0 (no blank frame)
        timerRef.current = setTimeout(() => {
          if (!isVisibleRef.current) return;
          scheduleNext(0);
        }, loopDelay);
      } else {
        setIsPlaying(false);
      }
    },
    [totalSteps, durations, subStepSplit, loop, loopDelay],
  );

  const replay = useCallback(() => {
    clearTimer();
    setCurrentStep(-1);
    setSubPhase('action');
    setTimeout(() => {
      setIsPlaying(true);
      scheduleNext(0);
    }, 100);
  }, [clearTimer, scheduleNext]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !isPlaying) {
          // Always restart from step 0 when entering viewport
          clearTimer();
          setIsPlaying(true);
          scheduleNext(0);
        }
        if (!entry.isIntersecting) {
          clearTimer();
          setIsPlaying(false);
          setCurrentStep(-1);
          setSubPhase('action');
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimer();
    };
  }, [threshold, scheduleNext, clearTimer]);

  // Reset when durations change (e.g. platform switch)
  useEffect(() => {
    clearTimer();
    setCurrentStep(-1);
    setSubPhase('action');
    setIsPlaying(false);
    if (isVisibleRef.current) {
      setTimeout(() => {
        setIsPlaying(true);
        scheduleNext(0);
      }, 300);
    }
  }, [durations, clearTimer, scheduleNext]);

  return { ref, currentStep, subPhase, isPlaying, replay, totalSteps };
}
