import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseQuery, updateQuery } from './queryState';

function setUrl(url: string) {
  window.history.replaceState({}, '', url);
}

describe('queryState', () => {
  beforeEach(() => {
    setUrl('/mietshop');
  });

  describe('parseQuery', () => {
    it('normalizes q/cat/tags', () => {
      setUrl('/mietshop?q=%20abc%20&cat=%20lights%20&tags=foo,%20bar%20,foo,,');
      expect(parseQuery()).toEqual({ q: 'abc', cat: 'lights', tags: ['foo', 'bar'] });
    });

    it('returns undefined for empty values', () => {
      setUrl('/mietshop?q=&cat=%20%20&tags=%20');
      expect(parseQuery()).toEqual({ q: undefined, cat: undefined, tags: undefined });
    });
  });

  describe('updateQuery', () => {
    it('uses replaceState by default', () => {
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      const pushSpy = vi.spyOn(window.history, 'pushState');

      updateQuery({ q: 'abc' });

      expect(replaceSpy).toHaveBeenCalledTimes(1);
      expect(pushSpy).not.toHaveBeenCalled();
      expect(parseQuery()).toEqual({ q: 'abc', cat: undefined, tags: undefined });
    });

    it('uses pushState when replace=false', () => {
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      const pushSpy = vi.spyOn(window.history, 'pushState');

      updateQuery({ q: 'abc' }, { replace: false });

      expect(pushSpy).toHaveBeenCalledTimes(1);
      expect(replaceSpy).not.toHaveBeenCalled();
      expect(parseQuery()).toEqual({ q: 'abc', cat: undefined, tags: undefined });
    });

    it('preserves params when undefined is passed and clears with empty values', () => {
      setUrl('/mietshop?q=abc&cat=lights&tags=foo,bar');

      updateQuery({ cat: undefined });
      expect(parseQuery()).toEqual({ q: 'abc', cat: 'lights', tags: ['foo', 'bar'] });

      updateQuery({ cat: '' });
      expect(parseQuery()).toEqual({ q: 'abc', cat: undefined, tags: ['foo', 'bar'] });

      updateQuery({ tags: [] });
      expect(parseQuery()).toEqual({ q: 'abc', cat: undefined, tags: undefined });

      updateQuery({ q: '' });
      expect(parseQuery()).toEqual({ q: undefined, cat: undefined, tags: undefined });
    });

    it('preserves the hash fragment', () => {
      setUrl('/mietshop#section');
      updateQuery({ q: 'abc' });
      expect(window.location.hash).toBe('#section');
    });

    it('normalizes tags on write', () => {
      updateQuery({ tags: [' foo ', 'bar', 'foo', ''] });
      expect(parseQuery()).toEqual({ q: undefined, cat: undefined, tags: ['foo', 'bar'] });
    });
  });
});

