import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('adminCatalogRepository', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('lists products with categories ordered by created_at desc', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 'p1', name: 'Produkt', categories: { name: 'Licht' } }],
      error: null,
    });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));

    vi.doMock('../lib/supabase', () => ({
      supabase: { from, storage: { from: vi.fn() } },
    }));

    const { listAdminProductsWithCategory } = await import('./adminCatalogRepository');
    const result = await listAdminProductsWithCategory();

    expect(from).toHaveBeenCalledWith('products');
    expect(select).toHaveBeenCalledWith('*, categories(name)');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(1);
  });

  it('updates active state via dedicated toggle helper', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));

    vi.doMock('../lib/supabase', () => ({
      supabase: { from, storage: { from: vi.fn() } },
    }));

    const { toggleAdminProductActive } = await import('./adminCatalogRepository');
    await toggleAdminProductActive('prod-1', false);

    expect(from).toHaveBeenCalledWith('products');
    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith('id', 'prod-1');
  });

  it('uploads product image and returns public url', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.png' } }));
    const storageFrom = vi.fn(() => ({ upload, getPublicUrl }));

    vi.doMock('../lib/supabase', () => ({
      supabase: { from: vi.fn(), storage: { from: storageFrom } },
    }));

    const { uploadAdminProductImage } = await import('./adminCatalogRepository');
    const file = new File(['img'], 'test.png', { type: 'image/png' });
    const url = await uploadAdminProductImage(file);

    expect(storageFrom).toHaveBeenCalledWith('product-images');
    expect(upload).toHaveBeenCalledTimes(1);
    expect(url).toBe('https://example.com/image.png');
  });

  it('throws when upload fails', async () => {
    const upload = vi.fn().mockResolvedValue({ error: { message: 'upload failed' } });
    const getPublicUrl = vi.fn();
    const storageFrom = vi.fn(() => ({ upload, getPublicUrl }));

    vi.doMock('../lib/supabase', () => ({
      supabase: { from: vi.fn(), storage: { from: storageFrom } },
    }));

    const { uploadAdminProductImage } = await import('./adminCatalogRepository');
    const file = new File(['img'], 'test.png', { type: 'image/png' });

    await expect(uploadAdminProductImage(file)).rejects.toThrow('Fehler beim Hochladen des Bildes');
  });
});
