import { describe, it } from 'vitest';

describe('FilterChip', () => {
  describe('기본 렌더링', () => {
    it('label 텍스트를 표시한다');
  });

  describe('isActive', () => {
    it('isActive=true일 때 aria-pressed="true" 속성을 갖는다');
    it('isActive=false일 때 aria-pressed="false" 속성을 갖는다');
  });

  describe('이벤트', () => {
    it('클릭 시 onClick 핸들러가 호출된다');
  });

  describe('(class) 스타일', () => {
    it('filter-chip 클래스를 갖는다');
    it('isActive=true일 때 active 클래스를 갖는다');
    it('isActive=false일 때 active 클래스가 없다');
  });
});
