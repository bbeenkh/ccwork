import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteItem } from './NoteItem';
import type { Note } from '../types/note';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '테스트 노트',
  content: '<p>테스트 내용</p>',
  tags: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  ...overrides,
});

describe('NoteItem', () => {
  describe('제목 렌더링', () => {
    it('노트 제목을 표시한다', () => {
      render(
        <NoteItem note={makeNote({ title: '내 노트 제목' })} isSelected={false} onSelect={vi.fn()} onDelete={vi.fn()} />,
      );
      expect(screen.getByText('내 노트 제목')).toBeInTheDocument();
    });

    it('제목이 없을 때 "(제목 없음)" 텍스트를 표시한다', () => {
      render(
        <NoteItem note={makeNote({ title: '' })} isSelected={false} onSelect={vi.fn()} onDelete={vi.fn()} />,
      );
      expect(screen.getByText('(제목 없음)')).toBeInTheDocument();
    });
  });

  describe('HTML content 스트립 (stripHtml 적용)', () => {
    it('HTML 태그를 제거하고 plain text로 미리보기를 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p>안녕하세요</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    });

    it('여러 HTML 태그가 있을 때 모두 제거하고 텍스트만 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p>첫째</p><p>둘째</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      // stripHtml joins with spaces
      expect(screen.getByText('첫째 둘째')).toBeInTheDocument();
    });

    it('볼드, 이탤릭 등 인라인 태그도 제거한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p><strong>중요</strong> 내용</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('중요 내용')).toBeInTheDocument();
    });

    it('HTML entity &nbsp;가 공백으로 변환된다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p>React와&nbsp;TypeScript</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('React와 TypeScript')).toBeInTheDocument();
    });

    it('content가 없으면 미리보기 영역을 렌더링하지 않는다', () => {
      const { container } = render(
        <NoteItem
          note={makeNote({ content: '' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      // No CardPreview rendered: no text beyond title/date area
      expect(container.querySelector('.note-card-preview')).not.toBeInTheDocument();
    });

    it('plain text content도 그대로 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '일반 텍스트 내용' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('일반 텍스트 내용')).toBeInTheDocument();
    });
  });

  describe('태그 렌더링', () => {
    it('태그가 있을 때 태그를 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ tags: ['React', 'TypeScript'] })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('#React')).toBeInTheDocument();
      expect(screen.getByText('#TypeScript')).toBeInTheDocument();
    });

    it('태그가 없을 때 태그 영역이 없다', () => {
      render(
        <NoteItem note={makeNote({ tags: [] })} isSelected={false} onSelect={vi.fn()} onDelete={vi.fn()} />,
      );
      expect(screen.queryByText(/#/)).not.toBeInTheDocument();
    });
  });

  describe('이벤트', () => {
    it('카드 클릭 시 onSelect가 노트 id와 함께 호출된다', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <NoteItem note={makeNote({ id: 'note-42' })} isSelected={false} onSelect={onSelect} onDelete={vi.fn()} />,
      );
      // The card is a div with role="button" (not a native <button>), target it directly
      await userEvent.click(container.firstChild as Element);
      expect(onSelect).toHaveBeenCalledWith('note-42');
    });

    it('삭제 버튼 클릭 시 onDelete가 노트 id와 함께 호출된다', async () => {
      const onDelete = vi.fn();
      const { container } = render(
        <NoteItem note={makeNote({ id: 'note-42', title: '삭제 테스트' })} isSelected={false} onSelect={vi.fn()} onDelete={onDelete} />,
      );
      // The delete button is a native <button type="button"> inside the card div
      const deleteButton = container.querySelector('button[type="button"]') as HTMLButtonElement;
      await userEvent.click(deleteButton);
      expect(onDelete).toHaveBeenCalledWith('note-42');
    });

    it('삭제 버튼 클릭이 카드 onSelect를 트리거하지 않는다 (stopPropagation)', async () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      const { container } = render(
        <NoteItem note={makeNote({ id: 'note-42', title: '노트' })} isSelected={false} onSelect={onSelect} onDelete={onDelete} />,
      );
      const deleteButton = container.querySelector('button[type="button"]') as HTMLButtonElement;
      await userEvent.click(deleteButton);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('isSelected', () => {
    it('isSelected=true일 때 aria-selected="true" 속성을 갖는다', () => {
      const { container } = render(
        <NoteItem note={makeNote()} isSelected={true} onSelect={vi.fn()} onDelete={vi.fn()} />,
      );
      expect(container.firstChild).toHaveAttribute('aria-selected', 'true');
    });

    it('isSelected=false일 때 aria-selected="false" 속성을 갖는다', () => {
      const { container } = render(
        <NoteItem note={makeNote()} isSelected={false} onSelect={vi.fn()} onDelete={vi.fn()} />,
      );
      expect(container.firstChild).toHaveAttribute('aria-selected', 'false');
    });
  });
});