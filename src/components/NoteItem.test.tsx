import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteItem } from './NoteItem';
import type { Note } from '../types/note';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: '테스트 노트',
  content: '<p>노트 내용</p>',
  tags: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('NoteItem', () => {
  describe('기본 렌더링', () => {
    it('노트 제목을 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ title: '제목 테스트' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('제목 테스트')).toBeInTheDocument();
    });

    it('제목이 없을 때 "(제목 없음)"을 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ title: '' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('(제목 없음)')).toBeInTheDocument();
    });
  });

  describe('HTML content 미리보기 (stripHtml)', () => {
    it('HTML 태그가 제거된 텍스트로 미리보기를 표시한다', () => {
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

    it('HTML 원본 마크업이 미리보기에 노출되지 않는다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p>내용</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.queryByText('<p>내용</p>')).not.toBeInTheDocument();
    });

    it('bold 태그 등 인라인 HTML도 제거한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p><strong>굵은</strong> 텍스트</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('굵은 텍스트')).toBeInTheDocument();
    });

    it('여러 p 태그 내용을 공백으로 구분해 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p>첫째</p><p>둘째</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('첫째 둘째')).toBeInTheDocument();
    });

    it('content가 빈 문자열이면 미리보기를 렌더링하지 않는다', () => {
      const { container } = render(
        <NoteItem
          note={makeNote({ content: '' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      // CardPreview는 note.content가 truthy일 때만 렌더링됨
      expect(container.querySelector('.note-card-preview')).not.toBeInTheDocument();
    });

    it('plain text content는 그대로 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '일반 텍스트' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('일반 텍스트')).toBeInTheDocument();
    });

    it('&nbsp; HTML 엔티티를 공백으로 변환해 표시한다', () => {
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
  });

  describe('태그', () => {
    it('태그가 있을 때 태그를 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ tags: ['react', 'typescript'] })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('#react')).toBeInTheDocument();
      expect(screen.getByText('#typescript')).toBeInTheDocument();
    });

    it('태그가 없을 때 태그를 표시하지 않는다', () => {
      render(
        <NoteItem
          note={makeNote({ tags: [] })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
    });
  });

  describe('이벤트', () => {
    it('카드 클릭 시 onSelect가 노트 id와 함께 호출된다', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <NoteItem
          note={makeNote({ id: 'note-123' })}
          isSelected={false}
          onSelect={onSelect}
          onDelete={vi.fn()}
        />,
      );
      const card = container.querySelector('.note-card') as HTMLElement;
      await userEvent.click(card);
      expect(onSelect).toHaveBeenCalledWith('note-123');
    });

    it('삭제 버튼 클릭 시 onDelete가 노트 id와 함께 호출된다', async () => {
      const onDelete = vi.fn();
      render(
        <NoteItem
          note={makeNote({ id: 'note-456', title: '삭제할 노트' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={onDelete}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '삭제할 노트 삭제' }));
      expect(onDelete).toHaveBeenCalledWith('note-456');
    });
  });
});