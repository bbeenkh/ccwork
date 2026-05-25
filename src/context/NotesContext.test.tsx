import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { NotesProvider, useNotes } from './NotesContext';
import * as api from '../api/notes';
import type { Note } from '../types/note';

vi.mock('../api/notes');

const mockedApi = vi.mocked(api);

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '제목',
  content: '기본 내용',
  tags: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// 테스트용 소비 컴포넌트
function NotesConsumer() {
  const { notes, loading, error } = useNotes();

  if (loading) return <div data-testid="loading">로딩 중</div>;
  if (error) return <div data-testid="error">{error}</div>;

  return (
    <ul>
      {notes.map((note) => (
        <li key={note.id} data-testid={`note-${note.id}`} data-content={note.content}>
          {note.title}
        </li>
      ))}
    </ul>
  );
}

function renderWithProvider(ui: ReactNode = <NotesConsumer />) {
  return render(<NotesProvider>{ui}</NotesProvider>);
}

describe('NotesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetchNotes 전에 로딩 상태를 표시한다', () => {
      mockedApi.fetchNotes.mockReturnValue(new Promise(() => {})); // 영원히 pending
      renderWithProvider();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('fetchNotes 완료 후 로딩 상태가 사라진다', async () => {
      mockedApi.fetchNotes.mockResolvedValue([]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('fetchNotes 실패 시 에러 메시지를 표시한다', async () => {
      mockedApi.fetchNotes.mockRejectedValue(new Error('Failed to fetch notes'));
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch notes');
      });
    });
  });

  describe('migrateContent 적용', () => {
    it('plain text 노트의 content를 <p> 태그로 감싼다', async () => {
      mockedApi.fetchNotes.mockResolvedValue([makeNote({ id: '1', content: '안녕하세요' })]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-1')).toHaveAttribute('data-content', '<p>안녕하세요</p>');
      });
    });

    it('이미 HTML인 노트의 content는 변경하지 않는다', async () => {
      const htmlContent = '<p>기존 HTML 내용</p>';
      mockedApi.fetchNotes.mockResolvedValue([makeNote({ id: '1', content: htmlContent })]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-1')).toHaveAttribute('data-content', htmlContent);
      });
    });

    it('빈 content를 <p></p>로 변환한다', async () => {
      mockedApi.fetchNotes.mockResolvedValue([makeNote({ id: '1', content: '' })]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-1')).toHaveAttribute('data-content', '<p></p>');
      });
    });

    it('줄바꿈이 있는 plain text를 각각 p 태그로 변환한다', async () => {
      mockedApi.fetchNotes.mockResolvedValue([
        makeNote({ id: '1', content: '첫째 줄\n둘째 줄' }),
      ]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-1')).toHaveAttribute(
          'data-content',
          '<p>첫째 줄</p><p>둘째 줄</p>',
        );
      });
    });

    it('여러 노트 각각에 migrateContent를 적용한다', async () => {
      mockedApi.fetchNotes.mockResolvedValue([
        makeNote({ id: '1', content: 'plain text' }),
        makeNote({ id: '2', content: '<p>html text</p>' }),
      ]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId('note-1')).toHaveAttribute(
          'data-content',
          '<p>plain text</p>',
        );
        expect(screen.getByTestId('note-2')).toHaveAttribute(
          'data-content',
          '<p>html text</p>',
        );
      });
    });
  });

  describe('notes 표시', () => {
    it('fetchNotes 결과를 화면에 표시한다', async () => {
      mockedApi.fetchNotes.mockResolvedValue([
        makeNote({ id: '1', title: '첫 번째 노트' }),
        makeNote({ id: '2', title: '두 번째 노트' }),
      ]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByText('첫 번째 노트')).toBeInTheDocument();
        expect(screen.getByText('두 번째 노트')).toBeInTheDocument();
      });
    });

    it('빈 배열이면 항목을 렌더링하지 않는다', async () => {
      mockedApi.fetchNotes.mockResolvedValue([]);
      renderWithProvider();
      await waitFor(() => {
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      });
    });
  });

  describe('useNotes', () => {
    it('NotesProvider 외부에서 useNotes를 사용하면 에러를 던진다', () => {
      function ConsumerOutsideProvider() {
        useNotes();
        return null;
      }
      // 에러가 콘솔에 출력되지 않도록 억제
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<ConsumerOutsideProvider />)).toThrow(
        'useNotes must be used within NotesProvider',
      );
      consoleError.mockRestore();
    });
  });
});