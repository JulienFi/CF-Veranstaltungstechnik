import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import Header from './Header';
import { mount, waitFor, type MountedComponent } from '../test/reactTestUtils';

describe('Header mobile navigation accessibility', () => {
  let mounted: MountedComponent | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
  });

  afterEach(async () => {
    if (mounted) {
      await mounted.unmount();
      mounted = null;
    }
    localStorage.clear();
  });

  it('opens drawer, traps body scroll, and closes on Escape', async () => {
    mounted = await mount(<Header />);

    const menuButton = mounted.container.querySelector('button[aria-label="Menü öffnen"]') as HTMLButtonElement | null;
    expect(menuButton).not.toBeNull();

    await act(async () => {
      menuButton?.focus();
      menuButton?.click();
    });

    await waitFor(() => {
      expect(document.getElementById('mobile-navigation')).not.toBeNull();
      expect(document.body.style.overflow).toBe('hidden');
    });

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    await waitFor(() => {
      expect(document.getElementById('mobile-navigation')).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('cycles focus to first element when tabbing from the last element', async () => {
    mounted = await mount(<Header />);

    const menuButton = mounted.container.querySelector('button[aria-label="Menü öffnen"]') as HTMLButtonElement | null;
    expect(menuButton).not.toBeNull();

    await act(async () => {
      menuButton?.click();
    });

    await waitFor(() => {
      expect(document.getElementById('mobile-navigation')).not.toBeNull();
    });

    const drawer = document.getElementById('mobile-navigation') as HTMLElement;
    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );

    expect(focusable.length).toBeGreaterThan(1);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    last.focus();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    });

    expect(document.activeElement).toBe(first);
  });
});
