import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { useInquiryList } from './useInquiryList';
import { mount, waitFor, type MountedComponent } from '../test/reactTestUtils';

type InquiryListState = ReturnType<typeof useInquiryList>;

function HookProbe({ onSnapshot }: { onSnapshot: (state: InquiryListState) => void }) {
  const hookState = useInquiryList();

  useEffect(() => {
    onSnapshot(hookState);
  }, [hookState, onSnapshot]);

  return null;
}

describe('useInquiryList', () => {
  let mounted: MountedComponent | null = null;
  let latestState: InquiryListState | null = null;

  beforeEach(() => {
    latestState = null;
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (mounted) {
      await mounted.unmount();
      mounted = null;
    }
    localStorage.clear();
  });

  it('normalizes and dedupes stored inquiry items on mount', async () => {
    localStorage.setItem('inquiryList', JSON.stringify([' item-a ', 'item-a', '', ' item-b ']));

    mounted = await mount(<HookProbe onSnapshot={(state) => { latestState = state; }} />);

    await waitFor(() => {
      expect(latestState?.inquiryList).toEqual(['item-a', 'item-b']);
    });

    expect(localStorage.getItem('inquiryList')).toBe(JSON.stringify(['item-a', 'item-b']));
  });

  it('prevents duplicates when slug matches an existing entry', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    mounted = await mount(<HookProbe onSnapshot={(state) => { latestState = state; }} />);

    await waitFor(() => {
      expect(latestState).not.toBeNull();
    });

    await act(async () => {
      latestState?.addToInquiry(' product-1 ', 'slug-1');
    });

    await act(async () => {
      latestState?.addToInquiry('product-2', 'product-1');
    });

    expect(latestState?.inquiryList).toEqual(['product-1']);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('removes entries by id or slug and updates inclusion checks', async () => {
    mounted = await mount(<HookProbe onSnapshot={(state) => { latestState = state; }} />);

    await waitFor(() => {
      expect(latestState).not.toBeNull();
    });

    await act(async () => {
      latestState?.addToInquiry('id-1', 'slug-1');
    });

    await waitFor(() => {
      expect(latestState?.inquiryList).toEqual(['id-1']);
    });

    await act(async () => {
      latestState?.addToInquiry('id-2', 'slug-2');
    });

    await waitFor(() => {
      expect(latestState?.inquiryList).toEqual(['id-1', 'id-2']);
    });

    expect(latestState?.isInInquiry('id-2', 'slug-2')).toBe(true);

    await act(async () => {
      latestState?.removeFromInquiry('unused-id', 'id-2');
    });

    expect(latestState?.inquiryList).toEqual(['id-1']);
    expect(latestState?.isInInquiry('id-2', 'slug-2')).toBe(false);
  });
});
