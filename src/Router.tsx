import { Suspense, lazy, useEffect, useState } from 'react';
import AdminGuard from './components/AdminGuard';
import Footer from './components/Footer';
import Header from './components/Header';
import SEOHead from './components/SEOHead';
import SpotlightRig from './components/SpotlightRig';
import { AuroraBackground } from './components/AuroraBackground';
import { SEOProvider } from './contexts/SEOContext';
import { useSEO } from './contexts/seo-state';
import { generateLocalBusinessSchema } from './lib/seo';
import { getBaseUrl } from './lib/site';
import HomePage from './pages/HomePage';
import InquiryPage from './pages/InquiryPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShopPage from './pages/ShopPage';
const SuccessPage = lazy(() => import('./pages/SuccessPage'));

const ImpressumPage = lazy(() => import('./pages/ImpressumPage'));
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage'));
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));

const LEGACY_ONEPAGER_ROUTE_HASH: Record<string, string> = {
  '/dienstleistungen': '#leistungen',
  '/werkstatt': '#leistungen',
  '/team': '#team',
  '/kontakt': '#kontakt',
};

function RouteFallback() {
  return (
    <div className="section-shell bg-app-bg text-white">
      <div className="content-container">
        <div className="glass-panel--soft rounded-xl px-6 py-8 text-center text-gray-300">
          Inhalte werden geladen...
        </div>
      </div>
    </div>
  );
}

function decodePathSegment(value: string): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function decodeHash(value: string): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function RouterContent() {
  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }));
  const { resetSEO } = useSEO();

  const currentPath = locationState.pathname;
  const currentHash = locationState.hash;

  useEffect(() => {
    const handleLocationChange = () => {
      setLocationState({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    resetSEO();
  }, [currentPath, resetSEO]);

  const adminPaths = ['/admin/login', '/admin', '/admin/products', '/admin/projects', '/admin/team', '/admin/inquiries', '/admin/content'];
  const isAdminRoute = adminPaths.some((path) => currentPath === path || currentPath.startsWith(path + '/'));

  const routeHash = LEGACY_ONEPAGER_ROUTE_HASH[currentPath] ?? '';
  const onePagerHash = currentPath === '/' ? currentHash : routeHash;
  const isOnePagerRoute = currentPath === '/' || Boolean(routeHash);

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }

    const scrollToAnchor = (hash: string, attempt = 0) => {
      const sectionId = decodeHash(hash).replace(/^#/, '');
      if (!sectionId) {
        return;
      }

      const target = document.getElementById(sectionId);
      if (!target) {
        if (attempt < 8) {
          window.setTimeout(() => scrollToAnchor(hash, attempt + 1), 60);
        }
        return;
      }

      const header = document.querySelector<HTMLElement>('[data-sticky-header="true"]');
      const offset = (header?.getBoundingClientRect().height ?? 0) + 12;
      const top = window.scrollY + target.getBoundingClientRect().top - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    if (isOnePagerRoute && onePagerHash) {
      window.requestAnimationFrame(() => scrollToAnchor(onePagerHash));
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentPath, currentHash, isAdminRoute, isOnePagerRoute, onePagerHash]);

  if (isAdminRoute) {
    let adminContent;

    if (currentPath === '/admin/login') {
      adminContent = <LoginPage />;
    } else if (currentPath === '/admin') {
      adminContent = (
        <AdminGuard>
          <DashboardPage />
        </AdminGuard>
      );
    } else if (currentPath === '/admin/products') {
      adminContent = (
        <AdminGuard>
          <ProductsPage />
        </AdminGuard>
      );
    } else if (currentPath === '/admin/projects') {
      adminContent = (
        <AdminGuard>
          <AdminProjectsPage />
        </AdminGuard>
      );
    } else if (currentPath === '/admin/team') {
      adminContent = (
        <AdminGuard>
          <AdminTeamPage />
        </AdminGuard>
      );
    } else if (currentPath === '/admin/inquiries') {
      adminContent = (
        <AdminGuard>
          <AdminInquiriesPage />
        </AdminGuard>
      );
    } else if (currentPath === '/admin/content') {
      adminContent = (
        <AdminGuard>
          <AdminContentPage />
        </AdminGuard>
      );
    } else {
      adminContent = (
        <AdminGuard>
          <DashboardPage />
        </AdminGuard>
      );
    }

    return (
      <>
        <SEOHead pageKey="admin" />
        <Suspense fallback={<RouteFallback />}>{adminContent}</Suspense>
      </>
    );
  }

  let content: JSX.Element;
  let seoPageKey = 'home';
  let schemaData: object | undefined;
  let isNotFound = false;

  if (currentPath === '/' || routeHash) {
    content = <HomePage />;
    seoPageKey = currentPath === '/' ? 'home' : currentPath.slice(1);
    if (currentPath === '/') {
      schemaData = generateLocalBusinessSchema();
    }
  } else if (currentPath === '/mietshop') {
    content = <ShopPage />;
    seoPageKey = 'mietshop';
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Mietshop für Veranstaltungstechnik',
        url: `${getBaseUrl()}/mietshop`,
      };
  } else if (currentPath.startsWith('/mietshop/') && currentPath !== '/mietshop/anfrage') {
    const rawSlug = currentPath.slice('/mietshop/'.length).replace(/\/+$/, '');

    if (!rawSlug) {
      content = <ShopPage />;
      seoPageKey = 'mietshop';
    } else {
      const slug = decodePathSegment(rawSlug);
      content = <ProductDetailPage slug={slug} />;
      seoPageKey = 'mietshop';
    }
  } else if (currentPath === '/mietshop/anfrage') {
    content = <InquiryPage />;
    seoPageKey = 'anfrage';
  } else if (currentPath === '/danke') {
    content = <SuccessPage />;
    seoPageKey = 'anfrage';
  } else if (currentPath === '/projekte') {
    content = <ProjectsPage />;
    seoPageKey = 'projekte';
  } else if (currentPath.startsWith('/projekte/')) {
    const rawSlug = currentPath.slice('/projekte/'.length).replace(/\/+$/, '');
    if (!rawSlug) {
      content = <ProjectsPage />;
      seoPageKey = 'projekte';
    } else {
      const slug = decodePathSegment(rawSlug);
      content = <ProjectDetailPage slug={slug} />;
      seoPageKey = 'projekte';
    }
  } else if (currentPath === '/impressum') {
    content = <ImpressumPage />;
    seoPageKey = 'impressum';
  } else if (currentPath === '/datenschutz') {
    content = <DatenschutzPage />;
    seoPageKey = 'datenschutz';
  } else {
    seoPageKey = 'notfound';
    isNotFound = true;
    content = (
      <div className="bg-app-bg text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-400 mb-8">Seite nicht gefunden</p>
          <a href="/" className="btn-secondary focus-ring tap-target interactive inline-flex">
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead pageKey={seoPageKey} schemaData={schemaData} />
      <AuroraBackground />
      <div className="global-stage-bg" aria-hidden="true" />
      <SpotlightRig />
      <div className="app-shell">
        <a href="#main-content" className="skip-link">
          Direkt zum Inhalt springen
        </a>
        <Header />
        <main id="main-content" className="app-main" aria-label={isNotFound ? 'Fehlerseite' : undefined}>
          <Suspense fallback={<RouteFallback />}>{content}</Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default function Router() {
  return (
    <SEOProvider>
      <RouterContent />
    </SEOProvider>
  );
}
