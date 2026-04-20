<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Guide page mockup components for 8 sections -->

# mockups

## Purpose
`/guide` 페이지의 8개 섹션 mockup. ClassifyMockup(분류 알고리즘), QuickCaptureMockup(입력 UI), DashboardMockup(홈 화면), KnowledgeMockup(지식 탭), FilterSearchMockup(검색/필터), CustomAIMockup(맞춤 AI), WidgetMockup(위젯), WidgetKnowledgeMockup(위젯 지식).

## Key Files
| File | Description |
|------|-------------|
| `ClassifyMockup.tsx` | 분류 결정 트리 flow 애니메이션. FLOW_STEPS를 시각화 |
| `QuickCaptureMockup.tsx` | 입력창, 음성/이미지/PDF 버튼, 전송 애니메이션. 단계별 입력 시뮬레이션 |
| `DashboardMockup.tsx` | 홈 화면 mockup. TodayDashboard, 엔트리 카드 목록 |
| `FilterSearchMockup.tsx` | 검색바 + 카테고리 탭, 필터 결과 |
| `KnowledgeMockup.tsx` | 지식 탭 mockup. 지식 카테고리별 항목 |
| `CustomAIMockup.tsx` | 커스텀 AI 설정/설명 (선택적 기능) |
| `WidgetMockup.tsx` | 홈 화면 위젯 mockup (iOS/Android 위젯) |
| `WidgetKnowledgeMockup.tsx` | 위젯 지식 탭 mockup |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어
- **useStepAnimation** 호출로 currentStep, subPhase 받음
- **MockupFrame**로 iOS/웹 프레임 래핑
- **TapIndicator** — 탭 위치 강조 (x, y 좌표)
- **StepCaption** — 현재 단계 설명 텍스트
- 각 mockup은 animate={step >= N ? 'visible' : 'hidden'} 패턴 사용

### Testing Requirements
- 각 mockup이 scrollIntoView 시 애니메이션 시작 확인
- 단계별 요소(텍스트, 버튼, 아이콘) 진입/강조 확인
- TapIndicator가 올바른 위치에서 pulse 확인
- 탭 전환 시 mockup 리셋 (useStepAnimation은 durations 변경으로 리셋)

### Common Patterns
- `useStepAnimation({ durations: [...], ... })`로 각 mockup의 타이밍 제어
- `animate={currentStep >= 0 ? 'visible' : 'hidden'}`로 step 기반 렌더링
- MockupFrame 중첩으로 기기 프레임 렌더링
- 각 단계마다 TapIndicator로 탭 위치 강조

## Dependencies

### Internal
- `@/components/guide/motion-helpers` — motion, AnimatePresence, 애니메이션 프리셋
- `@/components/guide/MockupFrame` — iOS/웹 프레임
- `@/components/guide/hooks/useStepAnimation` — 애니메이션 로직
- `@/components/guide/StepCaption` — 단계 설명
- `@/components/guide/TapIndicator` — 탭 강조
- `@/components/guide/data/classify-data` — CATEGORY_INFO 등

### External
- **framer-motion** — motion components, transitions

## Rendered Pages
- `src/app/guide/page.tsx` — 각 mockup을 GuideSection으로 래핑하여 8번 렌더링
