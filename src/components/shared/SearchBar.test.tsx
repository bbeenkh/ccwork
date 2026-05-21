import { describe, it } from 'vitest';

describe('SearchBar', () => {
  describe('기본 렌더링', () => {
    it('search 타입 input을 렌더링한다');
    it('기본 placeholder를 aria-label로 표시한다');
  });

  describe('value / onChange', () => {
    it('value prop이 input에 반영된다');
    it('입력 시 onChange 핸들러가 새 값과 함께 호출된다');
  });

  describe('clear 버튼', () => {
    it('value가 있고 onClear가 있을 때 clear 버튼이 표시된다');
    it('value가 빈 문자열이면 clear 버튼이 표시되지 않는다');
    it('onClear가 없으면 value가 있어도 clear 버튼이 표시되지 않는다');
    it('clear 버튼의 aria-label이 "검색 초기화"이다');
    it('clear 버튼 클릭 시 onClear 핸들러가 호출된다');
  });

  describe('접근성', () => {
    it('input의 aria-label이 placeholder와 동일하다');
  });
});
