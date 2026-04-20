<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Step animation hook for guide sections -->

# hooks

## Purpose
단계별 애니메이션 로직. IntersectionObserver로 섹션 진입 감지, 타이머로 currentStep 진행, action/reaction 서브페이즈 분리.

## Key Files
| File | Description |
|------|-------------|
| `useStepAnimation.ts` | 옵션(durations, subStepSplit, loop, loopDelay, threshold) → ref, currentStep, subPhase, isPlaying, replay, totalSteps 반환. IntersectionObserver 기반 auto-play |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- 커스텀 React 훅 (클라이언트 전용)
- **useCallback** — clearTimer, scheduleNext, replay 메모이제이션 (의존성: durations, subStepSplit, loop, loopDelay, threshold)
- **useEffect** — IntersectionObserver 설정, cleanup
- **useRef** — ref (element), timerRef (setTimeout), subTimerRef (setTimeout), isVisibleRef (boolean)
- **useState** — currentStep, subPhase, isPlaying

### Testing Requirements
- 컴포넌트를 뷰포트에 스크롤 → 진입 시 자동 재생 시작
- 뷰포트 떠남 → 타이머 클리어, currentStep=-1
- durations 변경 → 애니메이션 리셋
- loop=false → 마지막 단계에서 멈춤

### Common Patterns
- `isVisibleRef.current` — IntersectionObserver entry.isIntersecting 추적
- `scheduleNext(step)` — 재귀 호출로 단계 진행
- `subPhase: 'action' | 'reaction'` — 각 단계의 두 페이즈
- `clearTimer()` — 모든 타이머 정리

## Dependencies

### Internal
- (없음)

### External
- (React built-in only)

## Usage
- GuideSection mockup 컴포넌트에서 useStepAnimation 호출하여 animate 상태 제어
