import { describe, it, expect, beforeEach, vi } from 'vitest';
import { throttleAnimationFrame, batchUpdates, DirtyFlag } from '../../src/utils/performance.js';

describe('Performance Utilities', () => {
  describe('throttleAnimationFrame()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should throttle function calls to once per animation frame', () => {
      const fn = vi.fn();
      const throttled = throttleAnimationFrame(fn);

      throttled(1);
      throttled(2);
      throttled(3);

      expect(fn).not.toHaveBeenCalled();

      vi.runAllTimers();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(3);
    });

    it('should use the latest arguments when called multiple times', () => {
      const fn = vi.fn();
      const throttled = throttleAnimationFrame(fn);

      throttled('first');
      throttled('second');
      throttled('third');

      vi.runAllTimers();

      expect(fn).toHaveBeenCalledWith('third');
    });
  });

  describe('batchUpdates()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should batch multiple update calls into a single execution', () => {
      const fn = vi.fn();
      const batched = batchUpdates(fn);

      batched.update('a');
      batched.update('b');
      batched.update('c');

      expect(fn).not.toHaveBeenCalled();

      vi.runAllTimers();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith([['a'], ['b'], ['c']]);
    });

    it('should support manual flush', () => {
      const fn = vi.fn();
      const batched = batchUpdates(fn);

      batched.update('x');
      batched.update('y');

      batched.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith([['x'], ['y']]);
    });
  });

  describe('DirtyFlag', () => {
    it('should mark as dirty initially', () => {
      const flag = new DirtyFlag();
      expect(flag.isDirty()).toBe(true);
    });

    it('should compute value when dirty', () => {
      const flag = new DirtyFlag();
      const computeFn = vi.fn(() => 42);

      const result = flag.get(computeFn);

      expect(result).toBe(42);
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(flag.isDirty()).toBe(false);
    });

    it('should return cached value when clean', () => {
      const flag = new DirtyFlag();
      const computeFn = vi.fn(() => 42);

      flag.get(computeFn);
      const result = flag.get(computeFn);

      expect(result).toBe(42);
      expect(computeFn).toHaveBeenCalledTimes(1);
    });

    it('should recompute when marked dirty', () => {
      const flag = new DirtyFlag();
      let value = 1;
      const computeFn = vi.fn(() => value);

      flag.get(computeFn);
      
      value = 2;
      flag.markDirty();
      
      const result = flag.get(computeFn);

      expect(result).toBe(2);
      expect(computeFn).toHaveBeenCalledTimes(2);
    });

    it('should clear cache', () => {
      const flag = new DirtyFlag();
      const computeFn = vi.fn(() => 42);

      flag.get(computeFn);
      flag.clear();

      expect(flag.isDirty()).toBe(true);
      expect(flag.cachedValue).toBe(null);
    });
  });
});
