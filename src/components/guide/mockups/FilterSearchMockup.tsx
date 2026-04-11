'use client';

import { MockupFrame } from '../MockupFrame';
import {
  motion, AnimatePresence,
  spring, springSnappy,
} from '../motion-helpers';
import { TapIndicator } from '../TapIndicator';

type Platform = 'ios' | 'web';

// ── Data ──

const CATEGORIES = [
  { label: '전체', active: false, color: '' },
  { label: '할 일', active: false, color: '#3B82F6' },
  { label: '아이디어', active: false, color: '#EAB308' },
  { label: '메모', active: false, color: '#22C55E' },
  { label: '지식', active: false, color: '#A855F7' },
  { label: '일정', active: false, color: '#F97316' },
];

const CONTEXT_FILTERS = [
  { label: '전체', color: '' },
  { label: '개인', color: '#3B82F6' },
  { label: '업무', color: '#7C3AED' },
];

const CARDS_ALL = [
  { id: 'report', text: '분기 보고서 작성', tags: ['#보고서'], time: '3시간 전', context: '업무' },
  { id: 'project', text: '프로젝트 계획서 검토', tags: ['#프로젝트'], time: '5시간 전', context: '업무' },
  { id: 'dinner', text: '팀 회식 장소 예약', tags: ['#회식'], time: '1일 전', context: '업무' },
  { id: 'personal', text: '운동 루틴 정리', tags: ['#건강'], time: '2일 전', context: '개인' },
];

const EXPANDED_DETAIL = {
  fullText: '분기 보고서 작성 - Q2 매출 분석 및 다음 분기 전략 포함. 마케팅팀 데이터 반영 필요.',
  extraTags: ['#Q2', '#매출분석'],
  created: '2026-04-09 14:30',
};

// ── Typing animation helper ──

