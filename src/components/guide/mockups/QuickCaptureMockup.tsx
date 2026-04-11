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

      {/* Search bar */}
      <div className="px-3 pt-2 pb-1">
        <div className="bg-white/80 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border border-gray-200/60">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-[8px] text-gray-400">검색...</span>
        </div>
      </div>

      {/* Input area */}
      <div className="px-3 py-1.5">
        <div className="bg-white rounded-xl border border-gray-200/80 p-2.5 shadow-sm">
          <div className="min-h-[36px] flex items-start">
            <span className="text-[9px] text-gray-400">생각을 입력하세요...</span>
          </div>
        </div>
        {/* Attachment icons row */}
        <div className="flex items-center justify-between mt-1.5 px-0.5">
          <div className="flex items-center gap-2.5">
            {[
              ['M4 20h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z', 'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14'],
              ['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
              ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
              ['M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z', 'M19 10v1a7 7 0 0 1-14 0v-1', 'M12 19v3'],
            ].map((paths, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {paths.map((d, j) => <path key={j} d={d} />)}
              </svg>
            ))}
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 py-1 overflow-x-auto">
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
              : { backgroundColor: cat.color + '20', color: cat.color }}
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Today Dashboard */}
      <div className="mx-3 mt-1.5 mb-1.5 rounded-lg border border-gray-200/60 bg-white/50 shadow-sm">
        <div className="flex items-center justify-between px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span className="text-[9px] font-semibold text-blue-600">오늘의 대시보드</span>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* Entry cards */}
      <div className="flex-1 px-3 space-y-1.5 overflow-hidden">
        {[
          { cats: ['아이디어', '할 일'], catColors: ['#EAB308', '#3B82F6'], ctx: '개인', ctxColor: '#3B82F6', time: '3시간 전', text: '새로운 독서 앱 아이디어 정리', tags: ['#앱', '#기획', '#독서'], pinned: true, hasCheck: true },
          { cats: ['일정'], catColors: ['#F97316'], ctx: '업무', ctxColor: '#7C3AED', time: '1일 전', text: '금요일 오후 3시 팀 미팅', tags: ['#미팅', '#기획'], pinned: false, hasCheck: false },
        ].map((entry, i) => (
          <div key={i} className="bg-white rounded-xl p-2.5 border border-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                {entry.cats.map((cat, ci) => (
                  <span key={ci} className="text-[6.5px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: entry.catColors[ci] + '18', color: entry.catColors[ci] }}>
                    {cat}
                  </span>
                ))}
                <span className="text-[6.5px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-0.5" style={{ backgroundColor: entry.ctxColor + '18', color: entry.ctxColor }}>
                  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {entry.ctx}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[6px] text-gray-400">{entry.time}</span>
                {entry.pinned && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="#60A5FA" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
                    <path d="M5 11h14l-1.5 6H6.5L5 11z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              {entry.hasCheck && (
                <div className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
              )}
              <p className="text-[9px] text-gray-800 font-medium leading-snug">{entry.text}</p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {entry.tags.map((tag) => (
                <span key={tag} className="text-[6.5px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </div>
        ))}
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
    <div className="bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-pink-50/60 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200/60 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">B</span>
          </div>
          <span className="text-xs font-bold text-gray-900">BrainDump</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-medium text-gray-600 border border-gray-200 rounded-lg px-2 py-1 bg-white/50">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          전체
        </div>
      </div>

      <div className="p-4">
        {/* Input area */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm">
          <div className="min-h-[48px] mb-2">
            <span className="text-[10px] text-gray-400">생각을 입력하세요...</span>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-2">
            {[
              ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
              ['M4 20h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z', 'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14'],
              ['M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z', 'M19 10v1a7 7 0 0 1-14 0v-1', 'M12 19v3'],
            ].map((paths, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {paths.map((d, j) => <path key={j} d={d} />)}
              </svg>
            ))}
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="rounded-lg border border-gray-200/60 bg-white/50 shadow-sm mb-3">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="text-[10px] font-semibold text-gray-700">4월 12일 토요일</span>
              <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 rounded-full">2</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-2 flex-wrap">
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
              className="text-[8px] font-medium px-2.5 py-1 rounded-lg"
              style={'active' in cat
                ? { backgroundColor: '#1a1a1a', color: 'white' }
                : { backgroundColor: cat.color + '20', color: cat.color }}
            >
              {cat.label}
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white/80 border border-gray-200/60 rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-[9px] text-gray-400">검색...</span>
        </div>

        {/* Entry cards */}
        <div className="space-y-2">
          {[
            { cats: ['아이디어', '할 일'], catColors: ['#EAB308', '#3B82F6'], ctx: '개인', time: '3시간 전', text: '새로운 독서 앱 아이디어 정리', tags: ['#앱', '#기획'], pinned: true, hasCheck: true },
            { cats: ['지식'], catColors: ['#A855F7'], ctx: '개인', time: '2시간 전', text: 'React 상태 관리 패턴 정리', tags: ['#React', '#개발'], pinned: false, hasCheck: false },
          ].map((entry, i) => (
            <div key={i} className="bg-white px-3 py-2.5 rounded-xl border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  {entry.cats.map((cat, ci) => (
                    <span key={ci} className="text-[7px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: entry.catColors[ci] + '18', color: entry.catColors[ci] }}>
                      {cat}
                    </span>
                  ))}
                  <span className="text-[7px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-0.5" style={{ backgroundColor: '#3B82F618', color: '#3B82F6' }}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {entry.ctx}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400">{entry.time}</span>
                  {entry.pinned && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#60A5FA" stroke="#60A5FA" strokeWidth="1.5">
                      <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
                      <path d="M5 11h14l-1.5 6H6.5L5 11z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                {entry.hasCheck && (
                  <div className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
                )}
                <p className="text-[10px] text-gray-800 font-medium">{entry.text}</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-[7px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuickCaptureDetails({ platform }: { platform: Platform }) {
  return (
    <div className="mt-6 space-y-5">
      {/* Input methods */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">입력 방식</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { title: '텍스트', desc: '생각을 바로 타이핑하세요. 짧은 메모부터 긴 글까지 자유롭게.', d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', color: '#3B82F6' },
            { title: '음성', desc: '말하면 AI가 자동으로 텍스트로 변환합니다. 한국어 음성 인식.', d: 'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v1a7 7 0 0 1-14 0v-1M12 19v3', color: '#EF4444' },
            { title: '사진', desc: '사진을 찍거나 앨범에서 선택하면 AI가 내용을 분석합니다.', d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', color: '#22C55E' },
            { title: 'PDF', desc: 'PDF 문서를 업로드하면 텍스트를 추출하고 자동 분류합니다.', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', color: '#F97316' },
          ].map((method) => (
            <div key={method.title} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: method.color + '15' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={method.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={method.d} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">{method.title}</span>
              </div>
              <p className="text-xs text-gray-500">{method.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Touch Quick Actions - iOS only */}
      {platform === 'ios' && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">퀵 액션 (길게 누르기)</h3>
          <p className="text-xs text-gray-500 mb-3">홈 화면에서 BrainDump 앱 아이콘을 길게 누르면 바로 기록을 시작할 수 있습니다.</p>
          <div className="max-w-xs">
            {/* iOS context menu style */}
            <div className="bg-white/95 backdrop-blur rounded-2xl overflow-hidden shadow-xl border border-gray-200/50">
              {[
                { icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', title: '사진 메모', sub: '사진으로 기록하기' },
                { icon: 'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v1a7 7 0 0 1-14 0v-1', title: '음성 메모', sub: '음성으로 기록하기' },
                { icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', title: '빠른 메모', sub: '텍스트로 기록하기' },
              ].map((action, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-200/50' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={action.icon} />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-400">{action.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Extension - iOS only */}
      {platform === 'ios' && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">공유 확장</h3>
          <p className="text-xs text-gray-500">
            Safari, 메모, 카카오톡 등 다른 앱에서 공유 버튼을 누르고 BrainDump를 선택하면, 해당 내용이 바로 기록됩니다. 개인/업무 맥락도 공유 시점에 선택할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}

export function QuickCaptureMockup({ platform }: { platform: Platform }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent /> : <WebContent />}
    </MockupFrame>
  );
}
