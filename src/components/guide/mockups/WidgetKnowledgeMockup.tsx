'use client';

import { MockupFrame } from '../MockupFrame';

type Platform = 'ios' | 'web';

function IOSContent() {
  return (
    <div className="px-2 pt-2 pb-3 space-y-2.5">
      {/* Widget 1: 다음 일정 */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-[8px] font-semibold text-gray-500">다음 일정</span>
        </div>
        <p className="text-[11px] font-bold text-gray-900 leading-tight">5월 31일 (일) 친구 결혼식</p>
        <p className="text-[8px] text-orange-500 font-medium mt-0.5">1개월 18일</p>
        <div className="border-t border-gray-100 mt-2 pt-2 space-y-1.5">
          {['PDF/사진 업로드 시 앱 속도 저하 해결', '약국 알코올 구매', '미분류 항목 자동 재분류 기능 개발'].map((text, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0" />
              <span className="text-[8px] text-gray-700">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 2: 고정된 항목 */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
            <path d="M5 11h14l-1.5 6H6.5L5 11z" />
          </svg>
          <span className="text-[8px] font-semibold text-gray-500">고정된 항목</span>
        </div>
        <div className="space-y-2">
          {[
            { text: 'PDF/사진 업로드 시 앱 속도 저하 해결', cat: '아이디어', color: '#EAB308' },
            { text: 'AI 급발전 예측 실패 원인 분석 및 컬럼...', cat: '아이디어', color: '#EAB308' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[8px] text-gray-700 flex-1 truncate">{item.text}</span>
              <span className="text-[7px] text-gray-400 shrink-0">{item.cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 3: 빠른 기록 (dark) */}
      <div className="bg-gray-900 rounded-2xl p-3 flex items-center gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">B</span>
          </div>
          <span className="text-[7px] text-gray-400">빠른 기록</span>
        </div>
        <div className="w-px h-10 bg-gray-700" />
        <div className="flex gap-3 flex-1 justify-center">
          {[
            { label: '텍스트', color: '#60A5FA', bg: '#DBEAFE' },
            { label: '음성', color: '#F87171', bg: '#FEE2E2' },
            { label: '사진', color: '#4ADE80', bg: '#DCFCE7' },
          ].map((btn) => (
            <div key={btn.label} className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: btn.bg }}>
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: btn.color }} />
              </div>
              <span className="text-[6px] text-gray-400">{btn.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WebContent() {
  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 min-h-full">
      {/* Knowledge base */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <span className="text-xs font-semibold text-gray-800">지식 베이스</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { topic: 'React / Next.js', count: 12, icon: '⚛️' },
            { topic: '요리 레시피', count: 8, icon: '🍳' },
            { topic: '독서 노트', count: 5, icon: '📚' },
            { topic: '투자 공부', count: 3, icon: '💰' },
          ].map((t) => (
            <div key={t.topic} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200/60 shadow-sm">
              <span className="text-sm">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-medium text-gray-800 block truncate">{t.topic}</span>
                <span className="text-[7px] text-gray-400">{t.count}개 항목</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminder section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="text-xs font-semibold text-gray-800">리마인더</span>
        </div>
        <div className="space-y-2">
          {[
            { text: '보고서 제출', time: '1시간 후', color: '#EF4444' },
            { text: '팀 미팅 자료 준비', time: '내일 오전', color: '#F97316' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-gray-200/60 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
              <span className="text-[9px] text-gray-800 font-medium flex-1">{r.text}</span>
              <span className="text-[8px] text-gray-400 shrink-0">{r.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Widget preview */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="8" height="8" rx="1" />
            <rect x="14" y="2" width="8" height="8" rx="1" />
            <rect x="2" y="14" width="8" height="8" rx="1" />
            <rect x="14" y="14" width="8" height="8" rx="1" />
          </svg>
          <span className="text-xs font-semibold text-gray-800">iOS 위젯</span>
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          홈 화면에 위젯을 추가하면 할 일 카운트, 오늘 일정, 고정 항목을 한눈에 볼 수 있습니다. 개인/업무별로 따로 설정할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export function WidgetKnowledgeMockup({ platform }: { platform: Platform }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent /> : <WebContent />}
    </MockupFrame>
  );
}
