import { describe, it } from 'vitest';

describe('MobileLayout', () => {
  describe('기본 렌더링', () => {
    it('header를 렌더링한다');
    it('children을 main 영역에 렌더링한다');
  });

  describe('fab', () => {
    it('fab prop이 있을 때 FAB을 렌더링한다');
    it('fab prop이 없을 때 FAB을 렌더링하지 않는다');
  });

  describe('bottomNav', () => {
    it('bottomNav prop이 있을 때 하단 네비게이션을 렌더링한다');
    it('bottomNav prop이 없을 때 하단 네비게이션을 렌더링하지 않는다');
  });

  // 인라인 style 값으로만 검증 가능 — 별도 처리 필요
  describe.skip('(style) main paddingBottom', () => {
    it('bottomNav가 있을 때 main의 paddingBottom이 nav 높이를 고려한다');
    it('bottomNav가 없을 때 main의 paddingBottom이 fab 크기만 고려한다');
  });
});
