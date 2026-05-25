# Rich Text Editor 도입 설계

**날짜:** 2026-05-25
**상태:** 승인됨

---

## Context

현재 `NoteEditor`는 plain `<textarea>`를 사용하여 노트 내용을 작성한다. 사용자가 볼드, 이탤릭, 제목, 목록, 인용구 등 서식 있는 글쓰기를 할 수 있도록 WYSIWYG 리치에디터로 교체한다.

---

## 결정 사항

| 항목 | 결정 |
|------|------|
| 에디터 방식 | WYSIWYG |
| 라이브러리 | `react-quill-new` (React 19 호환 포크) |
| 저장 포맷 | HTML string (`content: string` 타입 유지) |
| 툴바 기능 | bold, italic, underline, H1/H2/H3, bullet list, ordered list, blockquote, hr |
| 기존 노트 처리 | 로드 시 plain text → `<p>` 감싸기 (메모리 전용, DB 미저장) |

---

## 아키텍처

```
NoteEditor.tsx
  └── RichEditor.tsx  (src/components/shared/)
        └── ReactQuill (react-quill-new)
```

### 신규 파일

**`src/components/shared/RichEditor.tsx`**

```tsx
interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

- `react-quill-new`의 `ReactQuill` 컴포넌트 래퍼
- 툴바 모듈을 props 없이 내부에서 고정 설정
- `quill/dist/quill.snow.css` 임포트
- 앱 디자인 토큰(`--color-*`)으로 Quill 기본 스타일 오버라이드

### 수정 파일

**`src/components/NoteEditor.tsx`**
- `<textarea className="editor-textarea" ...>` → `<RichEditor value={content} onChange={setContent} />`
- 저장/태그/버튼 로직 변경 없음

**`src/context/NotesContext.tsx`**
- `fetchNotes` 이후 `migrateContent` 함수로 각 노트의 content 변환
- HTML 태그(`<`)로 시작하지 않으면 `<p>내용</p>`으로 감싸기

---

## 마이그레이션 함수

`src/utils/migrateContent.ts`로 순수 함수 분리:

```ts
export function migrateContent(content: string): string {
  if (content.startsWith('<')) return content;
  // 줄바꿈을 <p> 단락으로 변환
  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join('') || '<p></p>';
}
```

---

## 데이터 흐름

1. `fetchNotes()` → 서버 응답 → `migrateContent()` 적용 → `setNotes()`
2. 사용자가 에디터에서 작성 → `onChange` → `setContent(htmlString)`
3. 저장 버튼 → `addNote(title, htmlString, tags)` or `editNote(id, { content: htmlString })` → DB에 HTML string 저장

---

## 에러 처리

기존 패턴 유지:
- 저장 실패: `try-catch-finally` → `react-hot-toast` 에러 알림
- 초기 fetch 실패: Promise `.catch()` → `setError(e.message)`

---

## 테스트

**`src/components/shared/RichEditor.test.tsx`**
- 렌더링 확인
- `onChange` 콜백 호출 확인
- `placeholder` 표시 확인

**`src/utils/migrateContent.test.ts`**
- plain text → `<p>` 변환 확인
- 이미 HTML인 경우 변환 없음 확인
- 빈 문자열 처리 확인
- 줄바꿈 포함 텍스트 처리 확인

---

## 검증 방법

1. `pnpm install react-quill-new` 후 `pnpm run dev`로 개발 서버 실행
2. 새 노트 작성 시 툴바가 표시되고 서식이 적용되는지 확인
3. 기존 plain text 노트 열었을 때 정상 표시 확인
4. 저장 후 새로고침해도 서식이 유지되는지 확인 (HTML이 DB에 저장됨)
5. `pnpm test`로 신규 테스트 통과 확인
