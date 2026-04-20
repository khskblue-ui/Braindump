<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# share

## Purpose
웹 공유 엔드포인트. iOS Share Extension에서 전송한 데이터(title, text, url)를 받아 entry로 생성한 후 자동 분류하고 /home으로 리다이렉트한다.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 공유 핸들러 페이지. Suspense 감싸서 ShareHandler 컴포넌트 렌더링 |

## For AI Agents

### Working In This Directory
- **'use client'**: searchParams 접근, entry 생성/분류 (스토어)
- **Suspense**: 로딩 중 fallback 표시
- **querystring**: title, text, url 파라미터를 받아서 합침
- **리다이렉트**: 저장 후 /home으로 이동 (또는 오류 시 /home)

### Testing Requirements
- 직접 접근 시 querystring 필요 (예: /share?title=테스트&text=메모)
- 빈 데이터로 접근 시 /home으로 즉시 리다이렉트 확인
- 데이터 저장 및 분류 후 /home으로 리다이렉트 확인

### Common Patterns
- 파라미터 title, text, url을 줄바꿈으로 합쳐서 raw_text 생성
- classifyEntry는 fire-and-forget (async, await 하지 않음)
- hasRun.current로 useEffect 중복 실행 방지

## Dependencies

### Internal
- `@/stores/entry-store` - createEntry, classifyEntry

### External
- **Next.js useSearchParams, useRouter** - 쿼리 파라미터, 라우팅

<!-- MANUAL: -->
