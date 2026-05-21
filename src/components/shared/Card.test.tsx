import { describe, it } from 'vitest';

describe('Card', () => {
  describe('기본 렌더링', () => {
    it('children을 표시한다');
  });

  describe('onClick — 접근성', () => {
    it('onClick이 있을 때 role="button" 속성을 갖는다');
    it('onClick이 없을 때 role 속성이 없다');
    it('onClick이 있을 때 tabIndex=0 속성을 갖는다');
    it('클릭 시 onClick 핸들러가 호출된다');
    it('Enter 키 입력 시 onClick 핸들러가 호출된다');
  });

  describe('isSelected', () => {
    it('isSelected=true일 때 aria-selected="true" 속성을 갖는다');
    it('isSelected=false일 때 aria-selected="false" 속성을 갖는다');
  });

  describe('(class) 스타일 변형', () => {
    it('isAccent=true일 때 note-card-accent 클래스를 갖는다');
    it('onClick이 있을 때 cursor-pointer 클래스를 갖는다');
  });
});

describe('CardTitle', () => {
  it('children을 표시한다');

  describe.skip('(class)', () => {
    it('note-card-title 클래스를 갖는다');
  });
});

describe('CardPreview', () => {
  it('children을 표시한다');

  describe.skip('(class)', () => {
    it('note-card-preview 클래스를 갖는다');
  });
});

describe('CardFooter', () => {
  it('date가 있을 때 날짜를 표시한다');
  it('tags가 있을 때 태그 영역을 렌더링한다');
  it('actions가 있을 때 액션 영역을 렌더링한다');
  it('date, tags, actions 모두 없어도 렌더링된다');
});
