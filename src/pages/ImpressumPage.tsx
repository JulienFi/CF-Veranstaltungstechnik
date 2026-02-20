import { COMPANY_INFO } from '../config/company';
import { LEGAL_INFO, hasLegalValue } from '../config/legal';

export default function ImpressumPage() {
  const registerSectionVisible =
    hasLegalValue(LEGAL_INFO.registerCourt) || hasLegalValue(LEGAL_INFO.registerNumber);

  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell">
        <div className="content-container content-container--narrow">
          <div className="mx-auto max-w-4xl">
            <h1 className="section-title mb-8">Impressum</h1>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Angaben gemäß Paragraf 5 TMG</h2>
                <div className="muted-readable space-y-1">
                  <p className="font-semibold text-white">
                    {COMPANY_INFO.legalName}
                    {hasLegalValue(LEGAL_INFO.legalForm) ? ` (${LEGAL_INFO.legalForm})` : ''}
                  </p>
                  <p>{COMPANY_INFO.address.street}</p>
                  <p>
                    {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}
                  </p>
                  <p>{COMPANY_INFO.address.country}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
                <div className="muted-readable space-y-1">
                  <p>
                    Telefon:{' '}
                    <a
                      href={COMPANY_INFO.contact.phoneLink}
                      className="interactive-link text-blue-300 hover:text-blue-200"
                    >
                      {COMPANY_INFO.contact.phone}
                    </a>
                  </p>
                  <p>
                    E-Mail:{' '}
                    <a
                      href={COMPANY_INFO.contact.emailLink}
                      className="interactive-link text-blue-300 hover:text-blue-200"
                    >
                      {COMPANY_INFO.contact.email}
                    </a>
                  </p>
                </div>
              </div>

              {hasLegalValue(LEGAL_INFO.ownerName) && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Vertretungsberechtigte Person</h2>
                  <div className="muted-readable">
                    <p>{LEGAL_INFO.ownerName}</p>
                  </div>
                </div>
              )}

              {hasLegalValue(LEGAL_INFO.vatId) && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Umsatzsteuer-ID</h2>
                  <div className="muted-readable">
                    <p>{LEGAL_INFO.vatId}</p>
                  </div>
                </div>
              )}

              {registerSectionVisible && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Registereintrag</h2>
                  <div className="muted-readable space-y-1">
                    {hasLegalValue(LEGAL_INFO.registerCourt) && (
                      <p>Registergericht: {LEGAL_INFO.registerCourt}</p>
                    )}
                    {hasLegalValue(LEGAL_INFO.registerNumber) && (
                      <p>Registernummer: {LEGAL_INFO.registerNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {hasLegalValue(LEGAL_INFO.responsibleEditor) && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Inhaltlich verantwortlich</h2>
                  <div className="muted-readable">
                    <p>{LEGAL_INFO.responsibleEditor}</p>
                  </div>
                </div>
              )}

              {hasLegalValue(LEGAL_INFO.hostingProvider) && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Hosting</h2>
                  <div className="muted-readable">
                    <p>{LEGAL_INFO.hostingProvider}</p>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold mb-4">EU-Streitschlichtung</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
                    bereit:
                  </p>
                  <p>
                    <a
                      href="https://ec.europa.eu/consumers/odr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="interactive-link text-blue-300 hover:text-blue-200"
                    >
                      https://ec.europa.eu/consumers/odr/
                    </a>
                  </p>
                  <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Verbraucherstreitbeilegung</h2>
                <div className="muted-readable">
                  <p>
                    Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Haftung für Inhalte</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Als Diensteanbieter sind wir nach den allgemeinen Gesetzen für eigene Inhalte auf
                    diesen Seiten verantwortlich. Eine permanente inhaltliche Kontrolle übermittelter
                    oder gespeicherter fremder Informationen ist ohne konkrete Anhaltspunkte einer
                    Rechtsverletzung nicht zumutbar.
                  </p>
                  <p>
                    Bei Bekanntwerden von Rechtsverletzungen werden wir die betroffenen Inhalte umgehend
                    entfernen.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Haftung für Links</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Unser Angebot enthält Links zu externen Websites Dritter. Auf deren Inhalte haben
                    wir keinen Einfluss, daher können wir für diese Inhalte keine Gewähr übernehmen.
                  </p>
                  <p>
                    Zum Zeitpunkt der Verlinkung waren keine Rechtsverstoesse erkennbar. Bei
                    Bekanntwerden von Rechtsverletzungen werden derartige Links umgehend entfernt.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Urheberrecht</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen
                    Urheberrecht. Vervielfältigung, Bearbeitung und Verwertung außerhalb der Grenzen
                    des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen
                    Rechteinhabers.
                  </p>
                  <p>
                    Sollten Sie auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
                    Hinweis. Bei Bekanntwerden von Rechtsverletzungen entfernen wir die betroffenen
                    Inhalte umgehend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


