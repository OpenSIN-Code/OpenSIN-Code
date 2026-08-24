import { describe, it, expect } from 'vitest';
import { intersperse, count, uniq } from '../utils_v2/array.js';

describe('utils_v2', () => {
  describe('array utilities', () => {
    it('should intersperse elements with separator', () => {
      const result = intersperse([1, 2, 3], () => 0);
      expect(result).toEqual([1, 0, 2, 0, 3]);
    });

    it('should handle single element array in intersperse', () => {
      const result = intersperse([42], () => 0);
      expect(result).toEqual([42]);
    });

    it('should handle empty array in intersperse', () => {
      const result = intersperse([], () => 0);
      expect(result).toEqual([]);
    });

    it('should provide correct index to separator function', () => {
      const indices: number[] = [];
      intersperse(['a', 'b', 'c'], (i) => { indices.push(i); return '-'; });
      expect(indices).toEqual([1, 2]);
    });

    it('should intersperse with dynamic separator values', () => {
      const result = intersperse([10, 20, 30], (i) => i * 100);
      expect(result).toEqual([10, 100, 20, 200, 30]);
    });

    it('should count elements matching predicate', () => {
      const result = count([1, 2, 3, 4, 5], (x) => x > 3);
      expect(result).toBe(2);
    });

    it('should return 0 when no elements match predicate', () => {
      const result = count([1, 2, 3], (x) => x > 10);
      expect(result).toBe(0);
    });

    it('should count all elements when predicate always true', () => {
      const result = count([1, 2, 3], () => true);
      expect(result).toBe(3);
    });

    it('should count with falsy predicate results', () => {
      const result = count([0, 1, 2, 3], (x) => x);
      expect(result).toBe(3);
    });

    it('should deduplicate array with uniq', () => {
      const result = uniq([1, 2, 2, 3, 3, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle already unique array in uniq', () => {
      const result = uniq([1, 2, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle empty array in uniq', () => {
      const result = uniq([]);
      expect(result).toEqual([]);
    });

    it('should handle iterable input in uniq', () => {
      const result = uniq(new Set([1, 2, 2, 3]));
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle string arrays with uniq', () => {
      const result = uniq(['a', 'b', 'a', 'c', 'b']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should preserve order in uniq', () => {
      const result = uniq([3, 1, 2, 1, 3]);
      expect(result).toEqual([3, 1, 2]);
    });

    it('should handle count with complex objects', () => {
      const items = [{ val: 1 }, { val: 2 }, { val: 3 }];
      const result = count(items, (x) => x.val > 1);
      expect(result).toBe(2);
    });

    it('should handle intersperse with object arrays', () => {
      const objs = [{ a: 1 }, { b: 2 }];
      const result = intersperse(objs, () => ({ sep: true }));
      expect(result).toHaveLength(3);
      expect(result[1]).toEqual({ sep: true });
    });
  });
});
