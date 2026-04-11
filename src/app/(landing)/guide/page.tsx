'use client';

import { useState, useEffect } from 'react';
import { GuideTabs } from '@/components/guide/GuideTabs';
import { GuideSection } from '@/components/guide/GuideSection';
import { StepCaption, MobileStepIndicator } from '@/components/guide/StepCaption';
import { DetailAccordion } from '@/components/guide/DetailAccordion';
import { useStepAnimation } from '@/components/guide/hooks/useStepAnimation';
import { motion, spring, ease, fadeUp, fadeIn, staggerContainer, stepState } from '@/components/guide/motion-helpers';

import { QuickCaptureMockup, QuickCaptureDetails, QUICKCAPTURE_CAPTIONS_IOS, QUICKCAPTURE_CAPTIONS_WEB, QUICKCAPTURE_DURATIONS } from '@/components/guide/mockups/QuickCaptureMockup';
import { ClassifyMockup, ClassifyDetails, CLASSIFY_CAPTIONS, CLASSIFY_DURATIONS } from '@/components/guide/mockups/ClassifyMockup';
import { FilterSearchMockup, FILTER_CAPTIONS, FILTER_DURATIONS } from '@/components/guide/mockups/FilterSearchMockup';
import { DashboardMockup, DashboardDetails, DASHBOARD_CAPTIONS, DASHBOARD_DURATIONS } from '@/components/guide/mockups/DashboardMockup';
import { KnowledgeMockup, KnowledgeDetails, KNOWLEDGE_CAPTIONS, KNOWLEDGE_DURATIONS, KNOWLEDGE_SUBSTEP_SPLIT } from '@/components/guide/mockups/KnowledgeMockup';
import { WidgetMockup, WIDGET_CAPTIONS, WIDGET_DURATIONS } from '@/components/guide/mockups/WidgetMockup';
import { CustomAIMockup, CustomAIDetails, CUSTOMAI_CAPTIONS, CUSTOMAI_DURATIONS } from '@/components/guide/mockups/CustomAIMockup';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import Link from 'next/link';

type Platform = 'ios' | 'web';

// ── Animated Section wrapper ──

type SubPhase = 'action' | 'reaction';

function AnimatedSection({
  id,
  number,
  color,
  title,
  description,
  captions,
  durations,
  subStepSplit,
  mockup,
  details,
  platform,
}: {
  id: string;
  number: number;
  color: string;
  title: string;
  description: string;
  captions: { icon?: string; text: string }[];
  durations: number[];
  subStepSplit?: number[];
  mockup: (props: { platform: Platform; step: number; subPhase: SubPhase }) => React.ReactNode;
  details?: React.ReactNode;
  platform: Platform;
}) {
  const { ref, currentStep, subPhase } = useStepAnimation({ durations, subStepSplit });

  return (
    <GuideSection
      id={id}
      number={number}
      color={color}
      title={title}
      description={description}
      layout="split"
    >
      <div ref={ref}>
        {mockup({ platform, step: currentStep, subPhase })}
        {/* Mobile step indicator (below mockup) */}
        <div className="lg:hidden flex justify-center mt-3">
          <MobileStepIndicator steps={captions} currentStep={currentStep} color={color} />
        </div>
      </div>
      {/* Mobile details (below mockup) */}
      {details && <div className="lg:hidden mt-4">{details}</div>}
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col gap-6">
        <StepCaption steps={captions} currentStep={currentStep} color={color} />
        {details}
      </div>
    </GuideSection>
  );
}

// ── Reminder (inline, no external mockup) ──

const REMINDER_CAPTIONS = [
  { text: '알림 시점 옵션이 표시됨' },
  { text: '원하는 시점을 탭해 선택' },
  { text: '설정한 시간에 알림이 도착' },
];
const REMINDER_DURATIONS = [2000, 2000, 2500];

const REMINDER_OPTIONS = ['1주일 전', '2일 전', '1일 전', '1시간 전', '10분 전'];
const SELECTED_OPTIONS = ['1시간 전', '10분 전'];

