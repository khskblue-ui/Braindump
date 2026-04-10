'use client';

import { ScrollReveal } from './ScrollReveal';

// Accurate mockup matching the real BrainDump app UI
export function AppPreview() {
  return (
    <section className="px-6 py-20 sm:py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-gray-400 mb-2">
              # App Preview
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              심플하지만 강력한 인터페이스
            </h2>
            <p className="mt-4 text-gray-500 max-w-md mx-auto">
              열자마자 바로 입력. 나머지는 AI가 알아서.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
            <PhoneMockup>
              <HomeScreen />
            </PhoneMockup>
            <PhoneMockup>
              <KnowledgeScreen />
            </PhoneMockup>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Phone Mockup Shell ─── */
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[260px] mx-auto">
      <div className="bg-white rounded-[28px] border border-gray-200 shadow-2xl overflow-hidden">
        {/* Notch / Dynamic Island */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-20 h-5 bg-black rounded-full" />
        </div>
        {/* Content */}
        <div className="min-h-[460px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Home Screen ─── */
function HomeScreen() {
  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-100">
        <BDLogo />
        <span className="text-xs font-bold">BrainDump</span>
      </div>

      <div className="px-3 py-2 flex-1 space-y-2.5 overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
          <SearchIcon />
          <span className="text-[10px] text-gray-400">검색...</span>
        </div>

        {/* Quick capture */}
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 mb-2">생각을 입력하세요...</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ImageIcon />
              <CameraIcon />
              <DocIcon />
              <MicIcon />
            </div>
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <SendIcon />
            </div>
          </div>
        </div>

        {/* Category tabs — matches real app */}
        <div className="flex gap-1 overflow-hidden">
          {[
            { label: '전체', color: '#000', active: true },
            { label: '할 일', color: '#3B82F6' },
            { label: '아이디어', color: '#EAB308' },
            { label: '메모', color: '#22C55E' },
            { label: '지식', color: '#A855F7' },
            { label: '일정', color: '#F97316' },
          ].map((tab) => (
            <span
              key={tab.label}
              className="text-[8px] px-2 py-1 rounded-lg whitespace-nowrap font-medium flex-shrink-0"
              style={{
                backgroundColor: tab.active ? '#111' : `${tab.color}15`,
                color: tab.active ? '#fff' : tab.color,
              }}
            >
              {tab.label}
            </span>
          ))}
        </div>

        {/* Today Dashboard */}
        <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DashboardIcon />
            <span className="text-[10px] font-bold text-blue-700">오늘의 대시보드</span>
          </div>
          <ChevronIcon />
        </div>

        {/* Entry cards — matches real app style */}
        <EntryCard
          categories={[
            { label: '할 일', color: '#3B82F6' },
            { label: '회사', color: '#6B7280' },
          ]}
          text="분기 보고서 초안 작성"
          tags={['#보고서', '#Q2']}
          time="방금 전"
          pinned
        />
        <EntryCard
          categories={[
            { label: '할 일', color: '#3B82F6' },
            { label: '일정', color: '#F97316' },
          ]}
          text="금요일 디자인팀 미팅 자료 준비"
          tags={['#미팅', '#디자인']}
          time="5분 전"
          date="4월 11일 14:00"
        />
        <EntryCard
          categories={[
            { label: '아이디어', color: '#EAB308' },
          ]}
          text="주간 리뷰 자동화 워크플로우"
          tags={['#자동화', '#생산성']}
          time="1시간 전"
        />
      </div>

      {/* Bottom Navigation — matches real app */}
      <BottomNav activeIndex={0} />
    </>
  );
}

/* ─── Knowledge Screen ─── */
function KnowledgeScreen() {
  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-100">
        <BDLogo />
        <span className="text-xs font-bold">BrainDump</span>
      </div>

      <div className="px-4 py-3 flex-1 space-y-3">
        <h2 className="text-lg font-bold">지식 모음</h2>

        <div className="space-y-0 divide-y divide-gray-100">
          <KnowledgeItem
            title="디자인 시스템 가이드라인"
            time="2일 전"
            count={3}
          />
          <KnowledgeItem
            title="프로젝트 관리 방법론 정리"
            time="1주 전"
            count={2}
          />
          <KnowledgeItem
            title="React 성능 최적화 패턴"
            time="2주 전"
            count={4}
          />
        </div>
      </div>

      <BottomNav activeIndex={1} />
    </>
  );
}

/* ─── Entry Card (matches real app) ─── */
function EntryCard({
  categories,
  text,
  tags,
  time,
  date,
  pinned,
}: {
  categories: { label: string; color: string }[];
  text: string;
  tags: string[];
  time: string;
  date?: string;
  pinned?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <span
              key={cat.label}
              className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
            >
              {cat.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] text-gray-300">{time}</span>
          {pinned && <PinIcon />}
        </div>
      </div>
      <div className="flex items-start gap-2">
        {categories.some(c => c.label === '할 일') && (
          <div className="w-3.5 h-3.5 rounded border border-gray-300 flex-shrink-0 mt-0.5" />
        )}
        <p className="text-[9px] text-gray-800 font-medium leading-relaxed">{text}</p>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="text-[7px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
      {date && (
        <p className="text-[7px] text-orange-500 flex items-center gap-0.5">
          <ClockIcon />
          {date}
        </p>
      )}
    </div>
  );
}

/* ─── Knowledge Item ─── */
function KnowledgeItem({ title, time, count }: { title: string; time: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <BookIcon />
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-gray-800 truncate">{title}</p>
          <p className="text-[8px] text-gray-400">{time}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{count}개</span>
        <ChevronIcon />
      </div>
    </div>
  );
}

/* ─── Bottom Navigation ─── */
function BottomNav({ activeIndex }: { activeIndex: number }) {
  const tabs = [
    { label: '홈', icon: HomeNavIcon },
    { label: '지식', icon: BookNavIcon },
    { label: '휴지통', icon: TrashNavIcon },
    { label: '설정', icon: SettingsNavIcon },
  ];

  return (
    <div className="flex items-center justify-around py-2.5 border-t border-gray-100 bg-white/95 mt-auto">
      {tabs.map(({ label, icon: Icon }, i) => {
        const isActive = i === activeIndex;
        return (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon active={isActive} />
            <span
              className={`text-[8px] ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── SVG Icons (matching lucide style used in real app) ─── */

function BDLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
      <defs>
        <linearGradient id="preview-logo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#preview-logo)" />
      <path d="M10 8h6c2.2 0 4 1.8 4 4 0 1.5-.8 2.7-2 3.4 1.6.6 2.8 2.2 2.8 4.1 0 2.5-2 4.5-4.5 4.5H10V8z M13 11v3.5h2.5c1 0 1.7-.8 1.7-1.75S16.5 11 15.5 11H13z M13 17.5V21h3c1.1 0 2-.9 2-1.75s-.9-1.75-2-1.75H13z" fill="white" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 1 1 0 0 0 1-1V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1 1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function HomeNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B82F6' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BookNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B82F6' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function TrashNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B82F6' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SettingsNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B82F6' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
