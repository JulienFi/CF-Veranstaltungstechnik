import { LifeBuoy, Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';
import { Container } from './ui';
import styles from './Footer.module.css';

export default function Footer() {
  const localSeoRegion =
    COMPANY_INFO.seo.localSeoRegion.trim() || COMPANY_INFO.seo.localSeoPlaceholder.trim();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner} size="wide">
        <div className={styles.top}>
          <img src="/images/logo-cf.png" alt="CF Veranstaltungstechnik Logo" className={styles.logo} />
          <p className={styles.lead}>
            Mietshop und Full-Service für Veranstaltungen: Planung, Aufbau, Betrieb und Abbau aus einer Hand.
          </p>
          <p className={styles.localSeo}>
            Ihr Partner für professionelle Veranstaltungstechnik in {localSeoRegion}.
          </p>
          <div className={styles.supportBadge}>
            <LifeBuoy size={14} />
            <span>24/7 Notfall-Support</span>
          </div>
        </div>

        <div className={styles.grid}>
          <section>
            <h3 className={styles.title}>Kontakt</h3>
            <ul className={styles.list}>
              <li>
                <a href={COMPANY_INFO.contact.phoneLink} className={styles.contactLink}>
                  <Phone size={15} />
                  <span>{COMPANY_INFO.contact.phone}</span>
                </a>
              </li>
              <li>
                <a href={COMPANY_INFO.contact.emailLink} className={styles.contactLink}>
                  <Mail size={15} />
                  <span>{COMPANY_INFO.contact.email}</span>
                </a>
              </li>
              <li className={styles.contactLink}>
                <MapPin size={15} />
                <span>{COMPANY_INFO.address.full}</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className={styles.title}>Leistungen</h3>
            <ul className={styles.list}>
              <li><a href="/#leistungen">Leistungen</a></li>
              <li><a href="/#mietshop">Mietshop im Überblick</a></li>
              <li><a href="/mietshop">Mietshop entdecken</a></li>
              <li><a href="/#projekte">Referenzen</a></li>
            </ul>
          </section>

          <section>
            <h3 className={styles.title}>Unternehmen</h3>
            <ul className={styles.list}>
              <li><a href="/#team">Team</a></li>
              <li><a href="/#faq">FAQ</a></li>
              <li><a href="/#kontakt">Kontakt</a></li>
              <li><a href="/impressum">Impressum</a></li>
              <li><a href="/datenschutz">Datenschutz</a></li>
            </ul>
          </section>

          <section>
            <h3 className={styles.title}>Erreichbarkeit</h3>
            <div className={styles.hours}>
              <div>{COMPANY_INFO.businessHours.weekdays}</div>
              <div>{COMPANY_INFO.businessHours.weekend}</div>
              <p className={styles.hoursNote}>{COMPANY_INFO.businessHours.note}</p>
            </div>
          </section>
        </div>

        <div className={styles.legal}>
          (c) {new Date().getFullYear()} {COMPANY_INFO.legalName}. Alle Rechte vorbehalten.
        </div>
      </Container>
    </footer>
  );
}
