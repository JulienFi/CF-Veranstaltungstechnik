import { AlertTriangle } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';

export default function ImpressumPage() {
  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell">
        <div className="content-container content-container--narrow">
          <div className="mx-auto max-w-4xl">
            <div className="glass-panel--soft card-inner border border-yellow-500/30 bg-yellow-500/10 p-4 mb-8">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <strong>Hinweis:</strong> Dies ist ein Platzhalter-Impressum. Die hier angegebenen Informationen sind unvollständig und müssen durch rechtlich korrekte Angaben gemäß §5 TMG ersetzt werden. Bitte konsultieren Sie einen Rechtsanwalt für die korrekte Erstellung Ihres Impressums.
                </div>
              </div>
            </div>

            <h1 className="section-title mb-8">Impressum</h1>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Angaben gemäß § 5 TMG</h2>
                <div className="muted-readable space-y-1">
                  <p className="font-semibold text-white">{COMPANY_INFO.legalName}</p>
                  <p>{COMPANY_INFO.address.street}</p>
                  <p>{COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}</p>
                  <p>{COMPANY_INFO.address.country}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
                <div className="muted-readable space-y-1">
                  <p>Telefon: <a href={COMPANY_INFO.contact.phoneLink} className="interactive-link text-blue-300 hover:text-blue-200">{COMPANY_INFO.contact.phone}</a></p>
                  <p>E-Mail: <a href={COMPANY_INFO.contact.emailLink} className="interactive-link text-blue-300 hover:text-blue-200">{COMPANY_INFO.contact.email}</a></p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Vertretungsberechtigte Person</h2>
                <div className="glass-panel--soft card-inner border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-200">
                    <strong>PLATZHALTER:</strong> Hier muss der Name der vertretungsberechtigten Person (Geschäftsführer, Inhaber, etc.) eingetragen werden.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Umsatzsteuer-ID</h2>
                <div className="glass-panel--soft card-inner border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-200">
                    <strong>PLATZHALTER:</strong> Falls vorhanden, muss hier die Umsatzsteuer-Identifikationsnummer gemäß §27a UStG eingetragen werden.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">EU-Streitschlichtung</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
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
                <h2 className="text-2xl font-bold mb-4">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
                <div className="muted-readable">
                  <p>
                    Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Haftung für Inhalte</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                  </p>
                  <p>
                    Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Haftung für Links</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
                  </p>
                  <p>
                    Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Urheberrecht</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
                  </p>
                  <p>
                    Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
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
