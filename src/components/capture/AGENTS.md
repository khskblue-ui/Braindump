<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Entry input UI — text, voice, image, PDF -->

# capture

## Purpose
엔트리 입력 영역. 텍스트 입력, 음성 인식(Web Speech API), 이미지 업로드, PDF 업로드 지원. 홈 대시보드 상단에 배치.

## Key Files
| File | Description |
|------|-------------|
| `QuickCapture.tsx` | Textarea, 음성 녹음, 이미지/PDF 업로드 UI. Ctrl+K 포커싱, 자동 분류 후 토스트 표시 |
| `ImageUpload.tsx` | 파일 선택 또는 카메라 캡처. 클립보드 paste 감지. 5MB 한도, JPEG/PNG/WebP만 지원 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어
- **Ctrl+K 단축키**: 텍스트 영역 포커싱
- **음성 인식**: `window.SpeechRecognition` 또는 `window.webkitSpeechRecognition`, 한국어(`ko-KR`), 3초 침묵 후 자동 중지
- **이미지 업로드**: `/api/upload` POST, multipart/form-data, 썸네일과 원본 URL 반환
- **PDF 업로드**: `/api/pdf` POST, 10MB 한도, 텍스트 추출 + AI 분류
- **자동 분류**: `createEntry()` 후 `classifyEntry()` 호출, 결과를 state에 반영

### Testing Requirements
- 텍스트 입력 후 전송 (엔트리 생성, 분류 완료 메시지)
- 음성 입력 (침묵 자동 중지, 최종 텍스트 병합)
- 이미지 업로드 (5MB 초과 시 에러)
- PDF 업로드 (10MB 초과 시 에러, 처리 중 스핀너 표시)

### Common Patterns
- `useEntryStore()` — createEntry, classifyEntry, fetchEntries
- `toast.success/error/warning` — 상태 알림
- `isSubmitting`, `isRecording`, `uploadingPdf` 상태로 버튼 disabled 처리
- 이미지 업로드 후 썸네일 미리보기 표시

## Dependencies

### Internal
- `@/stores/entry-store` — createEntry, classifyEntry, fetchEntries
- `@/components/ui/button`, `textarea` — shadcn 프리미티브

### External
- **lucide-react** — Send, ImagePlus, FileText, Mic, MicOff 아이콘
- **sonner** — toast 알림
- **Web Speech API** — 음성 인식 (브라우저 네이티브)

## Rendered Pages
- `src/app/(main)/home/page.tsx` — QuickCapture는 홈 상단 고정 영역
