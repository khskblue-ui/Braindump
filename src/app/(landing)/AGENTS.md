<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# (landing)

## Purpose
로그인 불필요한 공개 페이지 그룹. 랜딩 페이지(홍보, 기능 소개)와 가이드 페이지(사용법)를 제공한다. 모든 사용자가 접근 가능.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | 랜딩 레이아웃. 공통 헤더(로고, 네비게이션) 포함 |
| `page.tsx` | 랜딩 홈페이지. 문제 정의 → 솔루션 → 기능 소개 → 자주 묻는 질문 → CTA |
| `guide/page.tsx` | 사용 가이드. iOS/웹 탭, 8개 섹션(입력, 분류, 필터, 대시보드, 지식, 위젯, 알림, AI학습) |
| `guide/layout.tsx` | 가이드 전용 레이아웃 (있을 경우) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `guide/` | 사용 가이드 페이지 및 관련 컴포넌트 |

## For AI Agents

### Working In This Directory
- **비인증 경로**: 회원 가입/로그인 없이 접근 가능
- **layout.tsx**: 헤더에 로고, 가이드 링크, 시작하기 버튼(로그인) 표시
- `guide/page.tsx`는 'use client' (애니메이션, 탭 전환 등)

### Testing Requirements
- 로그인 없이 http://localhost:3000 과 http://localhost:3000/guide 접근 가능
- 반응형 디자인 (모바일/태블릿/데스크탑) 확인
- iOS/웹 탭 전환 작동 확인

### Common Patterns
- 랜딩 페이지는 마케팅 중심 (기능 설명, 이미지, CTA)
- 가이드는 사용자 교육 중심 (단계별, 시각적 mockup)
- 모든 CTA는 `/login` 또는 `/guide#section` 등으로 라우팅

## Dependencies

### Internal
- `@/components/landing/*` - 랜딩 컴포넌트 (HeroDemo, FeatureHighlight, PlatformCTA 등)
- `@/components/guide/*` - 가이드 컴포넌트 (GuideTabs, AnimatedSection 등)
- `@/components/ui/Logo` - 브랜드 로고

### External
- **framer-motion** - 애니메이션
- **date-fns** - 날짜 포맷팅 (가이드에서 "업데이트 시간")

<!-- MANUAL: -->
