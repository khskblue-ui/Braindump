'use client';

import { MockupFrame } from '../MockupFrame';

type Platform = 'ios' | 'web';

function IOSContent() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Large title */}
      <div className="px-4 pt-6 pb-3">
        <h2 className="text-[16px] font-bold text-gray-900">지식 모음</h2>
      </div>

      {/* Topic list */}
      <div className="flex-1 px-4">
        {[
          { title: 'Python 데이터 분석 기초 정리', time: '1시간 전', count: 1 },
          { title: '웹 개발 핵심 개념 모음', time: '1주 전', count: 1 },
          { title: 'React / Next.js 핵심 패턴', time: '2주 전', count: 5 },
          { title: '건강한 식습관 레시피 모음', time: '3주 전', count: 3 },
        ].map((topic, i) => (
          <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6M8 11h4" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-gray-900 leading-snug line-clamp-2">{topic.title}</p>
              <p className="text-[8px] text-gray-400 mt-0.5">{topic.time}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[8px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{topic.count}개</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom tab bar */}
      <div className="flex items-center justify-around h-10 border-t border-gray-200/60 bg-white mt-auto">
        {[
          { label: '홈', active: false, d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
          { label: '지식', active: true, d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' },
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
      <h2 className="text-base font-bold text-gray-900 mb-4">지식 모음</h2>
      <div className="space-y-2">
        {[
          { title: 'Python 데이터 분석 기초 정리', time: '1시간 전', count: 1, iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2' },
          { title: '웹 개발 핵심 개념 모음', time: '1주 전', count: 1, iconPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
          { title: 'React / Next.js 핵심 패턴', time: '2주 전', count: 5, iconPath: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
          { title: '건강한 식습관 레시피 모음', time: '3주 전', count: 3, iconPath: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M8 7h6M8 11h4' },
        ].map((topic, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-gray-200/60 shadow-sm hover:bg-gray-50 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={topic.iconPath} />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-gray-900 truncate">{topic.title}</p>
              <p className="text-[8px] text-gray-400 mt-0.5">{topic.time}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[8px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{topic.count}개</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KnowledgeMockup({ platform }: { platform: Platform }) {
  return (
    <MockupFrame platform={platform}>
      {platform === 'ios' ? <IOSContent /> : <WebContent />}
    </MockupFrame>
  );
}

export function KnowledgeDetails() {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">자동 토픽 분류</h3>
        <p className="text-xs text-gray-500">AI가 &ldquo;지식&rdquo;으로 분류한 항목은 자동으로 토픽별로 그룹핑됩니다. 같은 주제의 지식이 쌓이면 하나의 토픽 아래에 정리됩니다.</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">활용 예시</h3>
        <ul className="text-xs text-gray-500 space-y-1.5 ml-3 list-disc">
          <li>학습 노트, 기술 문서 → 주제별로 자동 묶임</li>
          <li>요리 레시피, 독서 메모 → 카테고리 없이도 토픽으로 정리</li>
          <li>PDF나 긴 텍스트도 AI가 분석해서 적절한 토픽에 배정</li>
        </ul>
      </div>
    </div>
  );
}
