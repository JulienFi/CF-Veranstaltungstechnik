import { Suspense, lazy, useEffect, useState } from 'react';
import AdminGuard from './components/AdminGuard';
import SEOHead from './components/SEOHead';
import Header from './components/Header';
import Footer from './components/Footer';
import SpotlightRig from './components/SpotlightRig';
import { SEOProvider } from './contexts/SEOContext';
import { useSEO } from './contexts/seo-state';
import { generateLocalBusinessSchema } from './lib/seo';
import { getBaseUrl } from './lib/site';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import InquiryPage from './pages/InquiryPage';
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const WorkshopPage = lazy(() => import('./pages/WorkshopPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'));
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage'));
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage'));

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

function RouterContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { resetSEO } = useSEO();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  useEffect(() => {
    resetSEO();
  }, [currentPath, resetSEO]);

  const adminPaths = ['/admin/login', '/admin', '/admin/products', '/admin/projects', '/admin/team', '/admin/inquiries'];
  const isAdminRoute = adminPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));

  if (isAdminRoute) {
    let adminContent;

    if (currentPath === '/admin/login') {
      adminContent = <LoginPage />;
    } else if (currentPath === '/admin') {
      adminContent = <AdminGuard><DashboardPage /></AdminGuard>;
    } else if (currentPath === '/admin/products') {
      adminContent = <AdminGuard><ProductsPage /></AdminGuard>;
    } else if (currentPath === '/admin/projects') {
      adminContent = <AdminGuard><AdminProjectsPage /></AdminGuard>;
    } else if (currentPath === '/admin/team') {
      adminContent = <AdminGuard><AdminTeamPage /></AdminGuard>;
    } else if (currentPath === '/admin/inquiries') {
      adminContent = <AdminGuard><AdminInquiriesPage /></AdminGuard>;
    } else {
      adminContent = <AdminGuard><DashboardPage /></AdminGuard>;
    }

    return (
      <>
        <SEOHead pageKey="admin" />
        <Suspense fallback={<RouteFallback />}>
          {adminContent}
        </Suspense>
      </>
    );
  }

  let content: JSX.Element;
  let seoPageKey = 'home';
  let schemaData: object | undefined;
  let isNotFound = false;

  if (currentPath === '/') {
    content = <HomePage />;
    seoPageKey = 'home';
    schemaData = generateLocalBusinessSchema();
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
    const slug = currentPath.replace('/mietshop/', '');
    content = <ProductDetailPage slug={slug} />;
    seoPageKey = 'mietshop';
  } else if (currentPath === '/mietshop/anfrage') {
    content = <InquiryPage />;
    seoPageKey = 'anfrage';
  } else if (currentPath === '/dienstleistungen') {
    content = <ServicesPage />;
    seoPageKey = 'dienstleistungen';
  } else if (currentPath === '/werkstatt') {
    content = <WorkshopPage />;
    seoPageKey = 'werkstatt';
  } else if (currentPath === '/projekte') {
    content = <ProjectsPage />;
    seoPageKey = 'projekte';
  } else if (currentPath === '/team') {
    content = <TeamPage />;
    seoPageKey = 'team';
  } else if (currentPath === '/kontakt') {
    content = <ContactPage />;
    seoPageKey = 'kontakt';
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
          <a href="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead pageKey={seoPageKey} schemaData={schemaData} />
      <div className="global-stage-bg" aria-hidden="true" />
      <SpotlightRig />
      <div className="app-shell">
        <a href="#main-content" className="skip-link">
          Direkt zum Inhalt springen
        </a>
        <Header />
        <main
          id="main-content"
          className="app-main"
          aria-label={isNotFound ? 'Fehlerseite' : undefined}
        >
          <Suspense fallback={<RouteFallback />}>
            {content}
          </Suspense>
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
