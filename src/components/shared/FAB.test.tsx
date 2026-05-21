import { describe, it } from 'vitest';

describe('FAB', () => {
  describe('기본 렌더링', () => {
    it('button 엘리먼트를 렌더링한다');
    it('icon을 표시한다');
  });

  describe('접근성', () => {
    it('aria-label prop이 버튼에 설정된다');
  });

  describe('이벤트', () => {
    it('클릭 시 onClick 핸들러가 호출된다');
  });

});
