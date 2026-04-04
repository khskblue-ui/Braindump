'use client';

import { useState, useEffect, useCallback } from 'react';

const DEMO_ENTRIES = [
  {
    text: '내일 오후 3시 디자인팀 미팅',
    mode: 'typing' as const,
    categories: [
      { label: '일정', color: '#F97316' },
      { label: '할 일', color: '#3B82F6' },
    ],
    pinned: false,
  },
  {
    text: '우유, 계란, 빵 사기',
    mode: 'voice' as const,
    categories: [{ label: '할 일', color: '#3B82F6' }],
    pinned: true,
  },
  {
    text: 'UX 리서치 방법론 — 제이콥 닐슨 10가지 휴리스틱',
    mode: 'typing' as const,
    categories: [
      { label: '지식', color: '#A855F7' },
      { label: '메모', color: '#22C55E' },
    ],
    pinned: false,
  },
];

export function HeroDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<
    'typing' | 'voice-listening' | 'voice-filling' | 'classifying' | 'done'
  >('typing');
  const [showCard, setShowCard] = useState(false);
  const [voicePulse, setVoicePulse] = useState(false);

  const current = DEMO_ENTRIES[currentIndex];

  const advance = useCallback(() => {
    const nextIndex = (currentIndex + 1) % DEMO_ENTRIES.length;
    setCurrentIndex(nextIndex);
    setDisplayText('');
    setShowCard(false);
    setVoicePulse(false);
    const next = DEMO_ENTRIES[nextIndex];
    setPhase(next.mode === 'voice' ? 'voice-listening' : 'typing');
  }, [currentIndex]);

  useEffect(() => {
    // Typing mode: character-by-character
    if (phase === 'typing') {
      if (displayText.length < current.text.length) {
        const timer = setTimeout(() => {
          setDisplayText(current.text.slice(0, displayText.length + 1));
        }, 55);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase('classifying'), 600);
        return () => clearTimeout(timer);
      }
    }

    // Voice mode: show pulse animation, then fill text
    if (phase === 'voice-listening') {
      setVoicePulse(true);
      const timer = setTimeout(() => {
        setPhase('voice-filling');
      }, 1800);
      return () => clearTimeout(timer);
    }

    if (phase === 'voice-filling') {
      setVoicePulse(false);
      if (displayText.length < current.text.length) {
        const timer = setTimeout(() => {
          // Fill faster for voice (chunks of 2-3 chars)
          const step = Math.min(3, current.text.length - displayText.length);
          setDisplayText(current.text.slice(0, displayText.length + step));
        }, 40);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase('classifying'), 500);
        return () => clearTimeout(timer);
      }
    }

    // Classification animation
    if (phase === 'classifying') {
      const timer = setTimeout(() => {
        setShowCard(true);
        setPhase('done');
      }, 400);
      return () => clearTimeout(timer);
    }

    // Wait then advance
    if (phase === 'done') {
      const timer = setTimeout(advance, 2400);
      return () => clearTimeout(timer);
    }
  }, [phase, displayText, current, advance]);

  const isVoiceActive = phase === 'voice-listening' || phase === 'voice-filling';

  return (
    <div className="max-w-lg mx-auto">
      {/* Input area */}
      <div
        className={`bg-gray-50 rounded-2xl p-6 text-left shadow-sm transition-shadow duration-300 ${
          isVoiceActive ? 'ring-2 ring-red-300/60 shadow-md' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 tracking-wider uppercase">
            New Entry
          </p>
          {/* Voice indicator */}
          {isVoiceActive && (
            <div className="flex items-center gap-1.5 animate-fade-in-fast">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">
                듣는 중...
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg min-h-[1.75rem] text-gray-800 flex-1">
            {displayText}
            <span
              className={`inline-block w-0.5 h-5 ml-0.5 animate-pulse align-text-bottom ${
                isVoiceActive ? 'bg-red-400' : 'bg-gray-800'
              }`}
            />
          </p>
          {/* Voice waveform animation */}
          {voicePulse && (
            <div className="flex items-center gap-0.5 h-6 flex-shrink-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-0.5 bg-red-400 rounded-full animate-voice-bar"
                  style={{
                    animationDelay: `${i * 0.12}s`,
                    height: '100%',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Classified result card */}
      <div
        className={`mt-4 transition-all duration-500 ${
          showCard
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-left shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Multi-category badges */}
            {current.categories.map((cat, i) => (
              <span
                key={cat.label}
                className="text-xs font-semibold px-2.5 py-1 rounded-md flex-shrink-0 animate-badge-pop"
                style={{
                  backgroundColor: `${cat.color}15`,
                  color: cat.color,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {cat.label}
              </span>
            ))}
            {/* Pin indicator */}
            {current.pinned && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto animate-pin-drop flex-shrink-0"
              >
                <path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 1 1 0 0 0 1-1V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1 1 1 0 0 1 1 1z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-2">{current.text}</p>
        </div>
      </div>
    </div>
  );
}
