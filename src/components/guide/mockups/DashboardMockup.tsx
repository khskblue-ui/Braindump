'use client';

import { MockupFrame } from '../MockupFrame';

type Platform = 'ios' | 'web';

function IOSContent() {
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

      {/* Category tabs */}
      <div className="flex gap-1 px-3 py-1.5 overflow-x-auto">
        {[
          { label: '전체', active: true, color: '' },
          { label: '할 일', color: '#3B82F6' },
          { label: '아이디어', color: '#EAB308' },
          { label: '메모', color: '#22C55E' },
          { label: '지식', color: '#A855F7' },
          { label: '일정', color: '#F97316' },
        ].map((cat) => (
          <span
            key={cat.label}
            className="shrink-0 text-[7px] font-medium px-2 py-1 rounded-lg"
            style={'active' in cat
              ? { backgroundColor: '#1a1a1a', color: 'white' }
              : { backgroundColor: cat.color + '15', color: cat.color, opacity: 0.5 }}
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Dashboard - expanded */}
      <div className="mx-3 mt-1 rounded-lg border border-gray-200/60 bg-white/50 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-2.5 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span className="text-[9px] font-semibold text-blue-600">오늘의 대시보드</span>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* Overdue section */}
        <div className="px-2.5 py-1.5 border-b border-gray-100/50">
          <div className="flex items-center gap-1 mb-1.5">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <span className="text-[7px] font-semibold text-orange-600">지난 항목</span>
            <span className="text-[6px] text-gray-400 bg-gray-100 px-1 rounded-full">2</span>
          </div>
          {[
            { text: '분기 보고서 제출', color: '#3B82F6', date: '어제' },
            { text: '프로젝트 발표 자료', color: '#F97316', date: '3일 전' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 py-1">
              <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[8px] text-gray-700 flex-1 truncate">{item.text}</span>
              <span className="text-[6px] text-red-400">{item.date}</span>
            </div>
          ))}
        </div>

        {/* Today section */}
        <div className="px-2.5 py-1.5 border-b border-gray-100/50">
          <div className="flex items-center gap-1 mb-1.5">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-[7px] font-semibold text-blue-600">오늘 일정</span>
            <span className="text-[6px] text-gray-400 bg-gray-100 px-1 rounded-full">1</span>
          </div>
          <div className="flex items-center gap-1.5 py-1">
            <div className="w-0.5 h-4 rounded-full bg-orange-400" />
            <span className="text-[8px] text-gray-700 flex-1">14:00 팀 미팅</span>
            <span className="text-[6px] text-gray-400">오후 2시</span>
          </div>
        </div>

        {/* Recent section */}
        <div className="px-2.5 py-1.5">
          <div className="flex items-center gap-1 mb-1.5">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l2 2" />
            </svg>
            <span className="text-[7px] font-semibold text-green-600">최근 추가</span>
            <span className="text-[6px] text-gray-400 bg-gray-100 px-1 rounded-full">3</span>
          </div>
          {[
            { text: '앱 다크모드 디자인 아이디어', color: '#EAB308', pinned: true },
            { text: 'JavaScript 클로저 개념 정리', color: '#A855F7', pinned: false },
            { text: '주간 회의 안건 정리', color: '#22C55E', pinned: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 py-1">
              <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[8px] text-gray-700 flex-1 truncate">{item.text}</span>
              {item.pinned && (
                <svg width="7" height="7" viewBox="0 0 24 24" fill="#60A5FA" stroke="#60A5FA" strokeWidth="1.5">
                  <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
                  <path d="M5 11h14l-1.5 6H6.5L5 11z" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Entry card preview */}
      <div className="px-3 mt-2 space-y-1.5 flex-1 overflow-hidden">
        <div className="bg-white rounded-xl p-2.5 border border-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="text-[6.5px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#EAB30818', color: '#EAB308' }}>아이디어</span>
              <span className="text-[6.5px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#3B82F618', color: '#3B82F6' }}>할 일</span>
              <span className="text-[6.5px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-0.5" style={{ backgroundColor: '#3B82F618', color: '#3B82F6' }}>
                <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                개인
              </span>
            </div>
            <span className="text-[6px] text-gray-400">4시간 전</span>
          </div>
          <p className="text-[9px] text-gray-800 font-medium">앱 다크모드 디자인 아이디어</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[6.5px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">#디자인</span>
            <span className="text-[6.5px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">#UI</span>
          </div>
        </div>
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

function WebContent() {
  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 min-h-full">
      {/* Dashboard card */}
      <div className="rounded-xl border border-gray-200/60 bg-white/60 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span className="text-xs font-semibold text-blue-600">오늘의 대시보드</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* Sections */}
        <div className="divide-y divide-gray-100/50">
          {/* Overdue */}
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
              <span className="text-[10px] font-semibold text-orange-600">지난 항목</span>
              <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 rounded-full">2</span>
            </div>
            {[
              { text: '분기 보고서 제출', color: '#3B82F6', date: '어제' },
              { text: '프로젝트 발표 자료', color: '#F97316', date: '3일 전' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-gray-700 flex-1">{item.text}</span>
                <span className="text-[8px] text-red-400">{item.date}</span>
              </div>
            ))}
          </div>

          {/* Today */}
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="text-[10px] font-semibold text-blue-600">오늘 일정</span>
            </div>
            <div className="flex items-center gap-2 py-1">
              <div className="w-0.5 h-5 rounded-full bg-orange-400" />
              <span className="text-[10px] text-gray-700 flex-1">14:00 팀 미팅</span>
              <span className="text-[8px] text-gray-400">오후 2시</span>
            </div>
          </div>

          {/* Recent */}
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l2 2" />
              </svg>
              <span className="text-[10px] font-semibold text-green-600">최근 추가</span>
              <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 rounded-full">3</span>
            </div>
            {[
              { text: '앱 다크모드 디자인 아이디어', color: '#EAB308' },
              { text: 'JavaScript 클로저 개념 정리', color: '#A855F7' },
              { text: '주간 회의 안건 정리', color: '#22C55E' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-gray-700 flex-1">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardMockup({ platform }: { platform: Platform }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent /> : <WebContent />}
    </MockupFrame>
  );
}

export function DashboardDetails() {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">대시보드 구성</h3>
        <p className="text-xs text-gray-500 mb-3">홈 화면 상단의 대시보드는 세 가지 섹션으로 오늘의 할 일을 한눈에 보여줍니다.</p>
        <div className="space-y-2.5">
          {[
            { title: '지난 항목', desc: '마감일이 지난 미완료 할 일과 일정을 표시합니다. 놓친 항목을 빠르게 확인하세요.', color: '#F97316', iconPath: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01' },
            { title: '오늘 일정', desc: '오늘 마감인 할 일과 오늘 예정된 일정을 보여줍니다.', color: '#3B82F6', iconPath: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18' },
            { title: '최근 추가', desc: '최근 24시간 이내 추가된 항목입니다. 새로 기록한 내용을 바로 확인할 수 있습니다.', color: '#22C55E', iconPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4l2 2' },
          ].map((section) => (
            <div key={section.title} className="flex gap-3 items-start">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: section.color + '1A' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={section.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={section.iconPath} />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold" style={{ color: section.color }}>{section.title}</span>
                <p className="text-xs text-gray-500 mt-0.5">{section.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">핀 고정</h3>
        <p className="text-xs text-gray-500">중요한 항목은 길게 눌러 &ldquo;핀 고정&rdquo;하면 목록 상단에 고정됩니다. 위젯에서도 고정된 항목을 바로 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}
