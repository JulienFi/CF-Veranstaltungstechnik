import { afterEach, vi } from 'vitest';

// Required for React's act() to work without environment warnings in Vitest+jsdom.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  vi.restoreAllMocks();
});
