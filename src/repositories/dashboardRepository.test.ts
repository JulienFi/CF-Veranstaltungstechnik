import { beforeEach, describe, expect, it, vi } from 'vitest';

type CounterResult = {
  count: number | null;
  error: unknown;
};

function createSupabaseMock(
  values: {
    products: CounterResult;
    projects: CounterResult;
    team_members: CounterResult;
    inquiries: CounterResult;
  }
) {
  const selectProducts = vi.fn().mockResolvedValue(values.products);
  const selectProjects = vi.fn().mockResolvedValue(values.projects);
  const selectTeam = vi.fn().mockResolvedValue(values.team_members);
  const eqInquiries = vi.fn().mockResolvedValue(values.inquiries);
  const selectInquiries = vi.fn(() => ({ eq: eqInquiries }));

  const from = vi.fn((table: string) => {
    if (table === 'products') return { select: selectProducts };
    if (table === 'projects') return { select: selectProjects };
    if (table === 'team_members') return { select: selectTeam };
    if (table === 'inquiries') return { select: selectInquiries };
    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    supabase: { from },
    eqInquiries,
  };
}

describe('dashboardRepository.loadDashboardStats', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns mapped counts', async () => {
    const { supabase, eqInquiries } = createSupabaseMock({
      products: { count: 5, error: null },
      projects: { count: 3, error: null },
      team_members: { count: 4, error: null },
      inquiries: { count: 2, error: null },
    });

    vi.doMock('../lib/supabase', () => ({ supabase }));
    const { loadDashboardStats } = await import('./dashboardRepository');

    await expect(loadDashboardStats()).resolves.toEqual({
      products: 5,
      projects: 3,
      team: 4,
      inquiries: 2,
    });
    expect(eqInquiries).toHaveBeenCalledWith('status', 'new');
  });

  it('throws when any source query fails', async () => {
    const { supabase } = createSupabaseMock({
      products: { count: null, error: { code: '42501', message: 'denied' } },
      projects: { count: 3, error: null },
      team_members: { count: 4, error: null },
      inquiries: { count: 2, error: null },
    });

    vi.doMock('../lib/supabase', () => ({ supabase }));
    const { loadDashboardStats } = await import('./dashboardRepository');

    await expect(loadDashboardStats()).rejects.toMatchObject({
      code: '42501',
    });
  });
});
