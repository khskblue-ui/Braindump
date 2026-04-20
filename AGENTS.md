<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# braindump (web)

## Purpose
BrainDump의 웹/PWA 구현체. 사용자가 생각을 빠르게 쏟아내면 AI가 6개 카테고리(task/idea/memo/knowledge/schedule/inbox)로 자동 분류한다. iOS 앱과 Supabase 백엔드를 **공유**하며, 서버 사이드 변경은 iOS에도 즉시 영향을 준다.

## Runtime & Stack
- **Next.js 16.2.2** + **Turbopack** (React 19.2)
- **Supabase** (Auth + Postgres + Storage + Edge Functions)
- **Zustand 5** 상태 관리
- **shadcn/ui + Tailwind v4** UI
- **Anthropic SDK** (AI 분류)
- **Vercel** 자동 배포 (push to `main`)

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Next.js 16, React 19, Supabase, Anthropic SDK 등 의존성 |
| `tsconfig.json` | TypeScript strict, path alias `@/*` → `src/*` |
| `CLAUDE.md` | 플랫폼 적용 규칙 + 기술 제약 (Supabase/PostgREST/Edge Function 배포) |
| `AGENTS.md` | 이 파일 — Next.js 16 경고 + 프로젝트 전체 맵 |
| `next.config.ts` | Turbopack/런타임 설정 |
| `eslint.config.mjs` | ESLint 9 설정 |
| `tailwind.config.ts` | Tailwind v4 토큰 |
| `components.json` | shadcn 설정 |
| `middleware.ts` | Supabase auth 세션 middleware |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | 앱 소스 코드 전체 (see `src/AGENTS.md`) |
| `supabase/` | Edge Functions + DB migrations (see `supabase/AGENTS.md`) |
| `public/` | 정적 asset (아이콘, manifest.json, icon.svg 등) |

## For AI Agents

### 🚨 반드시 지켜야 할 규칙 (반복 실수 방지)
아래는 이미 여러 번 발생한 실수로, 반드시 확인할 것:

1. **Next.js 16 API 변경**: 페이지/라우트 코드 작성 전 `node_modules/next/dist/docs/`의 최신 가이드를 먼저 확인. 훈련 데이터의 Next.js 13-15 컨벤션이 깨질 수 있음.
2. **Supabase Edge Function 배포**: `supabase functions deploy classify --no-verify-jwt` — 반드시 `--no-verify-jwt` 포함. 함수 내부에서 자체 인증 처리하므로 게이트웨이 JWT 검증이 중복되면 iOS SDK 토큰이 거부됨.
3. **PostgREST `.or()` 내부에서 `::` 타입 캐스트 사용 불가** (PGRST100).
4. **`text[]` 컬럼(`entries.tags`)에 `ilike` 직접 사용 불가** (42883) → JS 후처리 또는 DB 함수 사용.
5. **서비스 role_key 테스트는 PostgREST를 우회**하므로 반드시 anon_key + JWT로도 검증.
6. **API route HMR 반영 안 될 때**: `.next` 삭제 후 `npm run dev` 재시작.
7. **플랫폼 동시 적용 원칙**: 서버 사이드 로직(`/api/*`, `/lib/*`, `supabase/functions/*`) 변경은 iOS에도 영향. UI 수정은 iOS 쪽 대응 여부를 반드시 판단.

### Working In This Directory
- 빌드: `npm run build`
- 개발 서버: `npm run dev` (기본 3000, 3000 점유 시 3001)
- 린트: `npm run lint`
- Node 22+, npm 10+

### Testing Requirements
- 린트 통과는 기본
- `npx tsc --noEmit`으로 타입체크 검증 권장
- API route 변경 시 anon_key + 실제 세션으로 수동 검증

### Common Patterns
- 경로 alias: `@/` → `src/`
- 서버 전용 코드: `import 'server-only'`로 클라이언트 유출 방지
- Zustand 스토어는 `src/stores/`, persist + hydration 패턴
- Edge Function 환경 변수는 Supabase 대시보드에서 별도 관리

## Dependencies

### 외부 런타임
- **Next.js 16.2.2** - React 19 기반 풀스택 프레임워크 (Turbopack)
- **Supabase JS 2.101** - Auth/DB/Storage 클라이언트
- **@anthropic-ai/sdk** - AI 분류 API
- **Zustand 5** - 전역 상태
- **pdfjs-dist** - 브라우저 PDF 텍스트 추출
- **sharp** - 서버 이미지 변환
- **shadcn + Tailwind v4** - UI
- **framer-motion** - 애니메이션

### 내부 공유 (iOS와 공유)
- `supabase/functions/classify` Edge Function — iOS에서도 호출
- Supabase DB 스키마 — iOS의 `SDEntry`와 동일 구조

## 배포
- 프로덕션: https://braindump-jet.vercel.app
- GitHub: https://github.com/khskblue-ui/Braindump.git
- Vercel 자동 배포 (push to main)
- Edge Function 배포: `supabase functions deploy classify --no-verify-jwt`

<!-- MANUAL: 여기 아래에 수동 노트를 추가하면 재생성 시 보존됨 -->
