'use client';

type Platform = 'ios' | 'web';

function WidgetCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-3 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

function IOSWidgets() {
  return (
    <div className="space-y-6">
      {/* Widget grid - matching actual screenshots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {/* 다음 일정 widget */}
        <WidgetCard>
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-[10px] font-semibold text-gray-500">다음 일정</span>
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">6월 15일 (월) 프로젝트 발표</p>
          <p className="text-xs text-orange-500 font-medium mt-0.5">2개월 4일</p>
          <div className="border-t border-gray-100 mt-2.5 pt-2.5 space-y-2">
            {['디자인 시안 피드백 전달', '마트 장보기', '주간 보고서 작성'].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                <span className="text-xs text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* 고정된 항목 widget */}
        <WidgetCard>
          <div className="flex items-center gap-1.5 mb-2.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
              <path d="M5 11h14l-1.5 6H6.5L5 11z" />
            </svg>
            <span className="text-[10px] font-semibold text-gray-500">고정된 항목</span>
          </div>
          <div className="space-y-2.5">
            {[
              { text: '앱 다크모드 디자인 컨셉 정리', cat: '아이디어', color: '#EAB308' },
              { text: '사이드 프로젝트 기술 스택 비교 분석', cat: '아이디어', color: '#EAB308' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-0.5 h-7 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-700 flex-1 truncate">{item.text}</span>
                <span className="text-[10px] text-gray-400 shrink-0">{item.cat}</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>

      {/* 빠른 기록 widget (dark, full width) */}
      <div className="max-w-lg mx-auto bg-gray-900 rounded-2xl p-4 flex items-center gap-4">
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <span className="text-[10px] text-gray-400">빠른 기록</span>
        </div>
        <div className="w-px h-12 bg-gray-700" />
        <div className="flex gap-4 flex-1 justify-center">
          {[
            { label: '텍스트', color: '#60A5FA', bg: '#DBEAFE', paths: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'] },
            { label: '음성', color: '#F87171', bg: '#FEE2E2', paths: ['M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z', 'M19 10v1a7 7 0 0 1-14 0v-1', 'M12 19v3'] },
            { label: '사진', color: '#4ADE80', bg: '#DCFCE7', paths: ['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'] },
          ].map((btn) => (
            <div key={btn.label} className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: btn.bg }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={btn.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {btn.paths.map((d, j) => <path key={j} d={d} />)}
                </svg>
              </div>
              <span className="text-[10px] text-gray-400">{btn.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Island */}
      <div className="max-w-lg mx-auto">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">다이나믹 아일랜드 · 잠금 화면</h4>
        <div className="bg-gray-950 rounded-[2rem] p-4 pb-5 space-y-3">
          {/* Dynamic Island expanded */}
          <div className="mx-auto max-w-[280px]">
            <div className="bg-gray-900 rounded-[1.5rem] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">B</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-white">할 일 3개</p>
                    <p className="text-[7px] text-gray-400">남은 할 일</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-medium text-orange-400">팀 미팅</p>
                  <p className="text-[7px] text-gray-400">30분 후</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
                <span className="text-[7px] font-medium text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">업무</span>
                <span className="text-[7px] text-gray-500">할 일 3개 · 다음 일정 30분 후</span>
              </div>
            </div>
          </div>

          {/* Lock screen widget */}
          <div className="mx-auto max-w-[260px] bg-gray-800/60 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">3</p>
                <span className="text-[7px] font-medium text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">개인</span>
                <p className="text-[7px] text-gray-400 mt-0.5">할 일</p>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div>
                <p className="text-[7px] text-gray-400">다음 일정</p>
                <p className="text-[10px] font-medium text-white">팀 미팅</p>
                <p className="text-[8px] text-orange-400">30분 후</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebWidgets() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">iOS 위젯 종류</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: '다음 일정', desc: '다가오는 일정과 미완료 할 일을 한눈에 보여줍니다. 마감 카운트다운이 표시됩니다.', iconPath: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18', color: '#F97316' },
            { title: '고정된 항목', desc: '핀 고정한 중요 항목을 카테고리 색상과 함께 표시합니다.', iconPath: 'M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7M5 11h14l-1.5 6H6.5L5 11z', color: '#EF4444' },
            { title: '할 일 카운트', desc: '오늘 남은 할 일 개수와 완료 진행률을 원형 프로그레스로 보여줍니다.', iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', color: '#3B82F6' },
            { title: '빠른 기록', desc: '텍스트, 음성, 사진 버튼을 탭해서 바로 기록을 시작합니다.', iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', color: '#EAB308' },
          ].map((w) => (
            <div key={w.title} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: w.color + '1A' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={w.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={w.iconPath} />
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{ color: w.color }}>{w.title}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">개인/업무 위젯 분리</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          모든 위젯은 개인/업무 버전을 따로 추가할 수 있습니다. 개인 할 일 위젯과 업무 할 일 위젯을 홈 화면에 나란히 배치하면, 맥락별로 오늘의 할 일을 한눈에 파악할 수 있습니다.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">다이나믹 아일랜드</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          잠금 화면과 다이나믹 아일랜드에서 남은 할 일 개수와 다음 일정까지의 시간을 실시간으로 확인할 수 있습니다. 다음 일정이 1시간 이내이면 카운트다운 타이머가 표시됩니다.
        </p>
      </div>
    </div>
  );
}

export function WidgetMockup({ platform }: { platform: Platform }) {
  if (platform === 'ios') {
    return <IOSWidgets />;
  }
  return <WebWidgets />;
}
