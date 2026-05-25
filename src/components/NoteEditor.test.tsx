import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import { useNotes } from '../context/NotesContext';
import type { Note } from '../types/note';

// react-quill-new 모킹 (RichEditor 의존성)
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
      data-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange((e.target as HTMLElement).innerHTML)}
    />
  ),
}));

// NotesContext 모킹
vi.mock('../context/NotesContext');

const mockedUseNotes = vi.mocked(useNotes);

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '기존 노트 제목',
  content: '<p>기존 노트 내용</p>',
  tags: ['React'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  ...overrides,
});

const defaultContextValue = {
  notes: [],
  loading: false,
  error: null,
  addNote: vi.fn(),
  editNote: vi.fn(),
  removeNote: vi.fn(),
};

describe('NoteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseNotes.mockReturnValue({ ...defaultContextValue });
  });

  describe('기본 렌더링', () => {
    it('제목 입력 필드를 렌더링한다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByPlaceholderText('제목')).toBeInTheDocument();
    });

    it('RichEditor를 렌더링한다 (textarea 대신)', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toBeInTheDocument();
    });

    it('textarea를 렌더링하지 않는다', () => {
      const { container } = render(
        <NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />,
      );
      expect(container.querySelector('textarea')).not.toBeInTheDocument();
    });
  });

  describe('새 노트 작성 모드 (isCreating=true)', () => {
    it('제목 입력 필드가 비어있다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByPlaceholderText('제목')).toHaveValue('');
    });

    it('RichEditor가 빈 값으로 시작한다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveAttribute('data-value', '');
    });

    it('"새 노트" 타이틀을 표시한다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByText('새 노트')).toBeInTheDocument();
    });

    it('RichEditor에 placeholder가 전달된다', () => {
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveAttribute(
        'data-placeholder',
        '내용을 입력하세요...',
      );
    });
  });

  describe('기존 노트 편집 모드 (isCreating=false, selectedNoteId 있음)', () => {
    beforeEach(() => {
      mockedUseNotes.mockReturnValue({
        ...defaultContextValue,
        notes: [makeNote()],
      });
    });

    it('선택된 노트의 제목을 입력 필드에 표시한다', () => {
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByPlaceholderText('제목')).toHaveValue('기존 노트 제목');
    });

    it('선택된 노트의 content를 RichEditor에 전달한다', () => {
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByTestId('rich-editor')).toHaveAttribute(
        'data-value',
        '<p>기존 노트 내용</p>',
      );
    });

    it('"노트 편집" 타이틀을 표시한다', () => {
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={vi.fn()} />);
      expect(screen.getByText('노트 편집')).toBeInTheDocument();
    });
  });

  describe('저장 동작', () => {
    it('제목이 비어있을 때 저장하면 addNote를 호출하지 않는다', async () => {
      const addNote = vi.fn();
      mockedUseNotes.mockReturnValue({ ...defaultContextValue, addNote });
      render(<NoteEditor selectedNoteId={null} isCreating onDone={vi.fn()} />);
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(addNote).not.toHaveBeenCalled();
    });

    it('새 노트 저장 성공 시 onDone이 호출된다', async () => {
      const addNote = vi.fn().mockResolvedValue(undefined);
      const onDone = vi.fn();
      mockedUseNotes.mockReturnValue({ ...defaultContextValue, addNote });
      render(<NoteEditor selectedNoteId={null} isCreating onDone={onDone} />);
      await userEvent.type(screen.getByPlaceholderText('제목'), '새 노트 제목');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      await waitFor(() => {
        expect(onDone).toHaveBeenCalledTimes(1);
      });
    });

    it('기존 노트 저장 성공 시 editNote가 호출된다', async () => {
      const editNote = vi.fn().mockResolvedValue(undefined);
      const onDone = vi.fn();
      mockedUseNotes.mockReturnValue({
        ...defaultContextValue,
        notes: [makeNote()],
        editNote,
      });
      render(<NoteEditor selectedNoteId="note-1" isCreating={false} onDone={onDone} />);
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      await waitFor(() => {
        expect(editNote).toHaveBeenCalledWith(
          'note-1',
          expect.objectContaining({ title: '기존 노트 제목' }),
        );
      });
    });
  });

  describe('네비게이션', () => {
    it('"뒤로 가기" 버튼 클릭 시 onDone이 호출된다', async () => {
      const onDone = vi.fn();
      render(<NoteEditor selectedNoteId={null} isCreating onDone={onDone} />);
      await userEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
      expect(onDone).toHaveBeenCalledTimes(1);
    });
  });
});