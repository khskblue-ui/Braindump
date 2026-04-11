'use client';

import { useState, useEffect } from 'react';
import { GuideTabs } from '@/components/guide/GuideTabs';
import { GuideSection } from '@/components/guide/GuideSection';
import { QuickCaptureMockup, QuickCaptureDetails } from '@/components/guide/mockups/QuickCaptureMockup';
import { ClassifyMockup, ClassifyDetails } from '@/components/guide/mockups/ClassifyMockup';
import { FilterSearchMockup } from '@/components/guide/mockups/FilterSearchMockup';
import { DashboardMockup, DashboardDetails } from '@/components/guide/mockups/DashboardMockup';
import { KnowledgeMockup, KnowledgeDetails } from '@/components/guide/mockups/KnowledgeMockup';
import { WidgetMockup } from '@/components/guide/mockups/WidgetMockup';
import { CustomAIMockup, CustomAIDetails } from '@/components/guide/mockups/CustomAIMockup';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import Link from 'next/link';

type Platform = 'ios' | 'web';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<Platform>('ios');

  // Handle hash scroll on mount
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
      <GuideSection
        id="capture"
        number={1}
        color="#3B82F6"
        title="빠른 입력"
        description="텍스트, 음성, 사진, PDF — 무엇이든 빠르게 입력하세요. 홈 화면에서 앱 아이콘을 길게 눌러 바로 기록을 시작할 수도 있습니다."
      >
        <QuickCaptureMockup platform={activeTab} />
        <QuickCaptureDetails platform={activeTab} />
      </GuideSection>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* Section 2: AI Classification */}
      <GuideSection
        id="classify"
        number={2}
        color="#A855F7"
        title="AI 자동 분류"
        description="입력하는 순간, AI가 카테고리·태그·개인/업무 맥락을 자동으로 분류합니다. 사용자가 교정하면 AI가 학습합니다."
      >
        <ClassifyMockup platform={activeTab} />
        <ClassifyDetails />
      </GuideSection>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* Section 3: Category / Filter / Search */}
      <GuideSection
        id="filter"
        number={3}
        color="#22C55E"
        title="카테고리 · 필터 · 검색"
        description="카테고리별로 정리하고, 개인/업무를 구분하고, 키워드로 빠르게 찾으세요."
      >
        <FilterSearchMockup platform={activeTab} />
      </GuideSection>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* Section 4: Today Dashboard */}
      <GuideSection
        id="dashboard"
        number={4}
        color="#F97316"
        title="오늘의 대시보드"
        description="지난 항목, 오늘 일정, 최근 추가를 한눈에 확인하세요. 핀 고정으로 중요한 항목을 놓치지 마세요."
      >
        <DashboardMockup platform={activeTab} />
        <DashboardDetails />
      </GuideSection>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* Section 5: Knowledge */}
      <GuideSection
        id="knowledge"
        number={5}
        color="#A855F7"
        title="지식 모음"
        description="AI가 지식으로 분류한 항목은 토픽별로 자동 그룹핑됩니다. 학습 노트, 레시피, 독서 메모를 체계적으로 관리하세요."
      >
        <KnowledgeMockup platform={activeTab} />
        <KnowledgeDetails />
      </GuideSection>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* Section 6: Widget & Dynamic Island - iOS only */}
      {activeTab === 'ios' && (
        <>
          <GuideSection
            id="widget"
            number={6}
            color="#F97316"
            title="위젯 · 다이나믹 아일랜드"
            description="홈 화면 위젯으로 할 일과 일정을 한눈에, 다이나믹 아일랜드와 잠금 화면에서 실시간으로 확인하세요."
          >
            <WidgetMockup platform={activeTab} />
          </GuideSection>

          {/* Divider */}
          <div className="max-w-4xl mx-auto px-6">
            <div className="border-t border-gray-100" />
          </div>
        </>
      )}

      {/* Section 7: Reminder */}
      <GuideSection
        id="reminder"
        number={7}
        color="#EF4444"
        title="알림 · 리마인더"
        description="마감일에 맞춰 알림을 설정하세요. 1주일 전부터 10분 전까지, 원하는 시점에 알려드립니다."
      >
        <ReminderContent />
      </GuideSection>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* Section 8: Custom AI Learning */}
      <GuideSection
        id="custom-ai"
        number={8}
        color="#3B82F6"
        title="나만의 AI 학습"
        description="커스텀 분류 규칙을 만들고, AI가 사용자의 교정 패턴을 학습하게 하세요. 쓸수록 똑똑해집니다."
      >
        <CustomAIMockup platform={activeTab} />
        <CustomAIDetails />
      </GuideSection>

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

function ReminderContent() {
  return (
    <div className="space-y-5">
      {/* Reminder options */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">알림 옵션</h3>
        <p className="text-xs text-gray-500 mb-3">할 일이나 일정에 마감일을 설정하면, 아래 시점에 알림을 받을 수 있습니다. 여러 개를 동시에 선택할 수 있습니다.</p>
        <div className="flex flex-wrap gap-2">
          {['1주일 전', '2일 전', '1일 전', '1시간 전', '10분 전'].map((option) => (
            <span key={option} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              {option}
            </span>
          ))}
        </div>
      </div>

      {/* Notification preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">알림 미리보기</h3>
        <div className="max-w-sm bg-white border border-gray-200 rounded-2xl p-3 shadow-lg">
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
        </div>
      </div>

      {/* How to set */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">설정 방법</h3>
        <ol className="text-xs text-gray-500 space-y-1.5 ml-4 list-decimal">
          <li>항목을 탭해서 상세 화면을 엽니다.</li>
          <li>편집 버튼을 눌러 마감일을 설정합니다.</li>
          <li>리마인더 섹션에서 원하는 알림 시점을 선택합니다.</li>
          <li>저장하면 해당 시점에 푸시 알림이 발송됩니다.</li>
        </ol>
      </div>
    </div>
  );
}
