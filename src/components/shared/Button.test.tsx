import { describe, it } from 'vitest';

describe('Button', () => {
  describe('기본 렌더링', () => {
    it('children을 표시한다');
  });

  describe('isLoading', () => {
    it('isLoading=true일 때 aria-busy="true" 속성을 갖는다');
    it('isLoading=true일 때 버튼이 disabled 상태가 된다');
    it('isLoading=true일 때 스피너가 렌더링된다');
    it('isLoading=false일 때 스피너가 렌더링되지 않는다');
  });

  describe('disabled', () => {
    it('disabled=true일 때 버튼이 비활성화된다');
    it('disabled 상태일 때 클릭해도 onClick이 호출되지 않는다');
  });

  describe('이벤트', () => {
    it('클릭 시 onClick 핸들러가 호출된다');
  });

  describe('(class) variant / size 스타일', () => {
    it('기본 variant는 primary이다');
    it('primary variant일 때 btn-primary 클래스를 갖는다');
    it('outline variant일 때 btn-outline 클래스를 갖는다');
    it('ghost variant일 때 btn-ghost 클래스를 갖는다');
    it('destructive variant일 때 btn-destructive 클래스를 갖는다');
    it('sm size일 때 sm 스타일 클래스를 갖는다');
    it('lg size일 때 lg 스타일 클래스를 갖는다');
  });
});
