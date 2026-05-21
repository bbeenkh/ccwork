import { describe, it } from 'vitest';

describe('Input', () => {
  describe('기본 렌더링', () => {
    it('input 엘리먼트를 렌더링한다');
  });

  describe('label', () => {
    it('label prop이 있을 때 label 엘리먼트를 표시한다');
    it('label과 input이 getByLabelText로 조회된다');
    it('label prop이 없을 때 label 엘리먼트가 없다');
  });

  describe('errorMessage', () => {
    it('errorMessage가 있을 때 에러 텍스트를 표시한다');
    it('errorMessage가 있을 때 aria-invalid="true" 속성을 갖는다');
    it('errorMessage가 있을 때 aria-describedby로 에러 엘리먼트와 연결된다');
    it('errorMessage가 없을 때 에러 텍스트가 없다');
    it('errorMessage가 없을 때 aria-invalid가 false이다');
  });

  describe('id', () => {
    it('id prop을 전달하면 해당 id를 사용한다');
    it('id prop이 없으면 자동 생성된 id를 사용한다');
  });

});
