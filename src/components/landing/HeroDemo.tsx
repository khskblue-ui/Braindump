'use client';

import { useState, useEffect, useCallback } from 'react';

const DEMO_ENTRIES = [
  { text: '내일 오후 3시 디자인팀 미팅', category: '일정', color: '#F97316' },
  { text: '우유, 계란 사기', category: '할 일', color: '#3B82F6' },
  { text: 'UX 리서치 방법론 정리', category: '지식', color: '#8B5CF6' },
];

export function HeroDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'classifying' | 'done'>('typing');
  const [showCard, setShowCard] = useState(false);

  const current = DEMO_ENTRIES[currentIndex];

  const advance = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % DEMO_ENTRIES.length);
    setDisplayText('');
    setPhase('typing');
    setShowCard(false);
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      if (displayText.length < current.text.length) {
        const timer = setTimeout(() => {
          setDisplayText(current.text.slice(0, displayText.length + 1));
        }, 60);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase('classifying'), 600);
        return () => clearTimeout(timer);
      }
    }

    if (phase === 'classifying') {
      const timer = setTimeout(() => {
        setShowCard(true);
        setPhase('done');
      }, 400);
      return () => clearTimeout(timer);
    }

    if (phase === 'done') {
      const timer = setTimeout(advance, 2200);
      return () => clearTimeout(timer);
    }
  }, [phase, displayText, current, advance]);

  return (
    <div className="max-w-lg mx-auto">
      {/* Input area */}
      <div className="bg-gray-50 rounded-2xl p-6 text-left shadow-sm">
        <p className="text-xs text-gray-400 mb-3 tracking-wider uppercase">
          New Entry
        </p>
        <p className="text-lg min-h-[1.75rem] text-gray-800">
          {displayText}
          <span className="inline-block w-0.5 h-5 bg-gray-800 ml-0.5 animate-pulse align-text-bottom" />
        </p>
      </div>

      {/* Classified result card */}
      <div
        className={`mt-4 transition-all duration-500 ${
          showCard
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-left flex items-center gap-3 shadow-sm">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-md flex-shrink-0"
            style={{
              backgroundColor: `${current.color}15`,
              color: current.color,
            }}
          >
            {current.category}
          </span>
          <span className="text-sm text-gray-700">{current.text}</span>
        </div>
      </div>
    </div>
  );
}
