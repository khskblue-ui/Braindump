<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# knowledge

## Purpose
AI가 "지식"으로 분류한 항목들을 토픽별로 자동 그룹핑하여 보여주는 페이지 그룹. 토픽 목록 조회 및 개별 토픽 상세 페이지 포함.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 토픽 목록 페이지. 토픽 카드(이름, 개수, 최신 업데이트) 표시 |
| `[topic]/page.tsx` | 토픽 상세 페이지. 해당 토픽의 모든 entry 목록, 토픽 이름 편집 가능 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `[topic]/` | 동적 토픽 상세 페이지 (URL: /knowledge/[topic]) |

## For AI Agents

### Working In This Directory
- **'use client'**: 모든 페이지 클라이언트 컴포넌트
- **`[topic]` 동적 세그먼트**: useParams()로 topic 파라미터 접근 (decodeURIComponent 필요)
- **캐싱 패턴**: 모듈 레벨 캐시(cachedTopics)로 탭 전환 시 불필요한 fetch 방지
- **자동 merge**: 24시간마다 유사 토픽 자동 병합 (POST /api/topics/merge-similar)

### Testing Requirements
- http://localhost:3000/knowledge 접근 확인 (토픽 목록)
- 토픽 카드 클릭 시 /knowledge/[topic]으로 라우팅 확인
- 토픽 상세 페이지에서 entry 목록 표시 확인
- 토픽 이름 편집(연필 아이콘) 작동 확인
- 뒤로 가기 버튼으로 목록으로 복귀 확인

### Common Patterns
- `cachedTopics` 모듈 레벨 변수로 session 캐시 (성능)
- `decodeURIComponent(params.topic)` - URL 안전 토픽명
- 토픽 이름 변경 시 URL 변경(router.replace) → 북마크 깨짐 방지
- Entry 클릭 시 EntryEditModal 동적 로드 (스토어와 동기화)

## Dependencies

### Internal
- `@/types` - TopicInfo, Entry 타입
- `@/components/cards/EntryCard` - entry 카드
- `@/components/entry/EntryEditModal` - entry 편집 모달

### External
- **date-fns** - formatDistanceToNow() (최신 업데이트 시간 표시)
- **lucide-react** - 아이콘 (BookOpen 등)

<!-- MANUAL: -->
