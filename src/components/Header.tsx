import { useState, useEffect } from 'react';
import { Menu, X, Phone, ShoppingBag } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('inquiryList');
      if (saved) {
        const list = JSON.parse(saved);
        setInquiryCount(list.length);
      } else {
        setInquiryCount(0);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('inquiry-updated', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('inquiry-updated', updateCount);
    };
  }, []);

  useEffect(() => {
    const closeMenu = () => setMobileMenuOpen(false);
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('popstate', closeMenu);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('popstate', closeMenu);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.removeProperty('overflow');
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Mietshop', href: '/mietshop' },
    { name: 'Dienstleistungen', href: '/dienstleistungen' },
    { name: 'Werkstatt', href: '/werkstatt' },
    { name: 'Projekte', href: '/projekte' },
    { name: 'Team', href: '/team' },
    { name: 'Kontakt', href: '/kontakt' },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-card bg-card-bg/95 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center space-x-3 group">
            <img
              src="/images/logo-cf.png"
              alt="CF Veranstaltungstechnik Logo"
              className="h-10 sm:h-12 lg:h-14 w-auto transition-transform group-hover:scale-105"
            />
          </a>

          <nav className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-gray-300 hover:text-primary-400 hover:bg-card-hover rounded-lg transition-all font-medium"
              >
                {item.name}
              </a>
            ))}
            {inquiryCount > 0 && (
              <a
                href="/mietshop/anfrage"
                className="relative px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-card-hover rounded-lg transition-all font-medium flex items-center gap-2 group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {inquiryCount}
                </span>
              </a>
            )}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <a href={COMPANY_INFO.contact.phoneLink} className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">{COMPANY_INFO.contact.phone}</span>
            </a>
            <a
              href="/kontakt"
              className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105"
            >
              Unverbindliches Angebot
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-20 z-40 bg-black/45 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Menü schließen"
          />
          <div
            id="mobile-navigation"
            className="lg:hidden fixed inset-x-0 top-20 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-card bg-card-bg/98 backdrop-blur-md"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-gray-300 hover:text-primary-400 hover:bg-card-hover rounded-lg transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            {inquiryCount > 0 && (
              <a
                href="/mietshop/anfrage"
                className="flex items-center justify-between px-4 py-3 text-blue-400 hover:text-blue-300 hover:bg-card-hover rounded-lg transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Anfrageliste
                </span>
                <span className="bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {inquiryCount}
                </span>
              </a>
            )}
            <div className="pt-4 space-y-3 border-t border-card mt-4">
              <a
                href={COMPANY_INFO.contact.phoneLink}
                className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-primary-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="w-4 h-4" />
                <span className="font-medium">{COMPANY_INFO.contact.phone}</span>
              </a>
              <a
                href="/kontakt"
                className="block px-4 py-3 bg-primary-500 text-white text-center rounded-lg hover:bg-primary-600 transition-all font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Unverbindliches Angebot
              </a>
            </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
