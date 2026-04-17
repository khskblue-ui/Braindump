@AGENTS.md

## 플랫폼 적용 규칙
- 모든 기능 구현 및 버그 수정은 웹과 iOS 앱에 동시 적용을 기본으로 한다
- 서버 사이드 변경(/api/*, lib/*)은 배포만으로 양쪽에 자동 적용됨을 인지할 것
- 위젯, 다이나믹 아일랜드 등 iOS 네이티브 전용 기능은 별도 판단하여 진행

## 기술적 제약 (반복 실수 방지)

### Supabase / PostgREST
- `entries.tags` 컬럼은 `text[]` (배열) 타입
- PostgREST `.or()` 안에서 `::` 타입 캐스트 사용 불가 (PGRST100)
- `text[]` 컬럼에 `ilike` 연산자 직접 사용 불가 (42883)
- 배열 컬럼 검색 → JS 포스트필터링 또는 DB 함수로 처리
- service_role_key 테스트는 PostgREST를 우회하므로, 반드시 anon_key + JWT로도 검증할 것

### Next.js (16.2.2 + Turbopack)
- API route 변경이 HMR로 반영 안 되는 경우 있음 → `.next` 삭제 후 재시작 필요

## 빌드 / 개발
- `npm run dev` — 개발 서버 시작
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 검사
- Node 22+, npm 10+

## 배포
- 프로덕션: https://braindump-jet.vercel.app
- GitHub: https://github.com/khskblue-ui/Braindump.git
- Vercel 자동 배포 (push to main)
