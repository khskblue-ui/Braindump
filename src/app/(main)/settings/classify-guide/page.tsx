'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare, Lightbulb, StickyNote, BookOpen, CalendarDays, Inbox, User, Building2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_INFO = [
  { icon: CheckSquare, label: '할 일', value: 'task', color: '#3B82F6', type: '소멸형', desc: '완료 시점이 있고, 끝나면 체크할 수 있는 행동', examples: '보고서 제출, 우유 사기, 엄마한테 전화' },
  { icon: Lightbulb, label: '아이디어', value: 'idea', color: '#EAB308', type: '성장형', desc: '실행 여부 미정, 발전시킬 여지가 있는 생각', examples: '앱에 다크모드 넣으면 좋겠다, 부업 알아보기' },
  { icon: StickyNote, label: '메모', value: 'memo', color: '#22C55E', type: '보존형', desc: '참고용 정보, 사실 기록, 노트', examples: '회의록, 전화번호 메모, 가격 비교' },
  { icon: BookOpen, label: '지식', value: 'knowledge', color: '#A855F7', type: '축적형', desc: '학습한 정보, 지식 스니펫', examples: 'React 훅 사용법, 요리 레시피, 논문 요약' },
  { icon: CalendarDays, label: '일정', value: 'schedule', color: '#F97316', type: '시한형', desc: '특정 날짜/시간이 있는 항목', examples: '내일 3시 미팅, 금요일 치과 예약' },
  { icon: Inbox, label: '미분류', value: 'inbox', color: '#9CA3AF', type: '임시', desc: 'AI가 판단하기 어려운 항목', examples: '짧은 단어, 맥락 없는 입력' },
];

const FLOW_STEPS = [
  { step: '1단계', question: '시간 정보가 있는가?', result: '일정 (schedule)', color: '#F97316' },
  { step: '2단계', question: '"했다/안했다"로 완결 가능한가?', result: '할 일 (task)', color: '#3B82F6' },
  { step: '3단계', question: '아직 열려있는 생각인가?', result: '아이디어 (idea)', color: '#EAB308' },
  { step: '4단계', question: '참고용 기록인가?', result: '메모/지식 (memo/knowledge)', color: '#22C55E' },
  { step: '5단계', question: '위 어디에도 해당하지 않음', result: '미분류 (inbox)', color: '#9CA3AF' },
];

export default function ClassifyGuidePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">AI 자동 분류 안내</h1>
      </div>

      {/* Category definitions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">카테고리 정의</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CATEGORY_INFO.map((cat) => (
            <div key={cat.value} className="flex gap-3 items-start">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: cat.color + '1A' }}
              >
                <cat.icon className="h-4 w-4" style={{ color: cat.color }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{cat.label}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: cat.color + '1A', color: cat.color }}
                  >
                    {cat.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">예: {cat.examples}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Classification flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">분류 판단 흐름</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            AI는 아래 순서대로 입력을 분석합니다. 먼저 해당하는 단계에서 분류됩니다.
          </p>
          <div className="space-y-2">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium">{step.question}</span>
                </div>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: step.color + '1A', color: step.color }}
                >
                  → {step.result}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Multi-category rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">복수 카테고리 규칙</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            하나의 입력이 여러 성격을 가질 수 있습니다. 해당하는 카테고리가 모두 포함됩니다.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5 ml-1">
            <li>&ldquo;내일 3시 미팅 자료 준비&rdquo; → <span className="font-medium text-foreground">일정 + 할 일</span></li>
            <li>&ldquo;회의에서 예산 확정, 다음주까지 보고서 제출&rdquo; → <span className="font-medium text-foreground">일정 + 할 일 + 메모</span></li>
            <li>&ldquo;보고서 제출하기&rdquo; → <span className="font-medium text-foreground">할 일</span> (단일)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            첫 번째가 가장 지배적인 카테고리이며, 최대 3개까지 부여됩니다.
          </p>
        </CardContent>
      </Card>

      {/* Context (personal/work) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">개인 · 회사 맥락</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">할 일</span>과 <span className="font-medium text-foreground">일정</span>에만
            개인/회사 맥락이 자동으로 부여됩니다.
          </p>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: '#3B82F61A' }}>
                <User className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-xs font-medium">개인</span>
                <p className="text-[10px] text-muted-foreground">장보기, 운동, 병원</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: '#7C3AED1A' }}>
                <Building2 className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-xs font-medium">회사</span>
                <p className="text-[10px] text-muted-foreground">회의, 보고서, 출장</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            아이디어, 메모, 지식, 미분류에는 맥락이 부여되지 않습니다.
          </p>
        </CardContent>
      </Card>

      {/* Long document rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">긴 문서 분류 규칙</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-xs text-muted-foreground">PDF나 긴 텍스트(1,000자 이상)는 아래 기준으로 분류됩니다:</p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-3 list-disc">
            <li>학습/참고용 문서 → <span className="font-medium text-foreground">지식</span></li>
            <li>회의록, 기록물 → <span className="font-medium text-foreground">메모</span></li>
            <li>계약서, 일정표 등 기한 포함 → <span className="font-medium text-foreground">일정 + 지식</span></li>
          </ul>
          <p className="text-xs text-muted-foreground mt-1">
            긴 문서는 미분류(inbox)로 분류되지 않으며, 반드시 지식 또는 메모 중 하나가 포함됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
