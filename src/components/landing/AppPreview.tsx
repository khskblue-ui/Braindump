'use client';

import { ScrollReveal } from './ScrollReveal';

// Stylized mockup of the app UI (not real screenshots)
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
            {/* Phone mockup 1: Home */}
            <PhoneMockup title="홈">
              <div className="space-y-3">
                {/* Search bar */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className="text-[10px] text-gray-400">검색...</span>
                </div>

                {/* Input area */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 mb-2">생각을 입력하세요...</p>
                  <div className="flex items-center gap-2">
                    {['🖼', '📷', '📄', '🎤'].map((icon, i) => (
                      <span key={i} className="text-[10px]">{icon}</span>
                    ))}
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 overflow-hidden">
                  {[
                    { label: '전체', active: true },
                    { label: '할 일', color: '#3B82F6' },
                    { label: '아이디어', color: '#A855F7' },
                    { label: '메모', color: '#22C55E' },
                    { label: '일정', color: '#F97316' },
                  ].map((tab) => (
                    <span
                      key={tab.label}
                      className="text-[8px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
                      style={{
                        backgroundColor: tab.active ? '#000' : `${tab.color}15`,
                        color: tab.active ? '#fff' : tab.color,
                      }}
                    >
                      {tab.label}
                    </span>
                  ))}
                </div>

                {/* Entry cards */}
                <EntryCard
                  categories={[
                    { label: '할 일', color: '#3B82F6' },
                    { label: '회사', color: '#6B7280' },
                  ]}
                  text="분기 보고서 초안 작성"
                  tags={['#보고서', '#Q2']}
                  time="방금 전"
                />
                <EntryCard
                  categories={[
                    { label: '일정', color: '#F97316' },
                    { label: '할 일', color: '#3B82F6' },
                  ]}
                  text="금요일 오후 2시 팀 미팅"
                  tags={['#미팅', '#팀']}
                  time="5분 전"
                  date="4월 11일 14:00"
                />
                <EntryCard
                  categories={[
                    { label: '아이디어', color: '#A855F7' },
                  ]}
                  text="주간 리뷰 자동화 워크플로우"
                  tags={['#자동화', '#생산성']}
                  time="1시간 전"
                />
              </div>
            </PhoneMockup>

            {/* Phone mockup 2: Dashboard */}
            <PhoneMockup title="대시보드">
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-blue-700 mb-2">📋 오늘의 대시보드</p>
                  <div className="space-y-2">
                    <DashboardItem color="#EF4444" label="마감 임박" count="2" />
                    <DashboardItem color="#F97316" label="오늘 일정" count="3" />
                    <DashboardItem color="#3B82F6" label="진행 중인 할 일" count="5" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-purple-700 mb-2">📚 지식 모음</p>
                  <div className="space-y-1.5">
                    <KnowledgeItem title="디자인 시스템 가이드라인" count="3" />
                    <KnowledgeItem title="프로젝트 관리 방법론" count="2" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-green-700 mb-2">💡 최근 아이디어</p>
                  <div className="space-y-1.5">
                    <IdeaItem text="AI 기반 일정 자동 추천" />
                    <IdeaItem text="주간 리뷰 자동화 워크플로우" />
                  </div>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Sub-components ─── */

function PhoneMockup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[260px] mx-auto">
      <div className="bg-white rounded-[24px] border-2 border-gray-200 shadow-xl overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[9px] font-semibold text-gray-800">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 rounded-sm border border-gray-800 relative">
              <div className="absolute inset-0.5 bg-gray-800 rounded-[1px]" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">B</span>
          </div>
          <span className="text-xs font-bold">{title}</span>
        </div>
        {/* Content */}
        <div className="px-3 pb-4 max-h-[380px] overflow-hidden">
          {children}
        </div>
        {/* Bottom nav */}
        <div className="flex items-center justify-around py-2 border-t border-gray-100 bg-gray-50">
          {['홈', '지식', '휴지통', '설정'].map((nav, i) => (
            <span
              key={nav}
              className={`text-[8px] font-medium ${i === 0 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {nav}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntryCard({
  categories,
  text,
  tags,
  time,
  date,
}: {
  categories: { label: string; color: string }[];
  text: string;
  tags: string[];
  time: string;
  date?: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
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
        <span className="text-[7px] text-gray-300">{time}</span>
      </div>
      <p className="text-[9px] text-gray-800 font-medium">{text}</p>
      <div className="flex items-center gap-1 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="text-[7px] text-gray-400 bg-gray-50 px-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      {date && (
        <p className="text-[7px] text-orange-500">⏰ {date}</p>
      )}
    </div>
  );
}

function DashboardItem({ color, label, count }: { color: string; label: string; count: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[9px] text-gray-600">{label}</span>
      </div>
      <span className="text-[9px] font-bold" style={{ color }}>{count}</span>
    </div>
  );
}

function KnowledgeItem({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-gray-600">📖 {title}</span>
      <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{count}개</span>
    </div>
  );
}

function IdeaItem({ text }: { text: string }) {
  return (
    <p className="text-[9px] text-gray-600">✨ {text}</p>
  );
}
