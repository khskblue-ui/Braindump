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

      {/* Category tabs - 할 일 selected */}
      <div className="flex gap-1 px-3 py-1 overflow-x-auto">
        {[
          { label: '전체', active: false, color: '' },
          { label: '할 일', active: true, color: '#3B82F6' },
          { label: '아이디어', active: false, color: '#EAB308' },
          { label: '메모', active: false, color: '#22C55E' },
          { label: '지식', active: false, color: '#A855F7' },
          { label: '일정', active: false, color: '#F97316' },
        ].map((cat) => (
          <span
            key={cat.label}
            className="shrink-0 text-[7px] font-medium px-2 py-1 rounded-lg"
            style={
              cat.label === '전체'
                ? { backgroundColor: '#f3f4f6', color: '#6b7280' }
                : cat.active
                  ? { backgroundColor: cat.color + '30', color: cat.color }
                  : { backgroundColor: cat.color + '15', color: cat.color, opacity: 0.5 }
            }
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Context sub-filter */}
      <div className="flex gap-1 px-3 py-1">
        {[
          { label: '전체', active: false },
          { label: '개인', active: false, color: '#3B82F6' },
          { label: '업무', active: true, color: '#7C3AED' },
        ].map((f) => (
          <span
            key={f.label}
            className="text-[7px] font-medium px-2 py-0.5 rounded-full border"
            style={f.active
              ? { color: f.color, borderColor: f.color, backgroundColor: f.color + '0D' }
              : { borderColor: '#e5e7eb', color: '#9ca3af' }}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* Entry cards */}
      <div className="flex-1 px-3 space-y-1.5 pt-1 overflow-hidden">
        {[
          { text: '분기 보고서 작성', tags: ['#보고서'], time: '3시간 전' },
          { text: '프로젝트 계획서 검토', tags: ['#프로젝트'], time: '5시간 전' },
          { text: '팀 회식 장소 예약', tags: ['#회식'], time: '1일 전' },
        ].map((entry, i) => (
          <div key={i} className="bg-white rounded-xl p-2.5 border border-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[6.5px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#3B82F618', color: '#3B82F6' }}>
                  할 일
                </span>
                <span className="text-[6.5px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-0.5" style={{ backgroundColor: '#7C3AED18', color: '#7C3AED' }}>
                  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 12h6M12 9v6" fill="white" />
                  </svg>
                  업무
                </span>
              </div>
              <span className="text-[6px] text-gray-400">{entry.time}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <div className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
              <p className="text-[9px] text-gray-800 font-medium">{entry.text}</p>
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
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 min-h-full">
      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 mb-3 shadow-sm">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="text-[9px] text-gray-400">검색어를 입력하세요...</span>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {[
          { label: '전체', active: false, color: '' },
          { label: '할 일', active: true, color: '#3B82F6' },
          { label: '아이디어', active: false, color: '#EAB308' },
          { label: '메모', active: false, color: '#22C55E' },
          { label: '지식', active: false, color: '#A855F7' },
          { label: '일정', active: false, color: '#F97316' },
        ].map((cat) => (
          <span
            key={cat.label}
            className="text-[8px] font-medium px-2.5 py-1 rounded-lg"
            style={
              cat.label === '전체'
                ? { backgroundColor: '#f3f4f6', color: '#6b7280' }
                : cat.active
                  ? { backgroundColor: cat.color + '30', color: cat.color }
                  : { backgroundColor: cat.color + '15', color: cat.color, opacity: 0.5 }
            }
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Context sub-filter */}
      <div className="flex gap-1.5 mb-3">
        {[
          { label: '전체', active: false },
          { label: '개인', active: false, color: '#3B82F6' },
          { label: '업무', active: true, color: '#7C3AED' },
        ].map((f) => (
          <span
            key={f.label}
            className="text-[8px] font-medium px-2.5 py-1 rounded-full border"
            style={f.active
              ? { color: f.color, borderColor: f.color, backgroundColor: f.color + '0D' }
              : { borderColor: '#e5e7eb', color: '#9ca3af' }}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* Entry cards */}
      <div className="space-y-2">
        {[
          { text: '분기 보고서 작성', tags: ['#보고서'], time: '3시간 전' },
          { text: '프로젝트 계획서 검토', tags: ['#프로젝트'], time: '5시간 전' },
          { text: '팀 회식 장소 예약', tags: ['#회식'], time: '1일 전' },
        ].map((entry, i) => (
          <div key={i} className="bg-white px-3 py-2.5 rounded-xl border border-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#3B82F618', color: '#3B82F6' }}>
                  할 일
                </span>
                <span className="text-[7px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#7C3AED18', color: '#7C3AED' }}>
                  업무
                </span>
              </div>
              <span className="text-[7px] text-gray-400">{entry.time}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <div className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
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
  );
}

export function FilterSearchMockup({ platform }: { platform: Platform }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent /> : <WebContent />}
    </MockupFrame>
  );
}
