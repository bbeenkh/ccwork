import { describe, it } from 'vitest';

describe('BottomNav', () => {
  describe('기본 렌더링', () => {
    it('nav 엘리먼트를 렌더링한다');
    it('items 배열만큼 버튼을 렌더링한다');
    it('각 버튼에 label을 aria-label로 설정한다');
    it('각 버튼에 label 텍스트를 표시한다');
  });

  describe('activeId', () => {
    it('active 아이템의 icon 함수를 true 인자로 호출한다');
    it('비활성 아이템의 icon 함수를 false 인자로 호출한다');
  });

  describe('이벤트', () => {
    it('버튼 클릭 시 해당 아이템의 onClick 핸들러가 호출된다');
  });

  // aria로 활성 상태를 표현하는 속성 없음 — class 검증 필요
  describe.skip('(class) 활성 상태 스타일', () => {
    it('activeId와 일치하는 아이템 버튼에 active 클래스를 갖는다');
    it('activeId와 일치하지 않는 아이템 버튼에 active 클래스가 없다');
  });
});
