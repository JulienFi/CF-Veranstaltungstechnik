import { useEffect, useState } from 'react';
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
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
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className={styles.navLink}>
              {item.name}
            </a>
          ))}
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
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className={styles.mobileButton}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      {mobileMenuOpen ? (
        <>
          <button type="button" className={styles.overlay} onClick={() => setMobileMenuOpen(false)} aria-label="Menue schliessen" />
          <div id="mobile-navigation" className={styles.drawer}>
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className={styles.drawerLink} onClick={() => setMobileMenuOpen(false)}>
                {item.name}
              </a>
            ))}

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
