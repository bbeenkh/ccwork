import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../types/note';

// Mock RichEditor to a simple controlled textarea for testing
vi.mock('./shared/RichEditor', () => ({
  RichEditor: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      data-testid="rich-editor"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNotes context
const mockAddNote = vi.fn();
const mockEditNote = vi.fn();
const mockNotes: Note[] = [];

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: mockNotes,
    addNote: mockAddNote,
    editNote: mockEditNote,
  }),
}));

import toast from 'react-hot-toast';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '기존 노트 제목',
  content: '<p>기존 내용</p>',
  tags: ['React'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('NoteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset notes array
    mockNotes.length = 0;
  });

  describe('RichEditor 렌더링', () => {
    it('textarea 대신 RichEditor를 렌더링한다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /내용/ })).not.toBeInTheDocument();
    });

    it('RichEditor에 placeholder prop이 전달된다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveAttribute('placeholder', '내용을 입력하세요...');
    });

    it('새 노트 생성 모드에서 RichEditor의 초기값이 빈 문자열이다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveValue('');
    });
  });

  describe('기존 노트 편집 모드', () => {
    it('선택된 노트의 content가 RichEditor에 반영된다', () => {
      const note = makeNote({ id: 'n1', content: '<p>기존 내용</p>' });
      mockNotes.push(note);

      render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveValue('<p>기존 내용</p>');
    });

    it('선택된 노트의 제목이 제목 입력 필드에 반영된다', () => {
      const note = makeNote({ id: 'n1', title: '편집할 노트' });
      mockNotes.push(note);

      render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByPlaceholderText('제목')).toHaveValue('편집할 노트');
    });
  });

  describe('RichEditor onChange', () => {
    it('RichEditor에서 onChange 발생 시 content가 업데이트된다', async () => {
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);
      const editor = screen.getByTestId('rich-editor');
      await userEvent.clear(editor);
      await userEvent.type(editor, '<p>새 내용</p>');
      expect(editor).toHaveValue('<p>새 내용</p>');
    });
  });

  describe('저장 동작', () => {
    it('새 노트 모드에서 저장 시 addNote가 호출된다', async () => {
      mockAddNote.mockResolvedValue(undefined);
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

      await userEvent.type(screen.getByPlaceholderText('제목'), '새 노트 제목');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockAddNote).toHaveBeenCalledWith('새 노트 제목', '', []);
      });
    });

    it('편집 모드에서 저장 시 editNote가 호출된다', async () => {
      const note = makeNote({ id: 'e1', title: '수정 노트', content: '<p>내용</p>' });
      mockNotes.push(note);
      mockEditNote.mockResolvedValue(undefined);

      render(<NoteEditor selectedNoteId="e1" isCreating={false} onDone={vi.fn()} />);

      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockEditNote).toHaveBeenCalledWith(
          'e1',
          expect.objectContaining({ title: '수정 노트', content: '<p>내용</p>' }),
        );
      });
    });

    it('저장 성공 후 onDone이 호출된다', async () => {
      mockAddNote.mockResolvedValue(undefined);
      const onDone = vi.fn();
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);

      await userEvent.type(screen.getByPlaceholderText('제목'), '저장 테스트');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(onDone).toHaveBeenCalledTimes(1);
      });
    });

    it('저장 성공 후 success toast가 표시된다', async () => {
      mockAddNote.mockResolvedValue(undefined);
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

      await userEvent.type(screen.getByPlaceholderText('제목'), '저장 테스트');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('제목 유효성 검사', () => {
    it('제목이 비어 있으면 addNote를 호출하지 않는다', async () => {
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      expect(mockAddNote).not.toHaveBeenCalled();
    });

    it('제목이 비어 있으면 에러 toast를 표시한다', async () => {
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      expect(toast.error).toHaveBeenCalledWith('제목을 입력해주세요');
    });

    it('공백만 있는 제목도 유효하지 않은 것으로 처리한다', async () => {
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

      await userEvent.type(screen.getByPlaceholderText('제목'), '   ');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      expect(mockAddNote).not.toHaveBeenCalled();
    });
  });

  describe('뒤로 가기', () => {
    it('뒤로 가기 버튼 클릭 시 onDone이 호출된다', async () => {
      const onDone = vi.fn();
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);

      await userEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
      expect(onDone).toHaveBeenCalledTimes(1);
    });
  });

  describe('저장 실패', () => {
    it('addNote 실패 시 error toast가 표시된다', async () => {
      mockAddNote.mockRejectedValue(new Error('저장 실패'));
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

      await userEvent.type(screen.getByPlaceholderText('제목'), '실패 테스트');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('저장에 실패했습니다');
      });
    });

    it('addNote 실패 시 onDone은 호출되지 않는다', async () => {
      mockAddNote.mockRejectedValue(new Error('저장 실패'));
      const onDone = vi.fn();
      render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);

      await userEvent.type(screen.getByPlaceholderText('제목'), '실패 테스트');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      expect(onDone).not.toHaveBeenCalled();
    });
  });
});