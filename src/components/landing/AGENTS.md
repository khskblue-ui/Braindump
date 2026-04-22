<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Public landing page components -->

# landing

## Purpose
공개 랜딩 페이지 (`src/app/page.tsx`) 컴포넌트. 데스크탑 사용자 대상. 히어로 섹션, 앱 프리뷰, 기능 설명, FAQ, 설치 가이드 모달.

## Key Files
| File | Description |
|------|-------------|
| `AppPreview.tsx` | 앱 mockup 미리보기 (홈 화면 + 지식 탭). 반응형 폰 프레임 |
| `FAQ.tsx` | FAQ 섹션. 4개 항목 (무료 여부, 데이터 안전, 지원 기기, AI 동작) |
| `FeatureHighlight.tsx` | 기능 설명 섹션. 음성 입력, AI 분류, 대시보드, 공유 저장 |
| `HeroDemo.tsx` | 히어로 섹션 — 제목, 부제목, CTA 버튼 |
| `InstallButton.tsx` | PWA 설치 버튼. `beforeinstallprompt` 이벤트 감지 |
| `InstallGuideModal.tsx` | iOS/Android PWA 설치 가이드 모달. 단계별 스크린샷 |
| `PlatformCTA.tsx` | iOS/웹/데스크탑 플랫폼별 CTA. App Store 링크 |
| `ScrollReveal.tsx` | 스크롤 진입 시 fade-up 애니메이션 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어 (일부 컴포넌트)
- **ScrollReveal**: whileInView로 스크롤 진입 감지
- **InstallButton**: `beforeinstallprompt` 이벤트 (`e.prompt()`)
- **InstallGuideModal**: iOS/Android 탭 전환
- **FeatureHighlight**: 각 기능별 애니메이션 (MicAnimation, AIAnimation 등)

### Testing Requirements
- 스크롤 시 각 섹션 fade-up 애니메이션
- InstallButton (PWA 설치 가능 환경에서만 표시)
- FAQ accordion 열림/닫힘
- 모바일 반응형 레이아웃 (max-w-4xl, px-6)

### Common Patterns
- ScrollReveal으로 진입 애니메이션 (delay 파라미터)
- 색상: Tailwind (text-gray-500, bg-gray-50 등)
- 반응형: `sm:`, `md:`, `lg:` breakpoint

## Dependencies

### Internal
- (없음)

### External
- **framer-motion** — ScrollReveal, motion components
- **lucide-react** — 기능 아이콘

## Rendered Pages
- `src/app/page.tsx` — 랜딩 페이지 (인증 필요 없음)
