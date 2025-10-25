/**
 * Performance utilities for optimizing DOM updates and computations
 */

const rAF = typeof globalThis.requestAnimationFrame === 'function'
  ? globalThis.requestAnimationFrame
  : (cb) => setTimeout(cb, 16);

const cAF = typeof globalThis.cancelAnimationFrame === 'function'
  ? globalThis.cancelAnimationFrame
  : (id) => clearTimeout(id);

/**
 * Creates a throttled function that only executes at most once per animation frame
 * @param {Function} fn - Function to throttle
 * @returns {Function} Throttled function
 */
export function throttleAnimationFrame(fn) {
  let rafId = null;
  let lastArgs = null;

  return function(...args) {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = rAF(() => {
        fn.apply(this, lastArgs);
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * Creates a batched update function that collects multiple update calls
 * and executes them together in a single animation frame
 * @param {Function} fn - Function to batch
 * @returns {Object} Object with update() and flush() methods
 */
export function batchUpdates(fn) {
  let rafId = null;
  let updates = [];

  function flush() {
    if (updates.length > 0) {
      fn(updates);
      updates = [];
    }
    rafId = null;
  }

  return {
    update(...args) {
      updates.push(args);
      
      if (rafId === null) {
        rafId = rAF(flush);
      }
    },
    flush() {
      if (rafId !== null) {
        cAF(rafId);
        rafId = null;
      }
      flush();
    }
  };
}

/**
 * Dirty flag tracker for caching computed values
 */
export class DirtyFlag {
  constructor() {
    this.dirty = true;
    this.cachedValue = null;
  }

  /**
   * Mark the cached value as dirty (needs recomputation)
   */
  markDirty() {
    this.dirty = true;
  }

  /**
   * Get the cached value if clean, or compute and cache if dirty
   * @param {Function} computeFn - Function to compute the value
   * @returns {*} The cached or newly computed value
   */
  get(computeFn) {
    if (this.dirty) {
      this.cachedValue = computeFn();
      this.dirty = false;
    }
    return this.cachedValue;
  }

  /**
   * Check if the value is dirty
   * @returns {boolean} True if dirty
   */
  isDirty() {
    return this.dirty;
  }

  /**
   * Clear the cache
   */
  clear() {
    this.dirty = true;
    this.cachedValue = null;
  }
}
