'use client';

import { User, Building2 } from 'lucide-react';
import { MockupFrame } from '../MockupFrame';
import { CATEGORY_INFO, FLOW_STEPS, MULTI_CATEGORY_EXAMPLES, LONG_DOC_RULES } from '../data/classify-data';
import {
  motion, AnimatePresence,
  spring, ease,
  fadeUp, fadeIn, scaleIn, fadeLeft,
  staggerContainer, stepState,
} from '../motion-helpers';

type Platform = 'ios' | 'web';

export const CLASSIFY_CAPTIONS = [
  { text: '생각을 입력하는 순간' },
  { text: 'AI가 내용을 분석합니다' },
  { text: '카테고리와 맥락이 자동 분류됨' },
  { text: '날짜 감지 시 마감일도 자동 설정' },
];
export const CLASSIFY_DURATIONS = [1500, 1500, 1500, 1500];

function IOSContent({ step = -1 }: { step?: number }) {
  return (
    <div className="px-3 pt-2 pb-4">
      {/* Input animation */}
      <motion.div
        variants={fadeUp}
        animate={stepState(step, 0)}
        transition={{ ...spring, delay: 0 }}
      >
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 mb-3">
          <p className="text-[9px] text-gray-600">&ldquo;금요일 오후 2시 디자인 리뷰 미팅&rdquo;</p>
        </div>
      </motion.div>

      {/* AI processing */}
      <motion.div
        variants={fadeIn}
        animate={stepState(step, 1)}
        transition={{ ...ease }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
          <span className="text-[8px] text-blue-400 font-medium">AI 분류 중</span>
        </div>
      </motion.div>

      {/* Result card */}
      <motion.div
        variants={scaleIn}
        animate={stepState(step, 2)}
        transition={{ ...spring }}
      >
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm">
          <motion.div
            className="flex items-center gap-1 mb-1.5"
            variants={staggerContainer(0.12)}
            animate={stepState(step, 2)}
          >
            {(['일정', '할 일', '업무'] as const).map((label, i) => {
              const colorMap: Record<string, { bg: string; text: string }> = {
                '일정': { bg: '#F973161A', text: '#F97316' },
                '할 일': { bg: '#3B82F61A', text: '#3B82F6' },
                '업무': { bg: '#7C3AED1A', text: '#7C3AED' },
              };
              return (
                <motion.span
                  key={i}
                  variants={fadeLeft}
                  transition={{ ...spring, delay: i * 0.12 }}
                  className="text-[8px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colorMap[label].bg, color: colorMap[label].text }}
                >
                  {label}
                </motion.span>
              );
            })}
          </motion.div>
          <p className="text-[9px] text-gray-800 font-medium mb-1">금요일 오후 2시 디자인 리뷰 미팅</p>

          {/* Tags + time */}
          <motion.div
            variants={fadeUp}
            animate={stepState(step, 3)}
            transition={{ ...spring }}
          >
            <div className="flex items-center gap-1">
              <span className="text-[7px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded">#디자인</span>
              <span className="text-[7px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded">#미팅</span>
            </div>
            <p className="text-[7px] text-orange-500 mt-1">⏰ 금요일 14:00</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Category preview - always visible */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {CATEGORY_INFO.slice(0, 6).map((cat) => (
          <div key={cat.value} className="flex items-center gap-1 px-1.5 py-1 rounded-md" style={{ backgroundColor: cat.color + '0D' }}>
            <div className="w-3 h-3 rounded flex items-center justify-center" style={{ backgroundColor: cat.color + '1A' }}>
              <cat.icon className="h-2 w-2" style={{ color: cat.color }} strokeWidth={1.5} />
            </div>
            <span className="text-[7px] font-medium" style={{ color: cat.color }}>{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebContent({ step = -1 }: { step?: number }) {
  return (
    <div className="p-4 sm:p-6">
      {/* Input → Result flow */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Input box */}
        <motion.div
          className="flex-1"
          variants={fadeUp}
          animate={stepState(step, 0)}
          transition={{ ...spring, delay: 0 }}
        >
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 h-full">
            <p className="text-[10px] text-gray-500 mb-1">입력</p>
            <p className="text-[10px] text-gray-800">&ldquo;다음주 수요일까지 발표 자료 준비&rdquo;</p>
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="flex items-center justify-center"
          variants={fadeIn}
          animate={stepState(step, 1)}
          transition={{ ...ease }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-90 sm:rotate-0">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.div>

        {/* Result box */}
        <motion.div
          className="flex-1"
          variants={scaleIn}
          animate={stepState(step, 2)}
          transition={{ ...spring }}
        >
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm h-full">
            <p className="text-[10px] text-gray-500 mb-1">AI 결과</p>
            <motion.div
              className="flex items-center gap-1 mb-1.5"
              variants={staggerContainer(0.12)}
              animate={stepState(step, 2)}
            >
              {(['할 일', '일정', '업무'] as const).map((label, i) => {
                const colorMap: Record<string, { bg: string; text: string }> = {
                  '할 일': { bg: '#3B82F61A', text: '#3B82F6' },
                  '일정': { bg: '#F973161A', text: '#F97316' },
                  '업무': { bg: '#7C3AED1A', text: '#7C3AED' },
                };
                return (
                  <motion.span
                    key={i}
                    variants={fadeLeft}
                    transition={{ ...spring, delay: i * 0.12 }}
                    className="text-[8px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: colorMap[label].bg, color: colorMap[label].text }}
                  >
                    {label}
                  </motion.span>
                );
              })}
            </motion.div>

            {/* Tags */}
            <motion.div
              className="flex items-center gap-1"
              variants={fadeUp}
              animate={stepState(step, 3)}
              transition={{ ...spring }}
            >
              <span className="text-[7px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded">#발표</span>
              <span className="text-[7px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded">#자료준비</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Category grid - always visible */}
      <div className="grid grid-cols-3 gap-2">
        {CATEGORY_INFO.map((cat) => (
          <div key={cat.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-100">
            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '1A' }}>
              <cat.icon className="h-3 w-3" style={{ color: cat.color }} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-semibold text-gray-800 block">{cat.label}</span>
              <span className="text-[7px] text-gray-400 block truncate">{cat.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detailed classification rules (shown below the mockup)
export function ClassifyDetails() {
  return (
    <div className="mt-8 space-y-6">
      {/* Category definitions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">카테고리 정의</h3>
        <div className="grid gap-2.5">
          {CATEGORY_INFO.map((cat) => (
            <div key={cat.value} className="flex gap-3 items-start">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: cat.color + '1A' }}>
                <cat.icon className="h-4 w-4" style={{ color: cat.color }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{cat.label}</span>
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: cat.color + '1A', color: cat.color }}>
                    {cat.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                <p className="text-xs text-gray-400 mt-0.5">예: {cat.examples}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classification flow */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">분류 판단 흐름</h3>
        <p className="text-xs text-gray-500 mb-3">AI는 아래 순서대로 입력을 분석합니다.</p>
        <div className="space-y-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: step.color }}>
                {i + 1}
              </div>
              <span className="text-xs font-medium flex-1">{step.question}</span>
              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: step.color + '1A', color: step.color }}>
                → {step.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-category rules */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">복수 카테고리 규칙</h3>
        <p className="text-xs text-gray-500 mb-2">하나의 입력이 여러 성격을 가질 수 있습니다.</p>
        <ul className="text-xs text-gray-500 space-y-1.5 ml-1">
          {MULTI_CATEGORY_EXAMPLES.map((ex, i) => (
            <li key={i}>
              &ldquo;{ex.input}&rdquo; → <span className="font-medium text-gray-800">{ex.categories}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-2">첫 번째가 가장 지배적인 카테고리이며, 최대 3개까지 부여됩니다.</p>
      </div>

      {/* Personal/Work context */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">개인 · 업무 맥락</h3>
        <p className="text-xs text-gray-500 mb-3">
          모든 카테고리에 개인/업무 맥락이 자동으로 부여됩니다. 업무·회사·직장 관련이면 <span className="font-medium text-purple-600">업무</span>, 개인 생활·취미·건강이면 <span className="font-medium text-blue-500">개인</span>으로 분류됩니다. 맥락이 불분명하면 미지정으로 남습니다.
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: '#3B82F61A' }}>
              <User className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-xs font-medium">개인</span>
              <p className="text-[10px] text-gray-400">장보기, 운동, 병원</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: '#7C3AED1A' }}>
              <Building2 className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-xs font-medium">업무</span>
              <p className="text-[10px] text-gray-400">회의, 보고서, 출장</p>
            </div>
          </div>
        </div>
      </div>

      {/* Long document rules */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">긴 문서 분류 규칙</h3>
        <p className="text-xs text-gray-500 mb-2">PDF나 긴 텍스트(1,000자 이상)는 아래 기준으로 분류됩니다:</p>
        <ul className="text-xs text-gray-500 space-y-1 ml-3 list-disc">
          {LONG_DOC_RULES.map((rule, i) => (
            <li key={i}>{rule.condition} → <span className="font-medium text-gray-800">{rule.result}</span></li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-1.5">긴 문서는 미분류(inbox)로 분류되지 않으며, 반드시 지식 또는 메모 중 하나가 포함됩니다.</p>
      </div>
    </div>
  );
}

export function ClassifyMockup({ platform, step = -1 }: { platform: Platform; step?: number }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent step={step} /> : <WebContent step={step} />}
    </MockupFrame>
  );
}
