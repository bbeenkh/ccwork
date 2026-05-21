import { describe, it } from 'vitest';

describe('TopAppBar', () => {
  describe('기본 렌더링', () => {
    it('header 엘리먼트를 렌더링한다');
    it('title 텍스트를 표시한다');
  });

  describe('left', () => {
    it('left prop이 있을 때 왼쪽 영역을 렌더링한다');
    it('left prop이 없을 때 왼쪽 영역을 렌더링하지 않는다');
  });

  describe('right', () => {
    it('right prop이 있을 때 오른쪽 영역을 렌더링한다');
    it('right prop이 없을 때 오른쪽 영역을 렌더링하지 않는다');
  });
});
