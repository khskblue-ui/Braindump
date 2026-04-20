<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: First visit onboarding modal -->

# onboarding

## Purpose
첫 방문 사용자 온보딩 모달. 5단계 스토리: 개념, 빠른 입력, AI 분류, 대시보드, 결론. 스킵 가능, localStorage에 완료 상태 저장.

## Key Files
| File | Description |
|------|-------------|
| `OnboardingModal.tsx` | 5단계 온보딩. 아이콘, 제목, 부제목, 추가 설명(각 단계마다). 다음/이전/완료 버튼. 스킵 옵션 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어
- **LS_KEY**: 완료 상태 localStorage 저장 키
- **STEPS**: 단계 배열 (icon, title, subtitle, extra)
- **currentStep** state: -1(닫힘) ~ 4(5단계)
- **다음/이전 버튼**: currentStep 증감
- **스킵 버튼**: localStorage에 완료 표시하고 닫기

### Testing Requirements
- 모달이 첫 방문에만 표시 (localStorage 확인)
- 다음/이전 버튼 동작
- 스킵 버튼 (완료 처리)
- 마지막 단계에서 "시작하기" 버튼

### Common Patterns
- STEPS 배열로 단계 관리
- localStorage 기반 완료 상태 추적
- 아이콘: lucide-react (Brain, PenSquare, Sparkles, CheckCircle2 등)

## Dependencies

### Internal
- (없음)

### External
- **lucide-react** — Brain, PenSquare, Sparkles, CheckCircle2, Type, Mic, Camera, FileText 아이콘

## Rendered Pages
- `src/app/(main)/home/page.tsx` — 첫 방문 시 OnboardingModal 표시
