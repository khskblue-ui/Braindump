<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# trash/purge

## Purpose
휴지통의 모든 항목을 한 번에 영구삭제한다. 사용자가 휴지통을 완전히 비우고 싶을 때 호출된다. 모든 이미지 파일도 함께 정리한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **DELETE**: 휴지통 전체 비우기 |

## For AI Agents

### HTTP Methods

#### DELETE - 휴지통 비우기
- **요청**: 파라미터 없음
- **처리**:
  1. deleted_at is not null 항목 모두 조회 (image_url만)
  2. image_url에서 경로 추출 및 필터링
  3. Storage 'entry-images' 버킷에서 대량 remove (실패해도 계속)
  4. DB에서 모든 휴지통 항목 삭제
- **응답**: `{ success: true }`
- **에러**: 삭제 실패 (500)

### Storage Cleanup Logic
```javascript
const paths = trashed
  .filter((e) => e.image_url)
  .map((e) => {
    try {
      return new URL(e.image_url!).pathname.split('/entry-images/')[1];
    } catch {
      return null;
    }
  })
  .filter((p): p is string => !!p);

if (paths.length > 0) {
  await supabase.storage.from('entry-images').remove(paths);
}
```

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**: entries
- **Storage**: entry-images 버킷 (대량 remove)
- **대량 작업**: 모든 휴지통 항목 일괄 삭제

### Common Patterns
- **비가역적**: 휴지통 비우기는 복구 불가 (확인 대화 권장)
- **오류 내성**: Storage 삭제 오류 발생해도 DB 삭제 진행
- **성능**: URL 파싱 오류 시 해당 파일만 스킵 (전체 실패 X)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