function ReminderMockup({ step }: { step: number }) {
  const showSelection = step >= 1;
  const showNotification = step >= 2;

  return (
    <div className="space-y-5 max-w-sm mx-auto">
      {/* Reminder options */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">알림 옵션</h3>
        <motion.div
          className="flex flex-wrap gap-2"
          variants={staggerContainer(0.1)}
          animate={stepState(step, 0)}
        >
          {REMINDER_OPTIONS.map((option) => {
            const isSelected = showSelection && SELECTED_OPTIONS.includes(option);
            return (
              <motion.span
                key={option}
                variants={fadeUp}
                transition={spring}
                className="relative text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-300"
                style={{
                  backgroundColor: isSelected ? '#FEE2E2' : '#FEF2F2',
                  color: isSelected ? '#DC2626' : '#EF4444',
                  borderColor: isSelected ? '#FCA5A5' : '#FEE2E2',
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {option}
                {isSelected && (
                  <motion.span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </motion.span>
                )}
              </motion.span>
            );
          })}
        </motion.div>
        {showSelection && (
          <motion.p
            className="text-[10px] text-gray-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            2개 선택됨
          </motion.p>
        )}
      </div>

      {/* Notification preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">알림 미리보기</h3>
        <motion.div
          className="max-w-sm bg-white border border-gray-200 rounded-2xl p-3 shadow-lg"
          animate={showNotification
            ? { opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }
            : { opacity: 0.3, y: 8 }
          }
          transition={showNotification
            ? { type: 'tween', duration: 0.5, x: { delay: 0.3, duration: 0.4 } }
            : { duration: 0.3 }
          }
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-white">B</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-800">BrainDump 리마인더</p>
                <span className="text-[10px] text-gray-400">지금</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">&ldquo;보고서 제출&rdquo; 마감이 1시간 남았습니다</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ReminderDetails() {
  return (
    <div className="space-y-4">
      <DetailAccordion title="설정 방법">
        <ol className="text-xs text-gray-500 space-y-1.5 ml-4 list-decimal">
          <li>항목을 탭해서 상세 화면을 엽니다.</li>
          <li>편집 버튼을 눌러 마감일을 설정합니다.</li>
          <li>리마인더 섹션에서 원하는 알림 시점을 선택합니다.</li>
          <li>저장하면 해당 시점에 푸시 알림이 발송됩니다.</li>
        </ol>
      </DetailAccordion>
      <DetailAccordion title="알림 시점 안내">
        <p className="text-xs text-gray-500 mb-2">할 일이나 일정에 마감일을 설정하면, 아래 시점에 알림을 받을 수 있습니다. 여러 개를 동시에 선택할 수 있습니다.</p>
        <div className="flex flex-wrap gap-2">
          {['1주일 전', '2일 전', '1일 전', '1시간 전', '10분 전'].map((option) => (
            <span key={option} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              {option}
            </span>
          ))}
        </div>
      </DetailAccordion>
    </div>
  );
}

// ── Divider ──

function Divider() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="border-t border-gray-100" />
    </div>
  );
}

// ── Main Page ──

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<Platform>('ios');
  const reminderAnim = useStepAnimation({ durations: REMINDER_DURATIONS });

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <div>
      {/* Hero section */}
      <div className="px-6 pt-16 pb-8 sm:pt-20 sm:pb-12 max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-sm font-medium text-gray-400 mb-3"># Guide</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            BrainDump
            <br />
            사용 가이드
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-lg mx-auto leading-relaxed">
            생각을 던지면 AI가 정리합니다.
            <br />
            iOS 앱과 웹 버전의 주요 기능을 알아보세요.
          </p>
        </ScrollReveal>
      </div>

      {/* Platform tabs (sticky) */}
      <GuideTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Section 1: Quick Capture */}
      <AnimatedSection
        id="capture"
        number={1}
        color="#3B82F6"
        title="빠른 입력"
        description="텍스트, 음성, 사진, PDF — 무엇이든 빠르게 입력하세요."
        captions={activeTab === 'ios' ? QUICKCAPTURE_CAPTIONS_IOS : QUICKCAPTURE_CAPTIONS_WEB}
        durations={QUICKCAPTURE_DURATIONS}
        subStepSplit={[1000, 800, 1000, 1000]}
        mockup={({ platform, step, subPhase }) => <QuickCaptureMockup platform={platform} step={step} subPhase={subPhase} />}
        platform={activeTab}
        details={
          <div className="space-y-3">
            {activeTab === 'ios' && (
              <>
                <DetailAccordion title="퀵 액션 (길게 누르기)">
                  <p className="text-xs text-gray-500 mb-3">홈 화면에서 BrainDump 앱 아이콘을 길게 누르면 바로 기록을 시작할 수 있습니다.</p>
                  <div className="max-w-xs">
                    <div className="bg-white/95 backdrop-blur rounded-2xl overflow-hidden shadow-xl border border-gray-200/50">
                      {[
                        { title: '사진 메모', sub: '사진으로 기록하기' },
                        { title: '음성 메모', sub: '음성으로 기록하기' },
                        { title: '빠른 메모', sub: '텍스트로 기록하기' },
                      ].map((action, i) => (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-200/50' : ''}`}>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{action.title}</p>
                            <p className="text-xs text-gray-400">{action.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DetailAccordion>
                <DetailAccordion title="공유 확장">
                  <p className="text-xs text-gray-500">
                    Safari, 메모, 카카오톡 등 다른 앱에서 공유 버튼을 누르고 BrainDump를 선택하면, 해당 내용이 바로 기록됩니다. 개인/업무 맥락도 공유 시점에 선택할 수 있습니다.
                  </p>
                </DetailAccordion>
              </>
            )}
            <DetailAccordion title="입력 방식 안내">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { title: '텍스트', desc: '생각을 바로 타이핑하세요. 짧은 메모부터 긴 글까지 자유롭게.', color: '#3B82F6' },
                  { title: '음성', desc: '말하면 AI가 자동으로 텍스트로 변환합니다. 한국어 음성 인식.', color: '#EF4444' },
                  { title: '사진', desc: '사진을 찍거나 앨범에서 선택하면 AI가 내용을 분석합니다.', color: '#22C55E' },
                  { title: 'PDF', desc: 'PDF 문서를 업로드하면 텍스트를 추출하고 자동 분류합니다.', color: '#F97316' },
                ].map((method) => (
                  <div key={method.title} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: method.color + '15' }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{method.title}</span>
                    </div>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                ))}
              </div>
            </DetailAccordion>
          </div>
        }
      />

      <Divider />

      {/* Section 2: AI Classification */}
      <AnimatedSection
        id="classify"
        number={2}
        color="#A855F7"
        title="AI 자동 분류"
        description="입력하는 순간, AI가 카테고리·태그·맥락을 자동으로 분류합니다."
        captions={CLASSIFY_CAPTIONS}
        durations={CLASSIFY_DURATIONS}
        mockup={({ platform, step, subPhase }) => <ClassifyMockup platform={platform} step={step} />}
        platform={activeTab}
        details={
          <div className="space-y-3">
            <DetailAccordion title="카테고리 정의">
              <ClassifyDetails />
            </DetailAccordion>
          </div>
        }
      />

      <Divider />

      {/* Section 3: Category / Filter / Search */}
      <AnimatedSection
        id="filter"
        number={3}
        color="#22C55E"
        title="카테고리 · 필터 · 검색"
        description="카테고리별로 정리하고, 맥락을 구분하고, 키워드로 빠르게 찾으세요."
        captions={FILTER_CAPTIONS}
        durations={FILTER_DURATIONS}
        subStepSplit={[1000, 800, 1000, 800]}
        mockup={({ platform, step, subPhase }) => <FilterSearchMockup platform={platform} step={step} subPhase={subPhase} />}
        platform={activeTab}
      />

      <Divider />

      {/* Section 4: Today Dashboard */}
      <AnimatedSection
        id="dashboard"
        number={4}
        color="#F97316"
        title="오늘의 대시보드"
        description="지난 항목, 오늘 일정, 최근 추가를 한눈에 확인하세요."
        captions={DASHBOARD_CAPTIONS}
        durations={DASHBOARD_DURATIONS}
        subStepSplit={[1000, 800, 1000]}
        mockup={({ platform, step, subPhase }) => <DashboardMockup platform={platform} step={step} subPhase={subPhase} />}
        platform={activeTab}
        details={
          <DetailAccordion title="대시보드 구성 상세">
            <DashboardDetails />
          </DetailAccordion>
        }
      />

      <Divider />

      {/* Section 5: Knowledge */}
      <AnimatedSection
        id="knowledge"
        number={5}
        color="#A855F7"
        title="지식 모음"
        description="AI가 지식으로 분류한 항목은 토픽별로 자동 그룹핑됩니다."
        captions={KNOWLEDGE_CAPTIONS}
        durations={KNOWLEDGE_DURATIONS}
        subStepSplit={KNOWLEDGE_SUBSTEP_SPLIT}
        mockup={({ platform, step, subPhase }) => <KnowledgeMockup platform={platform} step={step} subPhase={subPhase} />}
        platform={activeTab}
        details={
          <DetailAccordion title="활용 예시">
            <KnowledgeDetails />
          </DetailAccordion>
        }
      />

      <Divider />

      {/* Section 6: Widget & Dynamic Island - iOS only */}
      {activeTab === 'ios' && (
        <>
          <AnimatedSection
            id="widget"
            number={6}
            color="#F97316"
            title="위젯 · 다이나믹 아일랜드"
            description="홈 화면 위젯과 다이나믹 아일랜드에서 실시간으로 확인하세요."
            captions={WIDGET_CAPTIONS}
            durations={WIDGET_DURATIONS}
            mockup={({ platform, step, subPhase }) => <WidgetMockup platform={platform} step={step} />}
            platform={activeTab}
          />
          <Divider />
        </>
      )}

      {/* Section 7: Reminder */}
      <GuideSection
        id="reminder"
        number={activeTab === 'ios' ? 7 : 6}
        color="#EF4444"
        title="알림 · 리마인더"
        description="마감일에 맞춰 알림을 설정하세요."
        layout="split"
      >
        <div ref={reminderAnim.ref}>
          <ReminderMockup step={reminderAnim.currentStep} />
          <div className="lg:hidden flex justify-center mt-3">
            <MobileStepIndicator steps={REMINDER_CAPTIONS} currentStep={reminderAnim.currentStep} color="#EF4444" />
          </div>
        </div>
        <div className="lg:hidden mt-4"><ReminderDetails /></div>
        <div className="hidden lg:flex flex-col gap-6">
          <StepCaption steps={REMINDER_CAPTIONS} currentStep={reminderAnim.currentStep} color="#EF4444" />
          <ReminderDetails />
        </div>
      </GuideSection>

      <Divider />

      {/* Section 8: Custom AI Learning */}
      <AnimatedSection
        id="custom-ai"
        number={activeTab === 'ios' ? 8 : 7}
        color="#3B82F6"
        title="나만의 AI 학습"
        description="커스텀 규칙과 교정 학습으로, 쓸수록 똑똑해집니다."
        captions={CUSTOMAI_CAPTIONS}
        durations={CUSTOMAI_DURATIONS}
        subStepSplit={[1000, 800, 1000]}
        mockup={({ platform, step, subPhase }) => <CustomAIMockup platform={platform} step={step} subPhase={subPhase} />}
        platform={activeTab}
        details={
          <DetailAccordion title="분류 우선순위 · 교정 이력">
            <CustomAIDetails />
          </DetailAccordion>
        }
      />

      {/* Bottom CTA */}
      <div className="py-16 sm:py-20 text-center">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            생각을 던지면, AI가 정리합니다.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 transition-colors"
          >
            시작하기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
