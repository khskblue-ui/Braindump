<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Landing /guide page — 8-section animation system -->

# guide

## Purpose
랜딩 페이지 `/guide`의 애니메이션 시스템. 8개 섹션의 단계별 애니메이션(classify, quick-capture, dashboard 등). iOS/웹 탭 전환. 상세 기술 설명 accordion.

## Key Files
| File | Description |
|------|-------------|
| `GuideSection.tsx` | 각 섹션의 wrapper. 번호, 제목, 설명, 자식 콘텐츠. ScrollReveal로 진입 시 애니메이션 |
| `GuideTabs.tsx` | iOS/웹 탭. sticky top, 활성 탭 highlight |
| `DetailAccordion.tsx` | 섹션별 상세 설명 accordion. grid height 기반 열림/닫힘 애니메이션 |
| `MockupFrame.tsx` | iOS 또는 웹 브라우저 프레임 (Dynamic Island, 상태바 등) |
| `StepCaption.tsx` | 단계 표시: 번호 + 텍스트, 진행도 강조. MobileStepIndicator 변형 |
| `TapIndicator.tsx` | 탭 위치 애니메이션 (pulse 효과, 색상 커스터마이징) |
| `motion-helpers.tsx` | framer-motion 재사용 가능 preset (spring, ease, fadeUp, scaleIn 등) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `data/` | classify-data.ts — 분류 예시 데이터 (6개 카테고리 설명, 다단계 결정 트리) |
| `hooks/` | useStepAnimation.ts — IntersectionObserver 기반 단계 애니메이션 관리 |
| `mockups/` | 8개 섹션 mockup 컴포넌트 (ClassifyMockup, QuickCaptureMockup, DashboardMockup 등) |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어
- **useStepAnimation**: IntersectionObserver로 섹션 진입 감지, 타이머로 단계 진행
  - `durations`: 각 단계 지속 시간 배열 (ms)
  - `subStepSplit`: action/reaction 전환 시점 (생략 시 duration의 40%)
  - `loop`: 마지막 단계 후 처음부터 다시 시작
  - `threshold`: 화면에 표시되는 비율 (0.3 = 30%)
- **motion-helpers**: 애니메이션 프리셋 (spring, ease, fadeUp, scaleIn 등) 조합
- **MockupFrame**: platform prop으로 iOS/web 분기
- **GuideTabs**: activeTab 상태로 mockup 렌더링 전환

### Testing Requirements
- 스크롤로 각 섹션 진입 시 애니메이션 시작 확인
- 탭 전환 시 애니메이션 리셋 (useStepAnimation 리셋 로직)
- accordion 열림/닫힘 (grid-template-rows 기반)
- TapIndicator 위치 정확도 (x%, y% props)
- mockup 이미지 렌더링 (iOS Dynamic Island, 웹 브라우저 프레임)

### Common Patterns
- `classifyData.ts`: CATEGORY_INFO (6개 카테고리 + 설명), FLOW_STEPS (결정 트리), MULTI_CATEGORY_EXAMPLES
- useStepAnimation 반환: ref, currentStep, subPhase, isPlaying, replay, totalSteps
- `currentStep >= X ? 'visible' : 'hidden'` — stepState() 패턴
- motion-helpers의 spring/ease로 일관된 애니메이션

## Dependencies

### Internal
- `@/components/landing/ScrollReveal` — 섹션 진입 애니메이션

### External
- **framer-motion** — motion components, AnimatePresence, Variants, Transition
- **lucide-react** — 섹션 아이콘 (일부)

## Rendered Pages
- `src/app/guide/page.tsx` — GuideSection × 8, GuideTabs, mockup 렌더링
