import { describe, it } from 'vitest';

describe('Tag', () => {
  describe('기본 렌더링', () => {
    it('label 텍스트를 표시한다');
  });

  describe('onRemove (에디터 모드)', () => {
    it('onRemove가 있을 때 삭제 버튼을 표시한다');
    it('onRemove가 없을 때 삭제 버튼이 없다');
    it('삭제 버튼의 aria-label에 label이 포함된다');
    it('삭제 버튼 클릭 시 onRemove 핸들러가 호출된다');
  });

  describe('(class) color / 에디터 스타일', () => {
    it('기본 color는 indigo이다');
    it('indigo color일 때 tag-indigo 클래스를 갖는다');
    it('pink color일 때 tag-pink 클래스를 갖는다');
    it('rose color일 때 tag-rose 클래스를 갖는다');
    it('onRemove가 있을 때 tag-editor 클래스를 갖는다');
  });
});
