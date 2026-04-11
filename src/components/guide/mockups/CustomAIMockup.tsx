'use client';

import { MockupFrame } from '../MockupFrame';

type Platform = 'ios' | 'web';

function IOSContent() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-200/60">
        <div className="flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="text-[9px] text-blue-500">설정</span>
        </div>
        <span className="text-[10px] font-semibold text-gray-900">나의 분류 규칙</span>
        <div className="w-8" />
      </div>

      {/* Rule input form */}
      <div className="px-3 py-3 bg-white border-b border-gray-200/60">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-2.5 py-1.5">
            <span className="text-[8px] text-gray-400">키워드 입력...</span>
          </div>
          <button className="text-[8px] font-medium text-white bg-blue-500 px-2.5 py-1.5 rounded-lg">
            규칙 추가
          </button>
        </div>
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1">
            <span className="text-[7px] text-gray-500">카테고리:</span>
            <span className="text-[7px] font-medium text-blue-500">할 일</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1">
            <span className="text-[7px] text-gray-500">맥락:</span>
            <span className="text-[7px] font-medium text-purple-500">업무</span>
          </div>
        </div>
      </div>

      {/* Existing rules list */}
      <div className="flex-1 px-3 pt-2">
        <p className="text-[8px] text-gray-400 font-medium mb-1.5 px-1">등록된 규칙</p>
        <div className="space-y-1.5">
          {[
            { keyword: '회의', cat: '일정', catColor: '#F97316', ctx: '업무', ctxColor: '#7C3AED' },
            { keyword: '장보기', cat: '할 일', catColor: '#3B82F6', ctx: '개인', ctxColor: '#3B82F6' },
            { keyword: '독서', cat: '지식', catColor: '#A855F7', ctx: null, ctxColor: '' },
            { keyword: '운동', cat: '할 일', catColor: '#3B82F6', ctx: '개인', ctxColor: '#3B82F6' },
            { keyword: '보고서', cat: '할 일', catColor: '#3B82F6', ctx: '업무', ctxColor: '#7C3AED' },
          ].map((rule, i) => (
            <div key={i} className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-semibold text-gray-800">&ldquo;{rule.keyword}&rdquo;</span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: rule.catColor + '18', color: rule.catColor }}>
                  {rule.cat}
                </span>
                {rule.ctx && (
                  <span className="text-[7px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: rule.ctxColor + '18', color: rule.ctxColor }}>
                    {rule.ctx}
                  </span>
                )}
              </div>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="flex items-center justify-around h-10 border-t border-gray-200/60 bg-white mt-auto">
        {[
          { label: '홈', active: false, d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
          { label: '지식', active: false, d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' },
          { label: '휴지통', active: false, d: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' },
          { label: '설정', active: true, d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' },
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
      <h3 className="text-sm font-semibold text-gray-900 mb-3">나의 분류 규칙</h3>

      {/* Rule input */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-[9px] text-gray-400">키워드 입력...</span>
          </div>
          <button className="text-[9px] font-medium text-white bg-blue-500 px-3 py-1.5 rounded-lg">
            추가
          </button>
        </div>
        <div className="flex gap-2">
          <span className="text-[8px] text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">카테고리: <strong className="text-blue-500">할 일</strong></span>
          <span className="text-[8px] text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">맥락: <strong className="text-purple-500">업무</strong></span>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {[
          { keyword: '회의', cat: '일정', catColor: '#F97316', ctx: '업무' },
          { keyword: '장보기', cat: '할 일', catColor: '#3B82F6', ctx: '개인' },
          { keyword: '독서', cat: '지식', catColor: '#A855F7', ctx: null },
        ].map((rule, i) => (
          <div key={i} className="bg-white px-3 py-2 rounded-xl border border-gray-200/60 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-800">&ldquo;{rule.keyword}&rdquo;</span>
              <span className="text-[8px] text-gray-400">→</span>
              <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: rule.catColor + '18', color: rule.catColor }}>
                {rule.cat}
              </span>
              {rule.ctx && (
                <span className="text-[8px] font-medium text-gray-500">{rule.ctx}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomAIMockup({ platform }: { platform: Platform }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent /> : <WebContent />}
    </MockupFrame>
  );
}

export function CustomAIDetails() {
  return (
    <div className="mt-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">분류 우선순위</h3>
        <p className="text-xs text-gray-500 mb-3">AI 분류는 세 단계로 동작하며, 위에서부터 우선 적용됩니다.</p>
        <div className="space-y-2">
          {[
            { num: '1', title: '커스텀 규칙', desc: '키워드가 포함되면 설정한 카테고리와 맥락이 바로 적용됩니다.', color: '#3B82F6' },
            { num: '2', title: '교정 이력 학습', desc: 'AI가 분류한 결과를 사용자가 수정하면, 비슷한 내용에 대해 수정된 패턴을 학습합니다.', color: '#A855F7' },
            { num: '3', title: 'AI 자동 분류', desc: '규칙이나 학습된 패턴이 없으면, AI가 내용을 분석해 자동으로 분류합니다.', color: '#22C55E' },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: step.color }}>
                {step.num}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">{step.title}</span>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">커스텀 규칙 예시</h3>
        <div className="bg-gray-50 rounded-lg p-3">
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>&ldquo;<strong>회의</strong>&rdquo; 포함 → <span className="font-medium text-orange-500">일정</span> + <span className="font-medium text-purple-500">업무</span></li>
            <li>&ldquo;<strong>장보기</strong>&rdquo; 포함 → <span className="font-medium text-blue-500">할 일</span> + <span className="font-medium text-blue-400">개인</span></li>
            <li>&ldquo;<strong>독서</strong>&rdquo; 포함 → <span className="font-medium text-purple-500">지식</span></li>
          </ul>
          <p className="text-[10px] text-gray-400 mt-2">최대 50개의 규칙을 등록할 수 있습니다.</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">교정 이력</h3>
        <p className="text-xs text-gray-500">
          AI 분류 결과를 직접 수정하면 그 패턴이 자동으로 기록됩니다. 비슷한 내용이 다시 입력되면 수정한 대로 분류됩니다. 설정 &gt; AI 자동 분류 &gt; 나의 교정 이력에서 확인하고 관리할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
