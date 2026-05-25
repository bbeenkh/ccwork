import { describe, it, expect } from 'vitest';
import { migrateContent } from './migrateContent';

describe('migrateContent', () => {
  it('빈 문자열은 빈 단락으로 변환한다', () => {
    expect(migrateContent('')).toBe('<p></p>');
  });

  it('이미 HTML 태그로 시작하면 그대로 반환한다', () => {
    const html = '<p>기존 HTML 내용</p>';
    expect(migrateContent(html)).toBe(html);
  });

  it('plain text를 p 태그로 감싼다', () => {
    expect(migrateContent('안녕하세요')).toBe('<p>안녕하세요</p>');
  });

  it('줄바꿈이 있는 plain text를 각각 p 태그로 변환한다', () => {
    expect(migrateContent('첫째 줄\n둘째 줄')).toBe('<p>첫째 줄</p><p>둘째 줄</p>');
  });

  it('빈 줄은 무시한다', () => {
    expect(migrateContent('첫째 줄\n\n둘째 줄')).toBe('<p>첫째 줄</p><p>둘째 줄</p>');
  });

  it('공백만 있는 문자열은 <p></p>로 변환되지 않고 공백 단락을 생성한다', () => {
    // " ".startsWith('<') === false, filter(Boolean)은 " "를 통과시킴
    expect(migrateContent(' ')).toBe('<p> </p>');
  });

  it('<로 시작하는 다양한 HTML 태그를 그대로 반환한다', () => {
    const inputs = ['<h1>제목</h1>', '<ul><li>항목</li></ul>', '<blockquote>인용</blockquote>'];
    inputs.forEach((html) => {
      expect(migrateContent(html)).toBe(html);
    });
  });

  it('단일 줄바꿈이 끝에 있어도 빈 줄을 무시한다', () => {
    expect(migrateContent('내용\n')).toBe('<p>내용</p>');
  });
});
