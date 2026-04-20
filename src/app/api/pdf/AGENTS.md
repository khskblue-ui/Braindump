<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# pdf

## Purpose
PDF 파일 업로드, 텍스트 추출, 분류를 한 번에 처리한다. pdfjs-dist로 텍스트를 추출한 후 항목으로 등록하고, AI로 분류하여 knowledge 카테고리에 자동 포함시킨다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **POST**: PDF 업로드/추출/분류 |

## For AI Agents

### HTTP Methods

#### POST - PDF 업로드 및 분류
- **요청**: FormData with `file: File` (PDF)
- **검증**:
  - file 필수
  - MIME type: application/pdf
  - 크기: 최대 10MB
- **처리**:
  1. **PDF 텍스트 추출** (pdfjs-dist)
     - 최대 50페이지 추출
     - Y 위치 변화로 줄 구분
     - sanitizePdfText로 정규화 (한국어/CJK/라틴 문자만 유지)
     - 과도한 줄바꿈 압축
  2. **항목 생성** (inbox로 등록)
     - raw_text: `[PDF] {filename}`
     - extracted_text: 추출된 전체 텍스트 (최대 50KB 잘라내기)
     - input_type: 'pdf'
     - categories: ['inbox']
  3. **AI 분류** (백그라운드 스타일, 같은 요청 내)
     - 최대 100KB 자르기 (스마트 샘플링)
     - maxTokens: 1500 (긴 PDF용 상세 요약)
     - 사용자 커스텀 규칙 주입
     - knowledge 카테고리 강제 포함
     - topic: AI 제안 또는 파일명 사용
  4. **항목 업데이트**
     - categories, tags, summary, topic, context 적용
     - ai_metadata 저장

- **응답**:
  ```json
  {
    "entry": { 생성된 항목 },
    "pages": number,
    "textLength": number,
    "classifyError"?: "AI 분류 실패 (선택)" // 항목은 생성되고 분류만 실패한 경우
  }
  ```

- **에러**:
  - file 없음 (400)
  - PDF 아님 (400)
  - 10MB 초과 (400)
  - 텍스트 추출 불가 (400, 스캔 PDF)
  - 항목 생성 실패 (500)
  - AI 분류 실패 (200, classifyError 필드로 반환)

### PDF Processing Details

1. **텍스트 추출**:
   - pdfjs-dist의 `getDocument()` + `getTextContent()`
   - Y 좌표 변화로 줄 자동 감지
   - hasEOL 플래그 처리

2. **정규화** (sanitizePdfText):
   - 한국어(AC00-D7AF, 1100-11FF 등)
   - CJK(4E00-9FFF, 3000-303F)
   - 라틴(0020-007F, 00A0-00FF)
   - 공통 부호, 공백, 줄바꿈
   - 3줄 이상 연속 줄바꿈 → 2줄로 압축

3. **분류 강제**:
   - 분류 결과가 inbox/memo만 있으면 knowledge로 변경
   - 그 외 경우 knowledge 추가

### Working In This Directory
- **인증**: requireAuth() 필수
- **라이브러리**: pdfjs-dist (worker 경로 설정 필수)
- **Supabase 테이블**: entries
- **Anthropic**: classifyText() 호출 (maxTokens 증가)

### Common Patterns
- **에러 전략**: 항목 생성 후 분류 실패는 200 OK + classifyError 필드로 반환 (재시도 가능)
- **knowledge 강제**: 모든 PDF는 knowledge 카테고리 포함 (편집 가능)
- **topic 우선순위**: AI 제안 > 파일명 > null
- **텍스트 재사용**: extracted_text는 50KB로 DB 저장, textForAI는 100KB 활용 (AI용)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()
- `@/lib/classify` - classifyText(), smartTruncate()

### 외부
- Supabase JS
- pdfjs-dist - PDF 추출
- Anthropic SDK - AI 분류

<!-- MANUAL: -->
