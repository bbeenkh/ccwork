import { describe, it } from 'vitest';

describe('EmptyState', () => {
  describe('기본 렌더링', () => {
    it('title을 표시한다');
  });

  describe('icon', () => {
    it('icon prop이 있을 때 아이콘 영역을 렌더링한다');
    it('icon prop이 없을 때 아이콘 영역을 렌더링하지 않는다');
    it('아이콘 래퍼에 aria-hidden="true" 속성을 갖는다');
  });

  describe('description', () => {
    it('description prop이 있을 때 설명 텍스트를 표시한다');
    it('description prop이 없을 때 설명 엘리먼트를 렌더링하지 않는다');
  });

  describe('action', () => {
    it('action prop이 있을 때 액션 영역을 렌더링한다');
    it('action prop이 없을 때 액션 영역을 렌더링하지 않는다');
  });
});
