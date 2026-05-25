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
  updatedAt: '2024-01-15T00:00:00.000Z',
  ...overrides,
});

describe('NoteItem', () => {
  describe('기본 렌더링', () => {
    it('노트 제목을 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ title: '나의 노트' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('나의 노트')).toBeInTheDocument();
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

  describe('HTML content 렌더링 (stripHtml)', () => {
    it('HTML 태그가 제거된 순수 텍스트를 미리보기로 표시한다', () => {
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

    it('여러 p 태그가 있는 HTML에서 텍스트만 추출한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p>첫째 줄</p><p>둘째 줄</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('첫째 줄 둘째 줄')).toBeInTheDocument();
    });

    it('HTML 엔티티(&nbsp;)를 공백으로 변환한다', () => {
      render(
        <NoteItem
          note={makeNote({ content: '<p>React&nbsp;TypeScript</p>' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('React TypeScript')).toBeInTheDocument();
    });

    it('bold, italic 등 인라인 태그도 제거한다', () => {
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

    it('content가 빈 문자열이면 미리보기를 렌더링하지 않는다', () => {
      const { container } = render(
        <NoteItem
          note={makeNote({ content: '' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      // CardPreview 엘리먼트가 없어야 한다
      expect(container.querySelector('.note-card-preview')).not.toBeInTheDocument();
    });
  });

  describe('태그 렌더링', () => {
    it('tags가 있을 때 # 접두사와 함께 표시한다', () => {
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

    it('tags가 빈 배열이면 태그를 렌더링하지 않는다', () => {
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

  describe('날짜', () => {
    it('updatedAt 날짜를 포맷하여 표시한다', () => {
      render(
        <NoteItem
          note={makeNote({ updatedAt: '2024-06-15T00:00:00.000Z' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      // en-US locale: "Jun 15, 2024"
      expect(screen.getByText(/Jun 15, 2024/)).toBeInTheDocument();
    });
  });

  describe('이벤트', () => {
    it('카드 클릭 시 onSelect(note.id)가 호출된다', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <NoteItem
          note={makeNote({ id: 'note-42' })}
          isSelected={false}
          onSelect={onSelect}
          onDelete={vi.fn()}
        />,
      );
      // 카드 자체(최상위 role="button" div)를 직접 클릭
      const cardButton = container.querySelector<HTMLElement>('.note-card[role="button"]');
      expect(cardButton).not.toBeNull();
      await userEvent.click(cardButton!);
      expect(onSelect).toHaveBeenCalledWith('note-42');
    });

    it('삭제 버튼 클릭 시 onDelete(note.id)가 호출된다', async () => {
      const onDelete = vi.fn();
      render(
        <NoteItem
          note={makeNote({ id: 'note-42', title: '삭제할 노트' })}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={onDelete}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '삭제할 노트 삭제' }));
      expect(onDelete).toHaveBeenCalledWith('note-42');
    });

    it('삭제 버튼 클릭이 카드 클릭으로 전파되지 않는다', async () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      render(
        <NoteItem
          note={makeNote({ title: '전파 테스트' })}
          isSelected={false}
          onSelect={onSelect}
          onDelete={onDelete}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '전파 테스트 삭제' }));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('isSelected', () => {
    it('isSelected=true일 때 aria-selected="true" 속성을 갖는다', () => {
      const { container } = render(
        <NoteItem
          note={makeNote()}
          isSelected={true}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(container.querySelector('[aria-selected="true"]')).toBeInTheDocument();
    });

    it('isSelected=false일 때 aria-selected="false" 속성을 갖는다', () => {
      const { container } = render(
        <NoteItem
          note={makeNote()}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(container.querySelector('[aria-selected="false"]')).toBeInTheDocument();
    });
  });
});