import { AlertTriangle, Shield } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';

export default function DatenschutzPage() {
  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell">
        <div className="content-container content-container--narrow">
          <div className="mx-auto max-w-4xl">
            <div className="glass-panel--soft card-inner border border-yellow-500/30 bg-yellow-500/10 p-4 mb-8">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <strong>Hinweis:</strong> Dies ist eine Platzhalter-Datenschutzerklärung. Diese Vorlage ist unvollständig und muss durch eine rechtlich korrekte Datenschutzerklärung gemäß DSGVO ersetzt werden. Bitte konsultieren Sie einen Rechtsanwalt oder Datenschutzbeauftragten für die korrekte Erstellung Ihrer Datenschutzerklärung.
                </div>
              </div>
            </div>

            <div className="mb-8 flex items-center space-x-3">
              <Shield className="w-10 h-10 text-primary-400" />
              <h1 className="section-title">Datenschutzerklärung</h1>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">1. Datenschutz auf einen Blick</h2>
                <div className="muted-readable space-y-3">
                  <h3 className="text-xl font-semibold text-white mt-4">Allgemeine Hinweise</h3>
                  <p>
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. Verantwortliche Stelle</h2>
                <div className="muted-readable space-y-3">
                  <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
                  <div className="glass-panel--soft card-inner p-4 mt-3">
                    <p className="font-semibold text-white">{COMPANY_INFO.legalName}</p>
                    <p>{COMPANY_INFO.address.street}</p>
                    <p>{COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}</p>
                    <p className="mt-2">Telefon: <a href={COMPANY_INFO.contact.phoneLink} className="interactive-link text-blue-300 hover:text-blue-200">{COMPANY_INFO.contact.phone}</a></p>
                    <p>E-Mail: <a href={COMPANY_INFO.contact.emailLink} className="interactive-link text-blue-300 hover:text-blue-200">{COMPANY_INFO.contact.email}</a></p>
                  </div>
                  <p className="mt-4">
                    Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o.Ä.) entscheidet.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Datenerfassung auf dieser Website</h2>
                <div className="muted-readable space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Kontaktformular</h3>
                    <p>
                      Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                    </p>
                  </div>

                  <div className="glass-panel--soft card-inner border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <p className="text-sm text-yellow-200">
                      <strong>PLATZHALTER:</strong> Hier müssen weitere Details zur Datenverarbeitung ergänzt werden, z.B.:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-yellow-200">
                      <li>Welche Daten werden konkret erfasst?</li>
                      <li>Wie lange werden die Daten gespeichert?</li>
                      <li>An wen werden Daten weitergegeben?</li>
                      <li>Welche Cookies werden verwendet?</li>
                      <li>Werden Analyse-Tools eingesetzt?</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Ihre Rechte</h2>
                <div className="muted-readable space-y-3">
                  <p>Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                    <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                    <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                    <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                    <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                    <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
                    <li>Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. SSL- bzw. TLS-Verschlüsselung</h2>
                <div className="muted-readable">
                  <p>
                    Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Speicherdauer</h2>
                <div className="muted-readable">
                  <p>
                    Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Datenschutzbeauftragter</h2>
                <div className="glass-panel--soft card-inner border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-200">
                    <strong>PLATZHALTER:</strong> Falls gesetzlich erforderlich (ab 20 Mitarbeiter, die regelmäßig mit personenbezogenen Daten arbeiten), muss hier ein Datenschutzbeauftragter benannt werden.
                  </p>
                </div>
              </div>

              <div className="glass-panel card border border-blue-500/30 bg-blue-500/10 mt-8 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Wichtiger Hinweis</h3>
                <p className="text-sm muted-readable">
                  Diese Datenschutzerklärung ist ein unvollständiger Platzhalter und entspricht nicht den Anforderungen der DSGVO. Für eine rechtssichere Website benötigen Sie eine vollständige, auf Ihre spezifischen Verarbeitungsvorgänge zugeschnittene Datenschutzerklärung. Wir empfehlen dringend, einen Rechtsanwalt oder spezialisierten Datenschutzdienstleister zu konsultieren.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
