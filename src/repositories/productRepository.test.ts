import { describe, expect, it, vi } from 'vitest';
import {
  getActiveProductLookupByReference,
  listActiveProductLookupsByIds,
} from './productRepository';

function createLookupClient() {
  const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const eqLookup = vi.fn(() => ({ maybeSingle }));
  const limit = vi.fn(() => ({ eq: eqLookup }));
  const eqIsActive = vi.fn(() => ({ limit }));
  const select = vi.fn(() => ({ eq: eqIsActive }));
  const from = vi.fn(() => ({ select }));

  return {
    client: { from } as unknown as Parameters<typeof getActiveProductLookupByReference>[0],
    from,
    select,
    eqIsActive,
    limit,
    eqLookup,
    maybeSingle,
  };
}

describe('productRepository.getActiveProductLookupByReference', () => {
  it('queries by id for UUID input', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const { client, eqLookup, eqIsActive } = createLookupClient();

    await getActiveProductLookupByReference(client, uuid);

    expect(eqIsActive).toHaveBeenCalledWith('is_active', true);
    expect(eqLookup).toHaveBeenCalledWith('id', uuid);
  });

  it('queries by slug for non-UUID input', async () => {
    const { client, eqLookup } = createLookupClient();

    await getActiveProductLookupByReference(client, 'movinghead-pro');

    expect(eqLookup).toHaveBeenCalledWith('slug', 'movinghead-pro');
  });
});

describe('productRepository.listActiveProductLookupsByIds', () => {
  it('applies id filter and active filter', async () => {
    const eqIsActive = vi.fn();
    const inIds = vi.fn(() => ({ eq: eqIsActive }));
    const select = vi.fn(() => ({ in: inIds }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as Parameters<typeof listActiveProductLookupsByIds>[0];

    await listActiveProductLookupsByIds(client, ['a', 'b']);

    expect(from).toHaveBeenCalledWith('products');
    expect(inIds).toHaveBeenCalledWith('id', ['a', 'b']);
    expect(eqIsActive).toHaveBeenCalledWith('is_active', true);
  });
});
