<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# topics/merge-similar

## Purpose
AI를 활용하여 사용자의 지식 토픽 중 의미상 유사한 것들을 자동 감지하고 병합한다. 예: "React 훅", "React 상태관리" → "React"로 통합. 토픽 관리 효율성을 높인다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **POST**: 유사 토픽 자동 감지 및 병합 |

## For AI Agents

### HTTP Methods

#### POST - 유사 토픽 감지 및 병합
- **요청**: body 없음
- **처리**:
  1. **토픽 로드**
     - knowledge 카테고리 항목의 모든 topic 조회
     - 각 토픽당 항목 수 및 최대 2개 샘플 요약 수집
  
  2. **AI 유사성 분석** (Anthropic Claude Haiku)
     - 모든 토픽 목록 + 샘플을 프롬프트로 제공
     - 유사한 토픽 그룹 식별 (JSON 배열로 응답)
     - 각 그룹: sources (토픽 목록), merged_name, reason
  
  3. **병합 실행**
     - 각 그룹의 소스 토픽 → 병합 토픽으로 일괄 UPDATE
     - 검증: source 토픽 존재 확인, 최소 2개 이상만 병합
     - 이미 target과 같은 경우 스킵

- **응답**:
  ```json
  {
    "merged": [
      {
        "sources": ["토픽A", "토픽B"],
        "target": "merged_name",
        "updated": number,
        "reason": "병합 이유"
      }
    ],
    "message": "0개 토픽 그룹이 병합되었습니다."
  }
  ```

- **에러**: 토픽 부족 (200, merged=[]), 분석 실패 (500)

### AI Prompt
Claude Haiku에게 다음을 지시:
- 의미적으로 같은 주제를 다루는 토픽만 병합
- 예: "React 훅" + "React 상태 관리" → "React" (O)
- 예: "React 훅" + "요리 레시피" → 병합 안 함 (X)
- 각 그룹: { sources, merged_name, reason }
- 유사한 것 없으면 []

### Working In This Directory
- **인증**: requireAuth(req) 필수 (POST 요청이므로)
- **Anthropic**: claude-haiku-4-5-20251001 모델, max_tokens=500
- **Supabase 테이블**: entries
- **대량 업데이트**: 각 source 토픽에 속한 모든 항목 UPDATE

### Common Patterns
- **자동 감지**: 사용자 개입 없이 AI로 자동 분석
- **취소 불가**: 병합 후 수동으로 원상복구 필요 (Undo X)
- **안전 조건**: 최소 2개 이상 토픽만 병합 (1개는 무시)
- **프롬프트 중요**: 병합 기준을 명확히 지시 (오병합 방지)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS
- Anthropic SDK - AI 유사성 분석

<!-- MANUAL: -->
