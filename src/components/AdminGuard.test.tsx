import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminGuard from './AdminGuard';
import { mount, waitFor, type MountedComponent } from '../test/reactTestUtils';

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock('../contexts/useAuth', () => ({
  useAuth: mockUseAuth,
}));

describe('AdminGuard', () => {
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

  it('renders loading state while auth is pending', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAdmin: false,
    });

    mounted = await mount(
      <AdminGuard>
        <div data-testid="private-content">admin</div>
      </AdminGuard>
    );

    expect(mounted.container.textContent).toContain('Authentifizierung');
    expect(mounted.container.querySelector('[data-testid="private-content"]')).toBeNull();
  });

  it('renders children for authenticated admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1' },
      loading: false,
      isAdmin: true,
    });

    mounted = await mount(
      <AdminGuard>
        <div data-testid="private-content">admin</div>
      </AdminGuard>
    );

    expect(mounted.container.querySelector('[data-testid="private-content"]')?.textContent).toBe('admin');
  });

  it('blocks content and warns on unauthorized access', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAdmin: false,
    });

    mounted = await mount(
      <AdminGuard>
        <div data-testid="private-content">admin</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith('Unauthorized access to admin area - redirecting to login');
    });

    expect(mounted.container.querySelector('[data-testid="private-content"]')).toBeNull();
  });
});
