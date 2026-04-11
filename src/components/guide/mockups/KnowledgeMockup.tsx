'use client';

import { MockupFrame } from '../MockupFrame';
import {
  motion, AnimatePresence,
  ease, fadeUp,
  staggerContainer, stepState,
} from '../motion-helpers';
import { TapIndicator } from '../TapIndicator';

type Platform = 'ios' | 'web';

// Sub-items that appear when first topic is expanded
const SUB_ITEMS = [
  { title: 'Pandas 기본 문법 정리', time: '1시간 전' },
  { title: 'NumPy 배열 연산 요약', time: '2일 전' },
];

const PREVIEW_TEXT = 'DataFrame 생성, 인덱싱, 필터링, groupby 등 핵심 메서드 정리...';

const TOPICS = [
  { title: 'Python 데이터 분석 기초 정리', time: '1시간 전', count: 1 },
  { title: '웹 개발 핵심 개념 모음', time: '1주 전', count: 1 },
  { title: 'React / Next.js 핵심 패턴', time: '2주 전', count: 5 },
  { title: '건강한 식습관 레시피 모음', time: '3주 전', count: 3 },
];

const WEB_TOPICS = [
  { title: 'Python 데이터 분석 기초 정리', time: '1시간 전', count: 1, iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2' },
  { title: '웹 개발 핵심 개념 모음', time: '1주 전', count: 1, iconPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  { title: 'React / Next.js 핵심 패턴', time: '2주 전', count: 5, iconPath: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  { title: '건강한 식습관 레시피 모음', time: '3주 전', count: 3, iconPath: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M8 7h6M8 11h4' },
];

// Count badge with pulse animation on step 0 reaction
function CountBadge({ count, animate }: { count: number; animate: boolean }) {
  return (
    <motion.span
      className="text-[8px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full"
      animate={
        animate
          ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
    >
      {count}개
    </motion.span>
  );
}

function IOSContent({ step = -1, subPhase = 'action' as 'action' | 'reaction' }) {
  const showExpanded = step >= 1;
  const isStep1Action = step === 1 && subPhase === 'action';
  const isStep1Reaction = step === 1 && subPhase === 'reaction';
  const showSubItems = step > 1 || isStep1Reaction;
  const isStep2Action = step === 2 && subPhase === 'action';
  const isStep2Reaction = step === 2 && subPhase === 'reaction';
  const showPreview = step >= 2 && subPhase === 'reaction';
  const countPulse = step === 0 && subPhase === 'reaction';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Large title */}
      <div className="px-4 pt-6 pb-3">
        <h2 className="text-[16px] font-bold text-gray-900">지식 모음</h2>
      </div>

      {/* Topic list */}
      <motion.div
        className="flex-1 px-4 overflow-hidden"
        variants={staggerContainer(0.15)}
        animate={stepState(step, 0)}
      >
        {TOPICS.map((topic, i) => (
          <motion.div key={i} variants={fadeUp}>
            {/* Topic row */}
            <div
              className={`flex items-center gap-3 py-3 relative ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              {/* Tap indicator for step 1 on first topic */}
              {i === 0 && (
                <TapIndicator active={isStep1Action} x="50%" y="50%" size={28} />
              )}

              {/* Row highlight background */}
              {i === 0 && (
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '-2px -8px',
                    borderRadius: '6px',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                  animate={{
                    backgroundColor: showExpanded
                      ? 'rgba(59,130,246,0.12)'
                      : 'rgba(0,0,0,0)',
                  }}
                  transition={ease}
                />
              )}

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <path d="M8 7h6M8 11h4" />
              </svg>
              <div className="flex-1 min-w-0 relative" style={{ zIndex: 1 }}>
                <p className="text-[10px] font-medium text-gray-900 leading-snug line-clamp-2">{topic.title}</p>
                <p className="text-[8px] text-gray-400 mt-0.5">{topic.time}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0" style={{ position: 'relative', zIndex: 1 }}>
                <CountBadge count={topic.count} animate={countPulse} />
                <motion.svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    rotate: i === 0 && showExpanded ? 90 : 0,
                  }}
                  transition={ease}
                >
                  <path d="m9 18 6-6-6-6" />
                </motion.svg>
              </div>
            </div>

            {/* Sub-items (only under first topic) */}
            {i === 0 && (
              <AnimatePresence>
                {showSubItems && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ overflow: 'hidden' }}
                  >
                    {SUB_ITEMS.map((sub, si) => (
                      <div key={si} className="relative">
                        <motion.div
                          className="flex items-center gap-2 py-2 pl-7 pr-2 relative"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            x: si === 0 && isStep2Reaction ? 4 : 0,
                          }}
                          transition={{
                            opacity: { duration: 0.25, delay: si * 0.1 },
                            y: { duration: 0.25, delay: si * 0.1 },
                            x: { duration: 0.3 },
                          }}
                        >
                          {/* Tap indicator for step 2 on first sub-item */}
                          {si === 0 && (
                            <TapIndicator active={isStep2Action} x="50%" y="50%" size={24} />
                          )}

                          <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-medium text-gray-700 truncate">{sub.title}</p>
                            <p className="text-[7px] text-gray-400">{sub.time}</p>
                          </div>
                        </motion.div>

                        {/* Preview block under first sub-item */}
                        {si === 0 && (
                          <AnimatePresence>
                            {showPreview && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div className="ml-8 mr-2 mb-2 pl-2 py-1.5 border-l-2 border-blue-300 bg-blue-50/50 rounded-r">
                                  <p className="text-[8px] text-gray-500 leading-relaxed">{PREVIEW_TEXT}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom tab bar */}
      <div className="flex items-center justify-around h-10 border-t border-gray-200/60 bg-white mt-auto">
        {[
          { label: '홈', active: false, d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
          { label: '지식', active: true, d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' },
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

function WebContent({ step = -1, subPhase = 'action' as 'action' | 'reaction' }) {
  const showExpanded = step >= 1;
  const isStep1Action = step === 1 && subPhase === 'action';
  const isStep1Reaction = step === 1 && subPhase === 'reaction';
  const showSubItems = step > 1 || isStep1Reaction;
  const isStep2Action = step === 2 && subPhase === 'action';
  const isStep2Reaction = step === 2 && subPhase === 'reaction';
  const showPreview = step >= 2 && subPhase === 'reaction';
  const countPulse = step === 0 && subPhase === 'reaction';

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 min-h-full">
      <h2 className="text-base font-bold text-gray-900 mb-4">지식 모음</h2>
      <motion.div
        className="space-y-2"
        variants={staggerContainer(0.15)}
        animate={stepState(step, 0)}
      >
        {WEB_TOPICS.map((topic, i) => (
          <motion.div key={i} variants={fadeUp}>
            {/* Topic card */}
            <motion.div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-gray-200/60 shadow-sm cursor-pointer relative overflow-hidden"
              animate={{
                backgroundColor: i === 0 && showExpanded
                  ? 'rgba(239,246,255,1)'
                  : 'rgba(255,255,255,1)',
                borderColor: i === 0 && showExpanded
                  ? 'rgba(191,219,254,0.6)'
                  : 'rgba(229,231,235,0.6)',
              }}
              transition={ease}
            >
              {/* Tap indicator for step 1 on first topic */}
              {i === 0 && (
                <TapIndicator active={isStep1Action} x="50%" y="50%" size={28} />
              )}

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={topic.iconPath} />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-900 truncate">{topic.title}</p>
                <p className="text-[8px] text-gray-400 mt-0.5">{topic.time}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <CountBadge count={topic.count} animate={countPulse} />
                <motion.svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    rotate: i === 0 && showExpanded ? 90 : 0,
                  }}
                  transition={ease}
                >
                  <path d="m9 18 6-6-6-6" />
                </motion.svg>
              </div>
            </motion.div>

            {/* Sub-items (only under first topic) */}
            {i === 0 && (
              <AnimatePresence>
                {showSubItems && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ overflow: 'hidden' }}
                    className="mt-1"
                  >
                    {SUB_ITEMS.map((sub, si) => (
                      <div key={si} className="relative">
                        <motion.div
                          className="flex items-center gap-2 py-2 pl-8 pr-3 ml-2 rounded-lg relative"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            x: si === 0 && isStep2Reaction ? 4 : 0,
                          }}
                          transition={{
                            opacity: { duration: 0.25, delay: si * 0.1 },
                            y: { duration: 0.25, delay: si * 0.1 },
                            x: { duration: 0.3 },
                          }}
                        >
                          {/* Tap indicator for step 2 on first sub-item */}
                          {si === 0 && (
                            <TapIndicator active={isStep2Action} x="50%" y="50%" size={24} />
                          )}

                          <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-medium text-gray-700 truncate">{sub.title}</p>
                            <p className="text-[7px] text-gray-400">{sub.time}</p>
                          </div>
                        </motion.div>

                        {/* Preview block under first sub-item */}
                        {si === 0 && (
                          <AnimatePresence>
                            {showPreview && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div className="ml-10 mr-3 mb-1.5 pl-2 py-1.5 border-l-2 border-blue-300 bg-blue-50/50 rounded-r">
                                  <p className="text-[8px] text-gray-500 leading-relaxed">{PREVIEW_TEXT}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function KnowledgeMockup({ platform, step, subPhase }: { platform: Platform; step?: number; subPhase?: 'action' | 'reaction' }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios'
        ? <IOSContent step={step} subPhase={subPhase} />
        : <WebContent step={step} subPhase={subPhase} />
      }
    </MockupFrame>
  );
}

export const KNOWLEDGE_CAPTIONS = [
  { text: '지식 항목이 토픽별로 자동 정리' },
  { text: '토픽을 탭하면 하위 항목이 펼쳐짐' },
  { text: '항목을 탭해 미리보기 확인' },
];
export const KNOWLEDGE_DURATIONS = [2000, 2500, 2500];
export const KNOWLEDGE_SUBSTEP_SPLIT = [800, 1000, 1000];

export function KnowledgeDetails() {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">자동 토픽 분류</h3>
        <p className="text-xs text-gray-500">AI가 &ldquo;지식&rdquo;으로 분류한 항목은 자동으로 토픽별로 그룹핑됩니다. 같은 주제의 지식이 쌓이면 하나의 토픽 아래에 정리됩니다.</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">활용 예시</h3>
        <ul className="text-xs text-gray-500 space-y-1.5 ml-3 list-disc">
          <li>학습 노트, 기술 문서 → 주제별로 자동 묶임</li>
          <li>요리 레시피, 독서 메모 → 카테고리 없이도 토픽으로 정리</li>
          <li>PDF나 긴 텍스트도 AI가 분석해서 적절한 토픽에 배정</li>
        </ul>
      </div>
    </div>
  );
}
