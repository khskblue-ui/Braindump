'use client';

import { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: '무료인가요?',
    a: '네, 현재 모든 기능을 무료로 사용할 수 있습니다. 향후 프리미엄 플랜이 추가되더라도 기본 기능은 계속 무료입니다.',
  },
  {
    q: '내 데이터는 안전한가요?',
    a: 'Supabase 클라우드에 안전하게 저장되며, AI 분류에 사용되는 데이터는 모델 학습에 활용되지 않습니다. 계정을 삭제하면 모든 데이터가 즉시 삭제됩니다.',
  },
  {
    q: '어떤 기기에서 사용할 수 있나요?',
    a: 'iOS 앱(TestFlight 베타)과 데스크탑 웹 브라우저에서 사용할 수 있습니다. Android 앱은 현재 개발 중입니다.',
  },
  {
    q: 'AI 분류는 어떻게 작동하나요?',
    a: '입력하는 순간 AI가 문맥을 분석하여 할 일, 일정, 메모, 아이디어, 지식 등으로 자동 분류합니다. 하나의 기록이 여러 카테고리에 동시에 속할 수도 있습니다.',
  },
];

export function FAQ() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-14">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2"># FAQ</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                자주 묻는 질문
              </h2>
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-0">
          {FAQ_ITEMS.map((item, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <FAQItem question={item.q} answer={item.a} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left"
      >
        <h3 className="text-base sm:text-lg font-bold pr-4">{question}</h3>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-gray-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
