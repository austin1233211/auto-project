import { expect } from 'vitest';

global.expect = expect;

if (typeof window !== 'undefined') {
  if (!window.localStorage) {
    window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    };
  }
}
