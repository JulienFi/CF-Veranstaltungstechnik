import { useEffect, useRef, useState } from 'react';
import { Menu, Phone, ShoppingBag, X } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';
import { Button, Container } from './ui';
import styles from './Header.module.css';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Mietshop', href: '/mietshop' },
  { name: 'Dienstleistungen', href: '/dienstleistungen' },
  { name: 'Werkstatt', href: '/werkstatt' },
  { name: 'Projekte', href: '/projekte' },
  { name: 'Team', href: '/team' },
  { name: 'Kontakt', href: '/kontakt' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const isActivePath = (href: string): boolean => {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('inquiryList');
      if (saved) {
        setInquiryCount(JSON.parse(saved).length);
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
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
      setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const menuButtonElement = mobileButtonRef.current;
    lastFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : menuButtonElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusableElements = (): HTMLElement[] => {
      const container = drawerRef.current;
      if (!container) return [];

      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    const focusFirstElement = () => {
      const focusable = getFocusableElements();
      (focusable[0] ?? menuButtonElement)?.focus();
    };

    const focusTimer = window.setTimeout(focusFirstElement, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !drawerRef.current?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !drawerRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      (lastFocusedElementRef.current ?? menuButtonElement)?.focus();
    };
  }, [mobileMenuOpen]);

  return (
    <header className={styles.header}>
      <Container className={styles.inner} size="wide">
        <a href="/" className={styles.brand}>
          <img src="/images/logo-cf.png" alt="CF Veranstaltungstechnik Logo" className={styles.logo} />
          <span className="sr-only">CF Veranstaltungstechnik Startseite</span>
        </a>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {navigation.map((item) => {
            const isActive = isActivePath(item.href);
            return (
              <a
                key={item.name}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <a href={COMPANY_INFO.contact.phoneLink} className={styles.phoneLink}>
            <Phone size={16} />
            <span>{COMPANY_INFO.contact.phone}</span>
          </a>
          {inquiryCount > 0 ? (
            <Button href="/mietshop/anfrage" variant="secondary" size="sm">
              <ShoppingBag size={16} />
              <span>Anfrageliste</span>
              <span className={styles.countBadge}>{inquiryCount}</span>
            </Button>
          ) : null}
          <Button href="/kontakt" variant="primary" size="sm">
            Unverbindliches Angebot
          </Button>
        </div>

        <button
          ref={mobileButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className={styles.mobileButton}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      {mobileMenuOpen ? (
        <>
          <button type="button" className={styles.overlay} onClick={() => setMobileMenuOpen(false)} aria-label="Menü schließen" />
          <div id="mobile-navigation" ref={drawerRef} className={styles.drawer}>
            {navigation.map((item) => {
              const isActive = isActivePath(item.href);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              );
            })}

            {inquiryCount > 0 ? (
              <Button href="/mietshop/anfrage" variant="secondary" size="md" fullWidth onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  Anfrageliste
                </span>
                <span className={styles.countBadge}>{inquiryCount}</span>
              </Button>
            ) : null}

            <div className={styles.drawerActions}>
              <Button href={COMPANY_INFO.contact.phoneLink} variant="secondary" size="md" fullWidth onClick={() => setMobileMenuOpen(false)}>
                <Phone size={16} />
                <span>{COMPANY_INFO.contact.phone}</span>
              </Button>
              <Button href="/kontakt" variant="primary" size="md" fullWidth onClick={() => setMobileMenuOpen(false)}>
                Unverbindliches Angebot
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
