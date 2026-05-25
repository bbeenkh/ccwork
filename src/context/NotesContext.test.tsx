import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { NotesProvider, useNotes } from './NotesContext';
import * as api from '../api/notes';
import type { Note } from '../types/note';

vi.mock('../api/notes');

const mockApi = api as {
  fetchNotes: ReturnType<typeof vi.fn>;
  createNote: ReturnType<typeof vi.fn>;
  updateNote: ReturnType<typeof vi.fn>;
  deleteNote: ReturnType<typeof vi.fn>;
};

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: '1',
  title: '테스트 노트',
  content: '내용',
  tags: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

/** Helper: renders a consumer component that exposes context via data-testid */
function TestConsumer() {
  const { notes, loading, error } = useNotes();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? 'null'}</span>
      <ul>
        {notes.map((n) => (
          <li key={n.id} data-testid={`note-${n.id}`} data-content={n.content}>
            {n.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('NotesProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('초기 상태', () => {
    it('fetchNotes 완료 후 loading이 false가 된다', async () => {
      mockApi.fetchNotes.mockResolvedValue([]);
      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('fetchNotes 실패 시 error 상태가 설정된다', async () => {
      mockApi.fetchNotes.mockRejectedValue(new Error('Failed to fetch notes'));
      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch notes');
      });
    });

    it('fetchNotes 실패해도 loading이 false가 된다', async () => {
      mockApi.fetchNotes.mockRejectedValue(new Error('네트워크 오류'));
      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('migrateContent 적용', () => {
    it('plain text content를 <p> 태그로 마이그레이션한다', async () => {
      const note = makeNote({ id: '1', content: '안녕하세요' });
      mockApi.fetchNotes.mockResolvedValue([note]);
      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('note-1')).toHaveAttribute('data-content', '<p>안녕하세요</p>');
      });
    });

    it('이미 HTML인 content는 변환하지 않는다', async () => {
      const html = '<p>기존 HTML</p>';
      const note = makeNote({ id: '2', content: html });
      mockApi.fetchNotes.mockResolvedValue([note]);
      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('note-2')).toHaveAttribute('data-content', html);
      });
    });

    it('빈 content는 <p></p>로 마이그레이션한다', async () => {
      const note = makeNote({ id: '3', content: '' });
      mockApi.fetchNotes.mockResolvedValue([note]);
      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('note-3')).toHaveAttribute('data-content', '<p></p>');
      });
    });

    it('여러 노트 각각에 migrateContent가 적용된다', async () => {
      const notes = [
        makeNote({ id: 'a', content: 'plain text' }),
        makeNote({ id: 'b', content: '<p>html</p>' }),
      ];
      mockApi.fetchNotes.mockResolvedValue(notes);
      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('note-a')).toHaveAttribute('data-content', '<p>plain text</p>');
        expect(screen.getByTestId('note-b')).toHaveAttribute('data-content', '<p>html</p>');
      });
    });
  });

  describe('addNote', () => {
    it('addNote 호출 시 새 노트가 목록에 추가된다', async () => {
      mockApi.fetchNotes.mockResolvedValue([]);
      const newNote = makeNote({ id: 'new-1', title: '새 노트', content: '<p>내용</p>' });
      mockApi.createNote.mockResolvedValue(newNote);

      function AddConsumer() {
        const { notes, addNote } = useNotes();
        return (
          <div>
            <button onClick={() => addNote('새 노트', '<p>내용</p>', [])}>추가</button>
            {notes.map((n) => (
              <span key={n.id} data-testid={`note-${n.id}`}>
                {n.title}
              </span>
            ))}
          </div>
        );
      }

      render(
        <NotesProvider>
          <AddConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByTestId('note-new-1')).not.toBeInTheDocument();
      });

      await act(async () => {
        screen.getByRole('button', { name: '추가' }).click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('note-new-1')).toHaveTextContent('새 노트');
      });
    });
  });

  describe('editNote', () => {
    it('editNote 호출 시 해당 노트가 업데이트된다', async () => {
      const original = makeNote({ id: 'e1', title: '원본 제목', content: '<p>원본</p>' });
      mockApi.fetchNotes.mockResolvedValue([original]);
      const updated = { ...original, title: '수정된 제목' };
      mockApi.updateNote.mockResolvedValue(updated);

      function EditConsumer() {
        const { notes, editNote } = useNotes();
        return (
          <div>
            <button onClick={() => editNote('e1', { title: '수정된 제목' })}>수정</button>
            {notes.map((n) => (
              <span key={n.id} data-testid={`note-${n.id}`}>
                {n.title}
              </span>
            ))}
          </div>
        );
      }

      render(
        <NotesProvider>
          <EditConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('note-e1')).toHaveTextContent('원본 제목');
      });

      await act(async () => {
        screen.getByRole('button', { name: '수정' }).click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('note-e1')).toHaveTextContent('수정된 제목');
      });
    });
  });

  describe('removeNote', () => {
    it('removeNote 호출 시 해당 노트가 목록에서 제거된다', async () => {
      const note = makeNote({ id: 'r1', title: '삭제할 노트' });
      mockApi.fetchNotes.mockResolvedValue([note]);
      mockApi.deleteNote.mockResolvedValue(undefined);

      function RemoveConsumer() {
        const { notes, removeNote } = useNotes();
        return (
          <div>
            <button onClick={() => removeNote('r1')}>삭제</button>
            {notes.map((n) => (
              <span key={n.id} data-testid={`note-${n.id}`}>
                {n.title}
              </span>
            ))}
          </div>
        );
      }

      render(
        <NotesProvider>
          <RemoveConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('note-r1')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByRole('button', { name: '삭제' }).click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('note-r1')).not.toBeInTheDocument();
      });
    });
  });

  describe('useNotes', () => {
    it('NotesProvider 외부에서 useNotes 호출 시 에러를 던진다', () => {
      const originalError = console.error;
      console.error = vi.fn();

      function BadConsumer() {
        useNotes();
        return null;
      }

      expect(() => render(<BadConsumer />)).toThrow('useNotes must be used within NotesProvider');

      console.error = originalError;
    });
  });
});
