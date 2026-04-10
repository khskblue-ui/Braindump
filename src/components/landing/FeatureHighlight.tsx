'use client';

import { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';

const FEATURES = [
  {
    id: 'voice',
    title: '음성 입력',
    desc: '말하면 텍스트로 변환되어 바로 기록됩니다',
    icon: 'mic',
  },
  {
    id: 'ai-classify',
    title: 'AI 자동 분류',
    desc: '입력하는 순간, AI가 알아서 정리합니다',
    icon: 'ai',
  },
  {
    id: 'dashboard',
    title: '대시보드',
    desc: '할 일과 일정을 한눈에 파악하세요',
    icon: 'dashboard',
  },
  {
    id: 'share',
    title: '공유 저장',
    desc: '다른 앱에서 공유 한 번이면 바로 저장',
    icon: 'share',
  },
] as const;

function MicAnimation() {
  return (
    <div className="flex flex-col items-center gap-3">
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
      <div className="flex items-end gap-0.5 h-5">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-1 bg-red-300 rounded-full animate-voice-bar"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 animate-text-appear">
        &ldquo;금요일까지 보고서 제출&rdquo;
      </p>
    </div>
  );
}

/* AI Classification Animation — one input, one card, multiple category badges */
function AIClassifyAnimation() {
  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Input text appears */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 animate-fade-in-fast">
        <p className="text-[11px] text-gray-700">&ldquo;다음주 수요일까지 발표 자료 준비&rdquo;</p>
      </div>

      {/* AI processing indicator */}
      <div className="flex items-center justify-center gap-2 mb-3 animate-ai-process">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-blue-400 animate-ai-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-blue-400 font-medium">AI 분류 중</span>
      </div>

      {/* Single result card with multiple badges */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 animate-classify-result-1">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#3B82F620', color: '#3B82F6' }}>
            할 일
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#F9731620', color: '#F97316' }}>
            일정
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md animate-classify-result-2" style={{ backgroundColor: '#6B728020', color: '#6B7280' }}>
            회사
          </span>
        </div>
        <p className="text-[11px] text-gray-800 font-medium mb-1.5">다음주 수요일까지 발표 자료 준비</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">#발표</span>
          <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">#자료준비</span>
        </div>
        <p className="text-[9px] text-orange-500 mt-1.5">⏰ 4월 16일 (수)</p>
      </div>
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
      {/* BrainDump icon — matches actual app logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-share-receive">
        <svg viewBox="0 0 32 32" className="w-6 h-6">
          <path
            d="M10 8h6c2.2 0 4 1.8 4 4 0 1.5-.8 2.7-2 3.4 1.6.6 2.8 2.2 2.8 4.1 0 2.5-2 4.5-4.5 4.5H10V8z
            M13 11v3.5h2.5c1 0 1.7-.8 1.7-1.75S16.5 11 15.5 11H13z
            M13 17.5V21h3c1.1 0 2-.9 2-1.75s-.9-1.75-2-1.75H13z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}

export function FeatureHighlight() {
  const [activeIndex, setActiveIndex] = useState(0);

  const animations = [
    <MicAnimation key="mic" />,
    <AIClassifyAnimation key="ai" />,
    <DashboardAnimation key="dashboard" />,
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
          <div
            key={activeIndex}
            className="animate-feature-switch w-full flex justify-center"
          >
            {animations[activeIndex]}
          </div>
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
