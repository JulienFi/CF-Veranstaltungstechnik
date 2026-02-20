import { describe, expect, it, vi } from 'vitest';
import { listCategoriesForShop } from './categoryRepository';

describe('categoryRepository.listCategoriesForShop', () => {
  it('orders categories by display_order', async () => {
    const order = vi.fn();
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as Parameters<typeof listCategoriesForShop>[0];

    await listCategoriesForShop(client);

    expect(from).toHaveBeenCalledWith('categories');
    expect(select).toHaveBeenCalledWith('id,name,slug,description,display_order,created_at');
    expect(order).toHaveBeenCalledWith('display_order');
  });
});
