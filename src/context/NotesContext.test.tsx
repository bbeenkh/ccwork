import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { NotesProvider, useNotes } from './NotesContext';
import type { Note } from '../types/note';

// api 모듈 mock
vi.mock('../api/notes', () => ({
  fetchNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

import * as api from '../api/notes';

const makeFetchedNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '테스트 노트',
  content: '일반 텍스트',
  tags: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

/** 컨텍스트 값을 화면에 노출하는 테스트용 컴포넌트 */
function NotesDisplay() {
  const { notes, loading, error } = useNotes();
  if (loading) return <div>로딩 중</div>;
  if (error) return <div>에러: {error}</div>;
  return (
    <ul>
      {notes.map((n) => (
        <li key={n.id} data-testid={`note-${n.id}`} data-content={n.content}>
          {n.title}
        </li>
      ))}
    </ul>
  );
}

function renderWithProvider() {
  return render(
    <NotesProvider>
      <NotesDisplay />
    </NotesProvider>,
  );
}

describe('NotesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchNotes 후 migrateContent 적용', () => {
    it('plain text content를 <p> 태그로 감싼다', async () => {
      vi.mocked(api.fetchNotes).mockResolvedValue([makeFetchedNote({ content: '안녕하세요' })]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-note-1')).toHaveAttribute('data-content', '<p>안녕하세요</p>');
      });
    });

    it('이미 HTML인 content는 변환하지 않는다', async () => {
      const htmlContent = '<p>기존 HTML 내용</p>';
      vi.mocked(api.fetchNotes).mockResolvedValue([makeFetchedNote({ content: htmlContent })]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-note-1')).toHaveAttribute('data-content', htmlContent);
      });
    });

    it('빈 content를 <p></p>로 변환한다', async () => {
      vi.mocked(api.fetchNotes).mockResolvedValue([makeFetchedNote({ content: '' })]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-note-1')).toHaveAttribute('data-content', '<p></p>');
      });
    });

    it('줄바꿈이 있는 plain text를 여러 <p> 태그로 변환한다', async () => {
      vi.mocked(api.fetchNotes).mockResolvedValue([
        makeFetchedNote({ content: '첫째 줄\n둘째 줄' }),
      ]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-note-1')).toHaveAttribute(
          'data-content',
          '<p>첫째 줄</p><p>둘째 줄</p>',
        );
      });
    });

    it('여러 노트 모두에 migrateContent를 적용한다', async () => {
      vi.mocked(api.fetchNotes).mockResolvedValue([
        makeFetchedNote({ id: 'note-1', content: '첫 번째 노트' }),
        makeFetchedNote({ id: 'note-2', content: '<p>두 번째 노트</p>' }),
      ]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-note-1')).toHaveAttribute('data-content', '<p>첫 번째 노트</p>');
        expect(screen.getByTestId('note-note-2')).toHaveAttribute('data-content', '<p>두 번째 노트</p>');
      });
    });
  });

  describe('loading 상태', () => {
    it('fetchNotes 완료 전에는 로딩 중 상태이다', async () => {
      vi.mocked(api.fetchNotes).mockReturnValue(new Promise(() => {}));
      renderWithProvider();
      expect(screen.getByText('로딩 중')).toBeInTheDocument();
    });

    it('fetchNotes 완료 후 로딩 상태가 해제된다', async () => {
      vi.mocked(api.fetchNotes).mockResolvedValue([]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.queryByText('로딩 중')).not.toBeInTheDocument();
      });
    });
  });

  describe('error 상태', () => {
    it('fetchNotes 실패 시 에러 메시지를 노출한다', async () => {
      vi.mocked(api.fetchNotes).mockRejectedValue(new Error('네트워크 오류'));
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByText('에러: 네트워크 오류')).toBeInTheDocument();
      });
    });
  });

  describe('addNote', () => {
    it('addNote 호출 시 api.createNote를 호출하고 노트 목록에 추가한다', async () => {
      const newNote = makeFetchedNote({ id: 'note-new', title: '새 노트', content: '<p>새 내용</p>' });
      vi.mocked(api.fetchNotes).mockResolvedValue([]);
      vi.mocked(api.createNote).mockResolvedValue(newNote);

      function AddNoteButton() {
        const { addNote } = useNotes();
        return <button onClick={() => addNote('새 노트', '<p>새 내용</p>', [])}>추가</button>;
      }

      render(
        <NotesProvider>
          <NotesDisplay />
          <AddNoteButton />
        </NotesProvider>,
      );

      await waitFor(() => expect(screen.queryByText('로딩 중')).not.toBeInTheDocument());
      await act(async () => {
        screen.getByRole('button', { name: '추가' }).click();
      });
      await waitFor(() => {
        expect(screen.getByText('새 노트')).toBeInTheDocument();
      });
    });
  });

  describe('removeNote', () => {
    it('removeNote 호출 시 api.deleteNote를 호출하고 노트 목록에서 제거한다', async () => {
      vi.mocked(api.fetchNotes).mockResolvedValue([makeFetchedNote({ id: 'note-1', title: '삭제할 노트', content: '' })]);
      vi.mocked(api.deleteNote).mockResolvedValue(undefined);

      function DeleteButton() {
        const { removeNote } = useNotes();
        return <button onClick={() => removeNote('note-1')}>삭제</button>;
      }

      render(
        <NotesProvider>
          <NotesDisplay />
          <DeleteButton />
        </NotesProvider>,
      );

      await waitFor(() => expect(screen.getByText('삭제할 노트')).toBeInTheDocument());

      await act(async () => {
        screen.getByRole('button', { name: '삭제' }).click();
      });

      await waitFor(() => {
        expect(screen.queryByText('삭제할 노트')).not.toBeInTheDocument();
      });
    });
  });

  describe('useNotes 훅', () => {
    it('NotesProvider 외부에서 useNotes를 호출하면 에러를 던진다', () => {
      // console.error 억제
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      function BareConsumer() {
        useNotes();
        return null;
      }
      expect(() => render(<BareConsumer />)).toThrow('useNotes must be used within NotesProvider');
      consoleError.mockRestore();
    });
  });
});
