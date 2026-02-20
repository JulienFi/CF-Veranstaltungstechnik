import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSiteContent } from './useSiteContent';
import { mount, waitFor, type MountedComponent } from '../test/reactTestUtils';

const mockGetContent = vi.hoisted(() => vi.fn());

vi.mock('../repositories/contentRepository', () => ({
  getContent: mockGetContent,
}));

interface ProbeState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function HookProbe<T>({
  keyName,
  fallback,
  normalize,
  onSnapshot,
}: {
  keyName: string;
  fallback: T;
  normalize: (value: unknown, fallbackValue: T) => T;
  onSnapshot: (state: ProbeState<T>) => void;
}) {
  const state = useSiteContent(keyName, fallback, normalize);

  useEffect(() => {
    onSnapshot(state);
  }, [state, onSnapshot]);

  return null;
}

describe('useSiteContent', () => {
  let mounted: MountedComponent | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (mounted) {
      await mounted.unmount();
      mounted = null;
    }
  });

  it('loads and normalizes remote content', async () => {
    mockGetContent.mockResolvedValue({
      headline: 'DB Hero',
    });

    let latestState: ProbeState<{ headline: string }> | null = null;

    mounted = await mount(
      <HookProbe
        keyName="home.hero"
        fallback={{ headline: 'Fallback Hero' }}
        normalize={(value, fallbackValue) => ({
          headline:
            typeof (value as { headline?: unknown })?.headline === 'string'
              ? String((value as { headline: string }).headline).toUpperCase()
              : fallbackValue.headline,
        })}
        onSnapshot={(state) => { latestState = state; }}
      />
    );

    await waitFor(() => {
      expect(latestState?.loading).toBe(false);
      expect(latestState?.error).toBeNull();
      expect(latestState?.data).toEqual({ headline: 'DB HERO' });
    });

    expect(mockGetContent).toHaveBeenCalledWith('home.hero');
  });

  it('falls back with error state when repository call fails', async () => {
    mockGetContent.mockRejectedValue(new Error('network failure'));

    let latestState: ProbeState<{ title: string }> | null = null;

    mounted = await mount(
      <HookProbe
        keyName="home.cta"
        fallback={{ title: 'Fallback CTA' }}
        normalize={(value, fallbackValue) => {
          if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            typeof (value as { title?: unknown }).title === 'string'
          ) {
            return { title: String((value as { title: string }).title) };
          }
          return fallbackValue;
        }}
        onSnapshot={(state) => { latestState = state; }}
      />
    );

    await waitFor(() => {
      expect(latestState?.loading).toBe(false);
      expect(latestState?.error).toBe('Inhalte konnten nicht geladen werden.');
      expect(latestState?.data).toEqual({ title: 'Fallback CTA' });
    });
  });
});
