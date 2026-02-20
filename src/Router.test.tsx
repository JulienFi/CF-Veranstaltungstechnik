import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushMicrotasks, waitFor, type MountedComponent } from './test/reactTestUtils';
import Router from './Router';

const mockResetSEO = vi.hoisted(() => vi.fn());

vi.mock('./contexts/seo-state', () => ({
  useSEO: () => ({
    resetSEO: mockResetSEO,
  }),
}));

vi.mock('./contexts/SEOContext', () => ({
  SEOProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('./lib/seo', () => ({
  generateLocalBusinessSchema: () => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
  }),
}));

vi.mock('./lib/site', () => ({
  getBaseUrl: () => 'https://example.com',
}));

vi.mock('./components/AdminGuard', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('./components/Header', () => ({
  default: () => <header data-sticky-header="true">header</header>,
}));

vi.mock('./components/Footer', () => ({
  default: () => <footer>footer</footer>,
}));

vi.mock('./components/SEOHead', () => ({
  default: () => null,
}));

vi.mock('./components/SpotlightRig', () => ({
  default: () => <div data-testid="spotlight-rig" />,
}));

vi.mock('./components/AuroraBackground', () => ({
  AuroraBackground: () => <div data-testid="aurora-bg" />,
}));

vi.mock('./pages/HomePage', () => ({
  default: () => (
    <div data-testid="home-page">
      <section id="leistungen">Leistungen</section>
      <section id="team">Team</section>
      <section id="kontakt">Kontakt</section>
    </div>
  ),
}));

vi.mock('./pages/ShopPage', () => ({
  default: () => <div data-testid="shop-page">shop</div>,
}));

vi.mock('./pages/InquiryPage', () => ({
  default: () => <div data-testid="inquiry-page">inquiry</div>,
}));

vi.mock('./pages/ProjectsPage', () => ({
  default: () => <div data-testid="projects-page">projects</div>,
}));

vi.mock('./pages/ProjectDetailPage', () => ({
  default: ({ slug }: { slug: string }) => <div data-testid="project-detail-page">{slug}</div>,
}));

vi.mock('./pages/ProductDetailPage', () => ({
  default: ({ slug }: { slug: string }) => <div data-testid="product-detail-page">{slug}</div>,
}));

vi.mock('./pages/ImpressumPage', () => ({
  default: () => <div data-testid="impressum-page">impressum</div>,
}));

vi.mock('./pages/DatenschutzPage', () => ({
  default: () => <div data-testid="datenschutz-page">datenschutz</div>,
}));

vi.mock('./pages/admin/LoginPage', () => ({
  default: () => <div data-testid="admin-login-page">admin-login</div>,
}));

vi.mock('./pages/admin/DashboardPage', () => ({
  default: () => <div data-testid="admin-dashboard-page">admin-dashboard</div>,
}));

vi.mock('./pages/admin/ProductsPage', () => ({
  default: () => <div data-testid="admin-products-page">admin-products</div>,
}));

vi.mock('./pages/admin/AdminProjectsPage', () => ({
  default: () => <div data-testid="admin-projects-page">admin-projects</div>,
}));

vi.mock('./pages/admin/AdminTeamPage', () => ({
  default: () => <div data-testid="admin-team-page">admin-team</div>,
}));

vi.mock('./pages/admin/AdminInquiriesPage', () => ({
  default: () => <div data-testid="admin-inquiries-page">admin-inquiries</div>,
}));

vi.mock('./pages/admin/AdminContentPage', () => ({
  default: () => <div data-testid="admin-content-page">admin-content</div>,
}));

function createRect(top: number, height: number): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    left: 0,
    width: 100,
    height,
    right: 100,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('Router hash navigation', () => {
  let mounted: MountedComponent | null = null;
  let rafQueue: FrameRequestCallback[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    rafQueue = [];
    window.history.replaceState({}, '', '/');
    document.body.innerHTML = '';

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
      rafQueue.push(callback);
      return rafQueue.length;
    });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(async () => {
    if (mounted) {
      await mounted.unmount();
      mounted = null;
    }
  });

  it('scrolls to hash target on root path with sticky-header offset', async () => {
    window.history.replaceState({}, '', '/#leistungen');

    mounted = await mount(<Router />);

    const header = document.querySelector('[data-sticky-header="true"]') as HTMLElement | null;
    const target = document.getElementById('leistungen');

    expect(header).not.toBeNull();
    expect(target).not.toBeNull();

    vi.spyOn(header as HTMLElement, 'getBoundingClientRect').mockReturnValue(createRect(0, 80));
    vi.spyOn(target as HTMLElement, 'getBoundingClientRect').mockReturnValue(createRect(320, 40));

    rafQueue.forEach((callback) => callback(0));
    await flushMicrotasks();

    await waitFor(() => {
      const scrollSpy = vi.mocked(window.scrollTo);
      const calls = scrollSpy.mock.calls;
      const lastCall = (calls[calls.length - 1]?.[0] ?? undefined) as ScrollToOptions | undefined;
      expect(lastCall).toMatchObject({
        top: 228,
        behavior: 'smooth',
      });
    });
  });

  it('maps legacy /team route to onepager hash and scrolls to section', async () => {
    window.history.replaceState({}, '', '/team');

    mounted = await mount(<Router />);

    const header = document.querySelector('[data-sticky-header="true"]') as HTMLElement | null;
    const target = document.getElementById('team');

    expect(document.querySelector('[data-testid="home-page"]')).not.toBeNull();
    expect(header).not.toBeNull();
    expect(target).not.toBeNull();

    vi.spyOn(header as HTMLElement, 'getBoundingClientRect').mockReturnValue(createRect(0, 72));
    vi.spyOn(target as HTMLElement, 'getBoundingClientRect').mockReturnValue(createRect(500, 60));

    rafQueue.forEach((callback) => callback(0));
    await flushMicrotasks();

    await waitFor(() => {
      const scrollSpy = vi.mocked(window.scrollTo);
      const calls = scrollSpy.mock.calls;
      const lastCall = (calls[calls.length - 1]?.[0] ?? undefined) as ScrollToOptions | undefined;
      expect(lastCall).toMatchObject({
        top: 416,
        behavior: 'smooth',
      });
    });
  });

  it('resets scroll to top for non-onepager routes', async () => {
    window.history.replaceState({}, '', '/mietshop');

    mounted = await mount(<Router />);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="shop-page"]')).not.toBeNull();
      expect(vi.mocked(window.scrollTo)).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    });
  });
});
