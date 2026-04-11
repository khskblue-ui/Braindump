'use client';

import { useState, useEffect } from 'react';
import { Brain, PenSquare, Sparkles, CheckCircle2, Type, Mic, Camera, FileText } from 'lucide-react';

const LS_KEY = 'braindump-onboarding-completed';

interface Step {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  extra?: React.ReactNode;
}

const STEPS: Step[] = [
  {
    icon: <Brain className="h-16 w-16 text-blue-500" strokeWidth={1.5} />,
    title: '생각을 던지면, AI가 정리해요',
    subtitle: '텍스트, 음성, 사진, PDF — 무엇이든 입력하면 AI가 자동으로 분류하고 정리합니다.',
  },
  {
    icon: <PenSquare className="h-16 w-16 text-blue-500" strokeWidth={1.5} />,
    title: '빠르게 기록하세요',
    subtitle: '생각이 떠오르면 바로 입력하세요. 텍스트, 음성 녹음, 사진, PDF 모두 가능합니다.',
    extra: (
      <div className="flex gap-6 mt-6 justify-center">
        {[
          { icon: <Type className="h-5 w-5" />, label: '텍스트' },
          { icon: <Mic className="h-5 w-5" />, label: '음성' },
          { icon: <Camera className="h-5 w-5" />, label: '사진' },
          { icon: <FileText className="h-5 w-5" />, label: 'PDF' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500">
              {icon}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: <Sparkles className="h-16 w-16 text-blue-500" strokeWidth={1.5} />,
    title: 'AI가 자동으로 분류해요',
    subtitle: '할 일, 일정, 아이디어, 메모, 지식 — AI가 내용을 분석해 적절한 카테고리에 정리합니다.',
    extra: (
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {[
          { label: '할 일', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
          { label: '일정', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
          { label: '아이디어', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
          { label: '메모', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
          { label: '지식', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
        ].map(({ label, color }) => (
          <span key={label} className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
            {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: <CheckCircle2 className="h-16 w-16 text-green-500" strokeWidth={1.5} />,
    title: '준비 완료!',
    subtitle: '지금 바로 첫 번째 생각을 기록해보세요.',
  },
];

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    const completed = localStorage.getItem(LS_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, []);

  const complete = () => {
    localStorage.setItem(LS_KEY, 'true');
    setVisible(false);
  };

  const goToStep = (nextStep: number) => {
    if (animating) return;
    setDirection(nextStep > currentStep ? 'forward' : 'backward');
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      complete();
    }
  };

  if (!visible) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col">
      {/* Skip button */}
      {!isLastStep && (
        <div className="flex justify-end px-6 pt-6">
          <button
            onClick={complete}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className="flex flex-col items-center transition-all duration-200"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === 'forward' ? '-20px' : '20px'})`
              : 'translateX(0)',
          }}
        >
          {step.icon}
          <h1 className="text-2xl font-bold mt-6 text-gray-900 dark:text-gray-50">
            {step.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-base leading-relaxed max-w-xs">
            {step.subtitle}
          </p>
          {step.extra}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-12 flex flex-col items-center gap-6">
        {/* Dot indicators */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`rounded-full transition-all duration-200 ${
                i === currentStep
                  ? 'w-6 h-2 bg-blue-500'
                  : 'w-2 h-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-label={`${i + 1}페이지로 이동`}
            />
          ))}
        </div>

        {/* Action button */}
        {isLastStep ? (
          <div className="w-full max-w-xs flex flex-col gap-2">
            <button
              onClick={complete}
              className="w-full py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-base transition-colors"
            >
              바로 시작
            </button>
            <button
              onClick={() => {
                window.open('/guide', '_blank');
                complete();
              }}
              className="w-full py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold text-base transition-colors"
            >
              가이드 보기
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full max-w-xs py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-base transition-colors"
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}
