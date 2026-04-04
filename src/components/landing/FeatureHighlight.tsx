'use client';

import { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';

const FEATURES = [
  {
    id: 'voice',
    title: '음성 입력',
    desc: '말하면 기록됩니다',
    icon: 'mic',
  },
  {
    id: 'dashboard',
    title: '대시보드',
    desc: '할 일과 일정을 한눈에',
    icon: 'dashboard',
  },
  {
    id: 'pin',
    title: '핀 고정',
    desc: '중요한 건 항상 위에',
    icon: 'pin',
  },
  {
    id: 'share',
    title: '공유 타겟',
    desc: '다른 앱에서 바로 저장',
    icon: 'share',
  },
] as const;

function MicAnimation() {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mic icon with pulse ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping-slow" />
        <div className="relative w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </div>
      </div>
      {/* Voice bars */}
      <div className="flex items-end gap-0.5 h-5">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-1 bg-red-300 rounded-full animate-voice-bar"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      {/* Transcribed text fade-in */}
      <p className="text-xs text-gray-500 animate-text-appear">
        &ldquo;내일 회의 자료 준비&rdquo;
      </p>
    </div>
  );
}

function DashboardAnimation() {
  return (
    <div className="space-y-2">
      {[
        { label: '마감 임박', color: '#EF4444', delay: '0s' },
        { label: '오늘 일정', color: '#F97316', delay: '0.2s' },
        { label: '높은 우선순위', color: '#3B82F6', delay: '0.4s' },
      ].map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 animate-slide-in-right"
          style={{ animationDelay: item.delay }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <div
            className="h-2 rounded-full"
            style={{
              backgroundColor: `${item.color}20`,
              width: `${60 + Math.random() * 40}%`,
            }}
          />
          <span className="text-[10px] text-gray-400 flex-shrink-0">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function PinAnimation() {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card stack with pin dropping */}
      <div className="relative w-full max-w-[140px]">
        {/* Background card */}
        <div className="h-10 rounded-lg bg-gray-100 border border-gray-200" />
        {/* Foreground pinned card */}
        <div className="h-10 rounded-lg bg-white border border-blue-200 shadow-sm -mt-6 relative animate-card-lift">
          <div className="absolute -top-2 right-2 animate-pin-drop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 1 1 0 0 0 1-1V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1 1 1 0 0 1 1 1z" />
            </svg>
          </div>
          <div className="px-3 py-2">
            <div className="h-1.5 w-16 bg-blue-100 rounded-full" />
          </div>
        </div>
      </div>
      <p className="text-[10px] text-gray-400">고정됨</p>
    </div>
  );
}

function ShareAnimation() {
  return (
    <div className="flex items-center gap-3 justify-center">
      {/* Source app icon */}
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
        </svg>
      </div>
      {/* Arrow animation */}
      <div className="animate-share-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      {/* BrainDump icon */}
      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center animate-share-receive">
        <span className="text-white text-xs font-bold">B</span>
      </div>
    </div>
  );
}

export function FeatureHighlight() {
  const [activeIndex, setActiveIndex] = useState(0);

  const animations = [
    <MicAnimation key="mic" />,
    <DashboardAnimation key="dashboard" />,
    <PinAnimation key="pin" />,
    <ShareAnimation key="share" />,
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-14">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">
              # Features
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              기록을 더 쉽게,
              <br />
              관리를 더 똑똑하게.
            </h2>
          </div>
          <p className="text-sm text-gray-400">
            입력부터 정리까지, 새로운 기능들
          </p>
        </div>
      </ScrollReveal>

      {/* Tab selector */}
      <ScrollReveal delay={100}>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8">
          {FEATURES.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-1 text-xs sm:text-sm font-medium py-2.5 px-2 rounded-lg transition-all duration-300 ${
                activeIndex === i
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.title}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Animation viewport */}
      <ScrollReveal delay={200}>
        <div className="bg-gray-50 rounded-2xl p-8 min-h-[180px] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Animation */}
          <div
            key={activeIndex}
            className="animate-feature-switch w-full flex justify-center"
          >
            {animations[activeIndex]}
          </div>
          {/* Description */}
          <p
            key={`desc-${activeIndex}`}
            className="text-sm text-gray-500 mt-6 animate-fade-in-fast"
          >
            {FEATURES[activeIndex].desc}
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
