import { useEffect, useState } from 'react';
import AdminGuard from './components/AdminGuard';
import SEOHead from './components/SEOHead';
import Header from './components/Header';
import Footer from './components/Footer';
import { SEOProvider } from './contexts/SEOContext';
import { useSEO } from './contexts/seo-state';
import { generateLocalBusinessSchema } from './lib/seo';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import InquiryPage from './pages/InquiryPage';
import ServicesPage from './pages/ServicesPage';
import WorkshopPage from './pages/WorkshopPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import ImpressumPage from './pages/ImpressumPage';
import DatenschutzPage from './pages/DatenschutzPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminTeamPage from './pages/admin/AdminTeamPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';

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
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
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
    if (currentPath === '/admin/login') {
      return <LoginPage />;
    }

    if (currentPath === '/admin') {
      return <AdminGuard><DashboardPage /></AdminGuard>;
    }
    if (currentPath === '/admin/products') {
      return <AdminGuard><ProductsPage /></AdminGuard>;
    }
    if (currentPath === '/admin/projects') {
      return <AdminGuard><AdminProjectsPage /></AdminGuard>;
    }
    if (currentPath === '/admin/team') {
      return <AdminGuard><AdminTeamPage /></AdminGuard>;
    }
    if (currentPath === '/admin/inquiries') {
      return <AdminGuard><AdminInquiriesPage /></AdminGuard>;
    }

    return <AdminGuard><DashboardPage /></AdminGuard>;
  }

  let content;
  let seoPageKey = 'home';
  let schemaData: object | undefined;

  if (currentPath === '/') {
    content = <HomePage />;
    seoPageKey = 'home';
    schemaData = generateLocalBusinessSchema();
  } else if (currentPath === '/mietshop') {
    content = <ShopPage />;
    seoPageKey = 'mietshop';
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
      <div className="min-h-screen bg-app-bg flex flex-col">
        <Header />
        <main className="flex-grow pt-20">
          {content}
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
