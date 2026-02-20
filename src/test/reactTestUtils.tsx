import type { ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

export interface MountedComponent {
  container: HTMLDivElement;
  rerender: (next: ReactElement) => Promise<void>;
  unmount: () => Promise<void>;
}

export async function mount(ui: ReactElement): Promise<MountedComponent> {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root: Root = createRoot(container);

  await act(async () => {
    root.render(ui);
  });

  return {
    container,
    rerender: async (next: ReactElement) => {
      await act(async () => {
        root.render(next);
      });
    },
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

export async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

export async function waitFor(assertion: () => void, timeoutMs = 1500): Promise<void> {
  const start = Date.now();
  let lastError: unknown = null;

  while (Date.now() - start < timeoutMs) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await act(async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 10));
      });
    }
  }

  throw lastError ?? new Error('waitFor timed out');
}