function TypingText({ text, active, fontSize }: { text: string; active: boolean; fontSize: string }) {
  return (
    <span className={`${fontSize} text-gray-800 font-medium`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={active ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: active ? i * 0.12 : 0, duration: 0.05 }}
        >
          {char}
        </motion.span>
      ))}
      {active && (
        <motion.span
          className="inline-block w-[1px] h-[10px] bg-blue-500 ml-px align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
}

// ── Highlight keyword in text ──

function HighlightedText({ text, keyword, active, fontSize }: { text: string; keyword: string; active: boolean; fontSize: string }) {
  if (!active || !keyword) return <span className={`${fontSize} text-gray-800 font-medium`}>{text}</span>;
  const idx = text.indexOf(keyword);
  if (idx === -1) return <span className={`${fontSize} text-gray-800 font-medium`}>{text}</span>;
  return (
    <span className={`${fontSize} text-gray-800 font-medium`}>
      {text.slice(0, idx)}
      <motion.span
        className="rounded px-0.5"
        initial={{ backgroundColor: 'rgba(147, 197, 253, 0)' }}
        animate={{ backgroundColor: 'rgba(147, 197, 253, 0.5)' }}
        transition={{ duration: 0.4 }}
      >
        {keyword}
      </motion.span>
      {text.slice(idx + keyword.length)}
    </span>
  );
}

// ── Derive animation state ──

function useFilterState(step: number, subPhase: 'action' | 'reaction') {
  // Category tab: "전체" active by default, "할 일" active after step 0 reaction
  const activeCategory = step > 0 || (step === 0 && subPhase === 'reaction') ? '할 일' : '전체';

  // Context filter: none active until step 1 reaction
  const activeContext = step > 1 || (step === 1 && subPhase === 'reaction') ? '업무' : '';

  // Search text visibility
  const isTyping = step === 2 && subPhase === 'action';
  const searchApplied = step > 2 || (step === 2 && subPhase === 'reaction');

  // Card expansion
  const cardTapped = step === 3 && subPhase === 'action';
  const cardExpanded = step === 3 && subPhase === 'reaction';

  // Visible cards logic
  let visibleCardIds: string[];
  if (step < 1 || (step === 1 && subPhase === 'action')) {
    // Steps -1, 0, 1-action: all 4 cards visible
    visibleCardIds = ['report', 'project', 'dinner', 'personal'];
  } else if (step === 1 && subPhase === 'reaction') {
    // Step 1 reaction: "개인" card filtered out
    visibleCardIds = ['report', 'project', 'dinner'];
  } else if (step === 2 && subPhase === 'action') {
    // Step 2 action: still showing 업무 cards while typing
    visibleCardIds = ['report', 'project', 'dinner'];
  } else {
    // Step 2 reaction+, step 3: only matching card
    visibleCardIds = ['report'];
  }

  return {
    activeCategory,
    activeContext,
    isTyping,
    searchApplied,
    cardTapped,
    cardExpanded,
    visibleCardIds,
  };
}

// ── iOS Content ──

function IOSContent({ step = -1, subPhase = 'action' }: { step?: number; subPhase?: 'action' | 'reaction' }) {
  const state = useFilterState(step, subPhase);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-pink-50/60">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/60 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-[7px] font-bold text-white">B</span>
          </div>
          <span className="text-[10px] font-bold text-gray-900">BrainDump</span>
        </div>
        <div className="flex items-center gap-1 text-[7px] font-medium text-blue-500 border border-blue-200 rounded-lg px-1.5 py-0.5 bg-blue-50/50">
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          개인
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 pt-2 pb-1">
        <div className="relative bg-white/80 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border border-gray-200/60">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <AnimatePresence mode="wait">
            {state.isTyping ? (
              <TypingText key="typing" text="보고서" active={true} fontSize="text-[8px]" />
            ) : state.searchApplied ? (
              <span key="searched" className="text-[8px] text-gray-800 font-medium">보고서</span>
            ) : (
              <span key="placeholder" className="text-[8px] text-gray-400">검색...</span>
            )}
          </AnimatePresence>
          <TapIndicator active={step === 2 && subPhase === 'action'} x="50%" y="50%" size={24} color="#3B82F6" />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 py-1 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = cat.label === state.activeCategory;
          const isTodo = cat.label === '할 일';

          const animateProps = cat.label === '전체'
            ? isActive
              ? { backgroundColor: '#e5e7eb', color: '#374151', opacity: 1 }
              : { backgroundColor: '#f3f4f6', color: '#6b7280', opacity: 1 }
            : isActive
              ? { backgroundColor: cat.color + '30', color: cat.color, opacity: 1 }
              : { backgroundColor: cat.color + '15', color: cat.color, opacity: 0.5 };

          return (
            <motion.span
              key={cat.label}
              className="shrink-0 text-[7px] font-medium px-2 py-1 rounded-lg relative"
              animate={animateProps}
              transition={springSnappy}
            >
              {isTodo && (
                <TapIndicator active={step === 0 && subPhase === 'action'} x="50%" y="50%" size={22} color="#3B82F6" />
              )}
              {cat.label}
            </motion.span>
          );
        })}
      </div>

      {/* Context sub-filter */}
      <div className="flex gap-1 px-3 py-1">
        {CONTEXT_FILTERS.map((f) => {
          const isActive = f.label === state.activeContext;
          const isUpmoo = f.label === '업무';

          return (
            <motion.span
              key={f.label}
              className="text-[7px] font-medium px-2 py-0.5 rounded-full border relative"
              animate={
                isActive
                  ? { color: f.color, borderColor: f.color, backgroundColor: f.color + '0D' }
                  : { borderColor: '#e5e7eb', color: '#9ca3af', backgroundColor: 'rgba(0,0,0,0)' }
              }
              transition={springSnappy}
            >
              {isUpmoo && (
                <TapIndicator active={step === 1 && subPhase === 'action'} x="50%" y="50%" size={22} color="#7C3AED" />
              )}
              {f.label}
            </motion.span>
          );
        })}
      </div>

      {/* Entry cards */}
      <div className="flex-1 px-3 space-y-1.5 pt-1 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {CARDS_ALL.filter((card) => state.visibleCardIds.includes(card.id)).map((entry) => {
            const isExpandTarget = entry.id === 'report';
            const showHighlight = isExpandTarget && (state.searchApplied || state.cardExpanded);

            return (
              <motion.div
                key={entry.id}
                layout
                className="bg-white rounded-xl p-2.5 border border-gray-200/60 shadow-sm relative overflow-hidden"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={spring}
              >
                {isExpandTarget && (
                  <TapIndicator active={state.cardTapped} x="50%" y="40%" size={28} color="#3B82F6" />
                )}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[6.5px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#3B82F618', color: '#3B82F6' }}>
                      할 일
                    </span>
                    <span className="text-[6.5px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-0.5" style={{ backgroundColor: entry.context === '업무' ? '#7C3AED18' : '#3B82F618', color: entry.context === '업무' ? '#7C3AED' : '#3B82F6' }}>
                      <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 12h6M12 9v6" fill="white" />
                      </svg>
                      {entry.context}
                    </span>
                  </div>
                  <span className="text-[6px] text-gray-400">{entry.time}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
                  {showHighlight ? (
                    <HighlightedText text={entry.text} keyword="보고서" active={true} fontSize="text-[9px]" />
                  ) : (
                    <p className="text-[9px] text-gray-800 font-medium">{entry.text}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="text-[6.5px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">{tag}</span>
                  ))}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpandTarget && state.cardExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                        <p className="text-[7.5px] text-gray-600 leading-relaxed mb-1.5">{EXPANDED_DETAIL.fullText}</p>
                        <div className="flex items-center gap-1 mb-1">
                          {EXPANDED_DETAIL.extraTags.map((tag) => (
                            <span key={tag} className="text-[6.5px] text-blue-500 bg-blue-50 px-1 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                        <span className="text-[6px] text-gray-400">{EXPANDED_DETAIL.created}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <div className="flex items-center justify-around h-10 border-t border-gray-200/60 bg-white/80 backdrop-blur mt-auto">
        {[
          { label: '홈', active: true, d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
          { label: '지식', active: false, d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' },
          { label: '휴지통', active: false, d: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' },
          { label: '설정', active: false, d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' },
        ].map((tab) => (
          <div key={tab.label} className="flex flex-col items-center gap-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tab.active ? '#3B82F6' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={tab.d} />
            </svg>
            <span className={`text-[6px] ${tab.active ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Web Content ──

function WebContent({ step = -1, subPhase = 'action' }: { step?: number; subPhase?: 'action' | 'reaction' }) {
  const state = useFilterState(step, subPhase);

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 min-h-full">
      {/* Search bar */}
      <div className="relative bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 mb-3 shadow-sm">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <AnimatePresence mode="wait">
          {state.isTyping ? (
            <TypingText key="typing" text="보고서" active={true} fontSize="text-[9px]" />
          ) : state.searchApplied ? (
            <span key="searched" className="text-[9px] text-gray-800 font-medium">보고서</span>
          ) : (
            <span key="placeholder" className="text-[9px] text-gray-400">검색어를 입력하세요...</span>
          )}
        </AnimatePresence>
        <TapIndicator active={step === 2 && subPhase === 'action'} x="50%" y="50%" size={28} color="#3B82F6" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = cat.label === state.activeCategory;
          const isTodo = cat.label === '할 일';

          const animateProps = cat.label === '전체'
            ? isActive
              ? { backgroundColor: '#e5e7eb', color: '#374151', opacity: 1 }
              : { backgroundColor: '#f3f4f6', color: '#6b7280', opacity: 1 }
            : isActive
              ? { backgroundColor: cat.color + '30', color: cat.color, opacity: 1 }
              : { backgroundColor: cat.color + '15', color: cat.color, opacity: 0.5 };

          return (
            <motion.span
              key={cat.label}
              className="text-[8px] font-medium px-2.5 py-1 rounded-lg relative"
              animate={animateProps}
              transition={springSnappy}
            >
              {isTodo && (
                <TapIndicator active={step === 0 && subPhase === 'action'} x="50%" y="50%" size={24} color="#3B82F6" />
              )}
              {cat.label}
            </motion.span>
          );
        })}
      </div>

      {/* Context sub-filter */}
      <div className="flex gap-1.5 mb-3">
        {CONTEXT_FILTERS.map((f) => {
          const isActive = f.label === state.activeContext;
          const isUpmoo = f.label === '업무';

          return (
            <motion.span
              key={f.label}
              className="text-[8px] font-medium px-2.5 py-1 rounded-full border relative"
              animate={
                isActive
                  ? { color: f.color, borderColor: f.color, backgroundColor: f.color + '0D' }
                  : { borderColor: '#e5e7eb', color: '#9ca3af', backgroundColor: 'rgba(0,0,0,0)' }
              }
              transition={springSnappy}
            >
              {isUpmoo && (
                <TapIndicator active={step === 1 && subPhase === 'action'} x="50%" y="50%" size={24} color="#7C3AED" />
              )}
              {f.label}
            </motion.span>
          );
        })}
      </div>

      {/* Entry cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {CARDS_ALL.filter((card) => state.visibleCardIds.includes(card.id)).map((entry) => {
            const isExpandTarget = entry.id === 'report';
            const showHighlight = isExpandTarget && (state.searchApplied || state.cardExpanded);

            return (
              <motion.div
                key={entry.id}
                layout
                className="bg-white px-3 py-2.5 rounded-xl border border-gray-200/60 shadow-sm relative overflow-hidden"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={spring}
              >
                {isExpandTarget && (
                  <TapIndicator active={state.cardTapped} x="50%" y="40%" size={32} color="#3B82F6" />
                )}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#3B82F618', color: '#3B82F6' }}>
                      할 일
                    </span>
                    <span className="text-[7px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: entry.context === '업무' ? '#7C3AED18' : '#3B82F618', color: entry.context === '업무' ? '#7C3AED' : '#3B82F6' }}>
                      {entry.context}
                    </span>
                  </div>
                  <span className="text-[7px] text-gray-400">{entry.time}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
                  {showHighlight ? (
                    <HighlightedText text={entry.text} keyword="보고서" active={true} fontSize="text-[10px]" />
                  ) : (
                    <p className="text-[10px] text-gray-800 font-medium">{entry.text}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="text-[7px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpandTarget && state.cardExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                        <p className="text-[8px] text-gray-600 leading-relaxed mb-1.5">{EXPANDED_DETAIL.fullText}</p>
                        <div className="flex items-center gap-1 mb-1">
                          {EXPANDED_DETAIL.extraTags.map((tag) => (
                            <span key={tag} className="text-[7px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                        <span className="text-[6.5px] text-gray-400">{EXPANDED_DETAIL.created}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Export ──

export function FilterSearchMockup({ platform, step = -1, subPhase = 'action' }: { platform: Platform; step?: number; subPhase?: 'action' | 'reaction' }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent step={step} subPhase={subPhase} /> : <WebContent step={step} subPhase={subPhase} />}
    </MockupFrame>
  );
}

export const FILTER_CAPTIONS = [
  { text: '카테고리를 탭해 원하는 항목만 보기' },
  { text: '개인/업무 맥락으로 추가 필터링' },
  { text: '키워드를 입력하면 즉시 검색' },
  { text: '항목을 탭해 상세 내용 확인' },
];
export const FILTER_DURATIONS = [2500, 2000, 2500, 2000];
