import { CheckSquare, Lightbulb, StickyNote, BookOpen, CalendarDays, Inbox } from 'lucide-react';

export const CATEGORY_INFO = [
  { icon: CheckSquare, label: '할 일', value: 'task', color: '#3B82F6', type: '소멸형', desc: '완료 시점이 있고, 끝나면 체크할 수 있는 행동', examples: '보고서 제출, 우유 사기, 엄마한테 전화' },
  { icon: Lightbulb, label: '아이디어', value: 'idea', color: '#EAB308', type: '성장형', desc: '실행 여부 미정, 발전시킬 여지가 있는 생각', examples: '앱에 다크모드 넣으면 좋겠다, 부업 알아보기' },
  { icon: StickyNote, label: '메모', value: 'memo', color: '#22C55E', type: '보존형', desc: '참고용 정보, 사실 기록, 노트', examples: '회의록, 전화번호 메모, 가격 비교' },
  { icon: BookOpen, label: '지식', value: 'knowledge', color: '#A855F7', type: '축적형', desc: '학습한 정보, 지식 스니펫', examples: 'React 훅 사용법, 요리 레시피, 논문 요약' },
  { icon: CalendarDays, label: '일정', value: 'schedule', color: '#F97316', type: '시한형', desc: '특정 날짜/시간이 있는 항목', examples: '내일 3시 미팅, 금요일 치과 예약' },
  { icon: Inbox, label: '미분류', value: 'inbox', color: '#9CA3AF', type: '임시', desc: 'AI가 판단하기 어려운 항목', examples: '짧은 단어, 맥락 없는 입력' },
];

export const FLOW_STEPS = [
  { step: '1단계', question: '시간 정보가 있는가?', result: '일정 (schedule)', color: '#F97316' },
  { step: '2단계', question: '"했다/안했다"로 완결 가능한가?', result: '할 일 (task)', color: '#3B82F6' },
  { step: '3단계', question: '아직 열려있는 생각인가?', result: '아이디어 (idea)', color: '#EAB308' },
  { step: '4단계', question: '참고용 기록인가?', result: '메모/지식 (memo/knowledge)', color: '#22C55E' },
  { step: '5단계', question: '위 어디에도 해당하지 않음', result: '미분류 (inbox)', color: '#9CA3AF' },
];

export const MULTI_CATEGORY_EXAMPLES = [
  { input: '내일 3시 미팅 자료 준비', categories: '일정 + 할 일' },
  { input: '회의에서 예산 확정, 다음주까지 보고서 제출', categories: '일정 + 할 일 + 메모' },
  { input: '보고서 제출하기', categories: '할 일 (단일)' },
];

export const LONG_DOC_RULES = [
  { condition: '학습/참고용 문서', result: '지식' },
  { condition: '회의록, 기록물', result: '메모' },
  { condition: '계약서, 일정표 등 기한 포함', result: '일정 + 지식' },
];
