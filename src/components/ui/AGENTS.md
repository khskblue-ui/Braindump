<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: shadcn UI primitive components -->

# ui

## Purpose
shadcn/ui 프리미티브 컴포넌트. `npx shadcn-ui add <component>`로 자동 생성된 것들. Tailwind + Radix UI 기반.

## Key Files
| File | Description |
|------|-------------|
| `Logo.tsx` | BrainDump 로고 (SVG). className 커스터마이징 가능 |
| `avatar.tsx` | Radix Avatar (프로필 이미지) |
| `badge.tsx` | 배지 컴포넌트 (variant: default, secondary, destructive 등) |
| `button.tsx` | 버튼 컴포넌트 (variant: default, outline, ghost, destructive; size: default, sm, lg, icon) |
| `card.tsx` | 카드 wrapper (Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter) |
| `dialog.tsx` | 모달 (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle). fullscreen 변형 |
| `dropdown-menu.tsx` | 드롭다운 메뉴 (DropdownMenu, DropdownMenuTrigger, DropdownMenuContent 등) |
| `input.tsx` | 텍스트 입력 (type: text, email, password, search 등. placeholder, disabled 등) |
| `scroll-area.tsx` | 스크롤 영역 (Radix ScrollArea) |
| `separator.tsx` | 구분선 (orientation: horizontal, vertical) |
| `skeleton.tsx` | 로딩 스켈레톤 (className 커스터마이징) |
| `sonner.tsx` | 토스트 라이브러리 (toast 객체, Toaster 컴포넌트) |
| `tabs.tsx` | 탭 (Tabs, TabsList, TabsTrigger, TabsContent) |
| `textarea.tsx` | 여러 줄 텍스트 입력 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- 모두 `'use client'` 지시어
- shadcn 컴포넌트는 수동 편집하지 않음. 변경 필요 시 `npx shadcn-ui add <name> --overwrite`로 업데이트
- 커스텀 스타일링은 `className` prop 또는 `cn()` 유틸로 병합

### Testing Requirements
- 각 컴포넌트의 기본 렌더링 확인 (variant, size 등)
- 반응형 레이아웃 확인 (Tailwind breakpoint)

### Common Patterns
- `cn()` (clsx) — Tailwind 클래스 병합
- variant, size prop으로 스타일 전환
- disabled, loading 상태 처리

## Dependencies

### Internal
- (없음)

### External
- **@radix-ui/*` — Dialog, Dropdown, ScrollArea, Tabs 등
- **Tailwind CSS v4** — 스타일링
- **class-variance-authority** — variant 관리
- **clsx** — 클래스 병합 (cn)

## Usage
- 모든 페이지/컴포넌트에서 import 및 사용
- 예: `<Button variant="outline" size="sm">...</Button>`
