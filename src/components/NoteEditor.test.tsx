import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../types/note';

// react-quill-new mock (RichEditor가 내부에서 사용)
vi.mock('react-quill-new', () => ({
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <div
      data-testid="rich-editor"
      data-value={value}
      contentEditable
      suppressContentEditableWarning
      aria-label={placeholder}
      onInput={(e) => onChange((e.target as HTMLElement).textContent ?? '')}
    />
  ),
}));

// react-hot-toast mock
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// NotesContext mock
const mockAddNote = vi.fn();
const mockEditNote = vi.fn();
const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: '기존 노트',
    content: '<p>기존 내용</p>',
    tags: ['react'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: mockNotes,
    addNote: mockAddNote,
    editNote: mockEditNote,
  }),
}));

describe('NoteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RichEditor 사용', () => {
    it('textarea 대신 RichEditor를 렌더링한다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toBeInTheDocument();
    });

    it('textarea를 렌더링하지 않는다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.queryByRole('textbox', { name: /내용/ })).not.toBeInTheDocument();
      // textarea 엘리먼트가 없어야 함
      const { container } = render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(container.querySelector('textarea')).not.toBeInTheDocument();
    });

    it('placeholder를 RichEditor에 전달한다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveAttribute(
        'aria-label',
        '내용을 입력하세요...',
      );
    });
  });

  describe('새 노트 작성 모드 (isCreating=true)', () => {
    it('제목 입력 필드가 빈 상태로 렌더링된다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByPlaceholderText('제목')).toHaveValue('');
    });

    it('헤더에 "새 노트" 제목을 표시한다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByText('새 노트')).toBeInTheDocument();
    });

    it('빈 제목으로 저장하면 toast.error를 호출하고 addNote를 호출하지 않는다', async () => {
      const toast = await import('react-hot-toast');
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(toast.default.error).toHaveBeenCalledWith('제목을 입력해주세요');
      expect(mockAddNote).not.toHaveBeenCalled();
    });

    it('제목 입력 후 저장하면 addNote를 호출한다', async () => {
      mockAddNote.mockResolvedValue(undefined);
      const onDone = vi.fn();
      render(<NoteEditor selectedNoteId={null} isCreating onDone={onDone} />);
      await userEvent.type(screen.getByPlaceholderText('제목'), '새 노트 제목');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(mockAddNote).toHaveBeenCalledWith('새 노트 제목', '', []);
    });

    it('저장 성공 후 onDone이 호출된다', async () => {
      mockAddNote.mockResolvedValue(undefined);
      const onDone = vi.fn();
      render(<NoteEditor selectedNoteId={null} isCreating onDone={onDone} />);
      await userEvent.type(screen.getByPlaceholderText('제목'), '제목');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    });
  });

  describe('기존 노트 편집 모드', () => {
    it('선택된 노트의 제목을 입력 필드에 미리 채운다', () => {
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByPlaceholderText('제목')).toHaveValue('기존 노트');
    });

    it('선택된 노트의 content를 RichEditor에 전달한다', () => {
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveAttribute('data-value', '<p>기존 내용</p>');
    });

    it('헤더에 "노트 편집" 제목을 표시한다', () => {
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByText('노트 편집')).toBeInTheDocument();
    });

    it('저장 시 editNote를 해당 id와 함께 호출한다', async () => {
      mockEditNote.mockResolvedValue(undefined);
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={vi.fn()} />);
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(mockEditNote).toHaveBeenCalledWith('note-1', expect.objectContaining({ title: '기존 노트' }));
    });
  });

  describe('뒤로 가기', () => {
    it('뒤로 가기 버튼 클릭 시 onDone이 호출된다', async () => {
      const onDone = vi.fn();
      render(<NoteEditor selectedNoteId={null} isCreating onDone={onDone} />);
      await userEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
      expect(onDone).toHaveBeenCalledTimes(1);
    });
  });

  describe('저장 중 상태', () => {
    it('저장 중일 때 저장 버튼이 비활성화된다', async () => {
      // addNote를 resolve하지 않는 promise로 설정해 로딩 유지
      mockAddNote.mockReturnValue(new Promise(() => {}));
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      await userEvent.type(screen.getByPlaceholderText('제목'), '제목');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled();
    });
  });
});