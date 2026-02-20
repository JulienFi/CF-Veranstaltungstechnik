import { Shield } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';
import { LEGAL_INFO, hasLegalValue } from '../config/legal';

export default function DatenschutzPage() {
  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell">
        <div className="content-container content-container--narrow">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center space-x-3">
              <Shield className="w-10 h-10 text-primary-400" />
              <h1 className="section-title">Datenschutzerklärung</h1>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">1. Verantwortlicher</h2>
                <div className="glass-panel--soft card-inner p-4 muted-readable space-y-1">
                  <p className="font-semibold text-white">{COMPANY_INFO.legalName}</p>
                  <p>{COMPANY_INFO.address.street}</p>
                  <p>
                    {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}
                  </p>
                  <p>{COMPANY_INFO.address.country}</p>
                  <p className="pt-2">
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
                  {hasLegalValue(LEGAL_INFO.responsibleEditor) && (
                    <p>Inhaltlich verantwortlich: {LEGAL_INFO.responsibleEditor}</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. Zweck und Rechtsgrundlagen</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Wir verarbeiten personenbezogene Daten, um Anfragen zu beantworten, Angebote zu
                    erstellen und die technische Bereitstellung dieser Website sicherzustellen.
                  </p>
                  <p>
                    Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung),
                    Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtungen) sowie Art. 6 Abs. 1 lit. f
                    DSGVO (berechtigtes Interesse an sicherem und wirtschaftlichem Betrieb).
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Kontakt- und Anfrageformulare</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Wenn Sie uns über ein Formular kontaktieren, verarbeiten wir die von Ihnen
                    übermittelten Angaben ausschließlich zur Bearbeitung Ihrer Anfrage und für
                    mögliche Rückfragen.
                  </p>
                  <p>
                    Typische Datenkategorien: Name, Kontaktinformationen, Veranstaltungsbezug,
                    Nachrichtentext und optional produktbezogene Informationen aus dem Mietshop.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Webanalyse (Plausible)</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Wir nutzen Plausible Analytics zur aggregierten Auswertung der Website-Nutzung.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Der Dienst arbeitet cookieless und setzt keine Tracking-Cookies.</li>
                    <li>Es erfolgt keine Speicherung personenbezogener Profile im Browser.</li>
                    <li>Die Auswertung erfolgt ausschliesslich in aggregierter Form.</li>
                  </ul>
                  <p>
                    Details zur Datenverarbeitung finden Sie in der Plausible Data Policy (Hinweistext
                    des Anbieters).
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Empfänger und Hosting</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Zur technischen Bereitstellung setzen wir Dienstleister für Hosting,
                    Datenbankbetrieb und Infrastruktur ein. Eine Verarbeitung erfolgt nur, soweit sie
                    zur Leistungserbringung erforderlich ist.
                  </p>
                  {hasLegalValue(LEGAL_INFO.hostingProvider) && (
                    <p>Aktueller Hosting-Provider: {LEGAL_INFO.hostingProvider}</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Speicherdauer</h2>
                <div className="muted-readable space-y-3">
                  <p>
                    Personenbezogene Daten speichern wir nur so lange, wie es für den jeweiligen Zweck
                    erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
                  </p>
                  <p>
                    Entfällt der Zweck und bestehen keine gesetzlichen Pflichten, werden die Daten
                    gelöscht oder anonymisiert.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Ihre Rechte</h2>
                <div className="muted-readable space-y-3">
                  <p>Sie haben im Rahmen der DSGVO insbesondere folgende Rechte:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Auskunft (Art. 15 DSGVO)</li>
                    <li>Berichtigung (Art. 16 DSGVO)</li>
                    <li>Löschung (Art. 17 DSGVO)</li>
                    <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                    <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                    <li>Widerspruch (Art. 21 DSGVO)</li>
                    <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Stand</h2>
                <div className="muted-readable">
                  <p>Stand: Februar 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


