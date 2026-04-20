<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# guide

## Purpose
BrainDump 사용 가이드 페이지. iOS 앱과 웹 버전의 기능을 단계별로 설명하는 인터랙티브 튜토리얼.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 가이드 메인 페이지. 플랫폼 탭(iOS/웹), 8개 섹션, 애니메이션 mockup |
| `layout.tsx` | 가이드 전용 레이아웃 (있을 경우) |

## For AI Agents

### Working In This Directory
- **'use client'**: 클라이언트 사이드 애니메이션과 상호작용 필요
- **플랫폼 탭**: useState로 'ios' | 'web' 전환
- **AnimatedSection**: 각 섹션마다 step 애니메이션 (useStepAnimation hook)
- **Mockup 컴포넌트**: QuickCaptureMockup, ClassifyMockup 등 동적 렌더링

### Testing Requirements
- http://localhost:3000/guide 접근 확인
- iOS 탭과 웹 탭 전환 시 mockup과 caption 변경 확인
- 스크롤 시 각 섹션 단계별 애니메이션 작동 확인
- 해시 앵커(#capture, #classify 등) 스크롤 이동 확인

### Common Patterns
- 각 섹션은 number, color, title, description으로 구성
- captions, durations 배열로 단계별 텍스트와 타이밍 관리
- 모바일에서는 mockup 아래에 step indicator, 데스크탑에서는 옆에 step caption
- DetailAccordion으로 추가 설명 토글 가능

## Dependencies

### Internal
- `@/components/guide/GuideTabs` - iOS/웹 탭 전환
- `@/components/guide/GuideSection` - 섹션 레이아웃 (split layout)
- `@/components/guide/StepCaption` - 단계별 텍스트 (데스크탑)
- `@/components/guide/MobileStepIndicator` - 모바일 step 지시자
- `@/components/guide/DetailAccordion` - 아코디언 열림/닫기
- `@/components/guide/mockups/*` - 각 기능별 mockup (QuickCapture, Classify 등)
- `@/components/landing/ScrollReveal` - 스크롤 노출 애니메이션

### External
- **framer-motion** - 애니메이션 (motion, spring, fadeUp 등)
- **date-fns** - 날짜 포맷팅

<!-- MANUAL: -->
