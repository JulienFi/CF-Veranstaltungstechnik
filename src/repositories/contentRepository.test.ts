import { beforeEach, describe, expect, it, vi } from 'vitest';

type SupabaseResponse = {
  data: { data: unknown } | null;
  error: unknown;
};

async function setupRepository(response: SupabaseResponse) {
  vi.resetModules();

  const maybeSingle = vi.fn().mockResolvedValue(response);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ select, upsert }));

  vi.doMock('../lib/supabase', () => ({
    supabase: {
      from,
    },
  }));

  const repository = await import('./contentRepository');

  return {
    repository,
    from,
    maybeSingle,
    upsert,
  };
}

describe('contentRepository.getContent', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.resetModules();
  });

  it('returns null and caches unavailable state when site_content relation is missing', async () => {
    const { repository, from } = await setupRepository({
      data: null,
      error: {
        code: 'PGRST205',
        message: "Could not find the table 'public.site_content' in the schema cache",
      },
    });

    const first = await repository.getContent<Record<string, unknown>>('home.hero');
    const second = await repository.getContent<Record<string, unknown>>('home.hero');

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(sessionStorage.getItem('cf:site_content_unavailable')).toBe('1');
    expect(from).toHaveBeenCalledTimes(1);
  });

  it('throws non-fallback errors', async () => {
    const { repository } = await setupRepository({
      data: null,
      error: {
        code: '42501',
        message: 'permission denied',
      },
    });

    await expect(repository.getContent<Record<string, unknown>>('home.hero')).rejects.toMatchObject({
      code: '42501',
    });
  });

  it('returns object payload when data is valid', async () => {
    const { repository, from } = await setupRepository({
      data: { data: { headline: 'Hero' } },
      error: null,
    });

    const result = await repository.getContent<{ headline: string }>('home.hero');

    expect(result).toEqual({ headline: 'Hero' });
    expect(from).toHaveBeenCalledTimes(1);
  });

  it('returns null when returned data field is not an object', async () => {
    const { repository } = await setupRepository({
      data: { data: ['unexpected', 'array'] },
      error: null,
    });

    const result = await repository.getContent<Record<string, unknown>>('home.hero');
    expect(result).toBeNull();
  });
});
