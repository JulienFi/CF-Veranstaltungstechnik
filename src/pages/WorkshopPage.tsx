import { Wrench, Shield, Sparkles, Settings, ArrowRight, CheckCircle2 } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function WorkshopPage() {
  const services = [
    {
      icon: Wrench,
      title: 'Reparaturen',
      description:
        'Wir reparieren Ihre Veranstaltungsgeräte schnell und fachgerecht, damit Ausfälle Ihre Projekte nicht bremsen.',
      details: [
        'Fehlerdiagnose und technische Analyse',
        'Reparatur von Licht-, Ton- und Bühnentechnik',
        'Beschaffung und Einbau passender Ersatzteile',
        'Funktions- und Belastungstest nach der Instandsetzung',
        'Dokumentation der durchgeführten Arbeiten',
      ],
      benefits: [
        'Kurze Reaktionszeiten',
        'Transparente Kostenstruktur',
        'Verlässliche Ersatzteilstrategie',
        'Garantie auf ausgeführte Arbeiten',
      ],
    },
    {
      icon: Sparkles,
      title: 'Wartung & Reinigung',
      description:
        'Regelmässige Wartung verlängert die Lebensdauer Ihrer Technik und reduziert Störungen während des Einsatzes.',
      details: [
        'Professionelle Reinigung von Gehäusen und Optiken',
        'Prüfung mechanischer Komponenten',
        'Austausch typischer Verschleissteile',
        'Kalibrierung und Softwarepflege',
        'Funktionsprüfung vor Rückgabe',
      ],
      benefits: [
        'Hohe Betriebssicherheit',
        'Planbare Einsatzfähigkeit',
        'Weniger Ausfälle im Eventbetrieb',
        'Werterhalt Ihrer Investition',
      ],
    },
    {
      icon: Settings,
      title: 'Modifikationen',
      description:
        'Wir passen bestehende Systeme an neue Anforderungen an, damit Ihre Technik auch morgen noch wirtschaftlich einsetzbar ist.',
      details: [
        'Anpassungen für spezielle Produktionsanforderungen',
        'Technische Upgrades bestehender Systeme',
        'Integration neuer Komponenten',
        'Optimierung von Signalwegen und Steuerung',
        'Praxistest der geänderten Konfiguration',
      ],
      benefits: [
        'Passgenaue Lösungen statt Standardumbau',
        'Verlängerte Nutzungsdauer vorhandener Technik',
        'Nachvollziehbare Umsetzung',
        'Beratung zu sinnvollen Modernisierungsschritten',
      ],
    },
    {
      icon: Shield,
      title: 'Sicherheitsprüfungen',
      description:
        'Wir prüfen Ihre Technik nach relevanten Sicherheitsstandards und dokumentieren Ergebnisse nachvollziehbar.',
      details: [
        'Elektrische Sicherheitsprüfung',
        'Prüfung mechanischer und tragender Komponenten',
        'Funktionstest sicherheitsrelevanter Systeme',
        'Prüfprotokoll und Kennzeichnung',
        'Empfehlungen für notwendige Nachbesserungen',
      ],
      benefits: [
        'Mehr Sicherheit für Team und Publikum',
        'Besseres Risikomanagement',
        'Dokumentierte Nachweise für Betreiber',
        'Verlässliche Grundlage für den nächsten Einsatz',
      ],
    },
  ];

  const process = [
    {
      step: '1',
      title: 'Anfrage',
      description: 'Sie schildern Defekt oder Bedarf und senden uns die wichtigsten Gerätedaten.',
    },
    {
      step: '2',
      title: 'Kosteneinschätzung',
      description: 'Nach Sichtung erhalten Sie eine transparente Einschätzung zu Aufwand, Zeit und Kosten.',
    },
    {
      step: '3',
      title: 'Umsetzung',
      description: 'Nach Ihrer Freigabe setzen wir Reparatur, Wartung oder Modifikation fachgerecht um.',
    },
    {
      step: '4',
      title: 'Rückgabe',
      description: 'Sie erhalten geprüfte, dokumentierte und einsatzbereite Technik zurück.',
    },
  ];

  const features = [
    'Erfahrenes Technikteam mit Praxis aus Live-Produktionen',
    'Spezialisierung auf professionelles Veranstaltungsequipment',
    'Strukturierte Arbeitsprozesse und klare Rückmeldungen',
    'Nachvollziehbare Kosten und verbindliche Aussagen',
    'Sorgfältige Dokumentation der Arbeiten',
    'Werkstatt-Support für Kunden in Berlin und Brandenburg',
  ];

  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell section-shell--hero bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8 md:mb-10" />
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="section-title mb-6 font-bold">Werkstatt-Service für verlässliche Technik</h1>
            <p className="section-copy text-gray-200">
              Wir halten Ihr Equipment in Berlin und Brandenburg einsatzbereit - mit Reparatur, Wartung und Sicherheitsprüfung. So reduzieren Sie Ausfälle und sichern Ihre Eventqualität.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {services.map((service, index) => (
              <div key={index} className="glass-panel card interactive-card p-6 md:p-8">
                <div className="card-inner border-subtle mb-6 flex h-14 w-14 items-center justify-center bg-blue-500/12">
                  <service.icon className="icon-std icon-std--lg text-blue-400" />
                </div>
                <h2 className="mb-3 text-2xl font-bold">{service.title}</h2>
                <p className="mb-6 leading-relaxed text-gray-300">{service.description}</p>

                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">Leistungsumfang</h3>
                  <ul className="space-y-2">
                    {service.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="icon-std icon-std--sm mt-0.5 flex-shrink-0 text-blue-400" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-subtle-top pt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">Ihr Nutzen</h3>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="mx-auto max-w-5xl">
            <div className="section-head mb-12">
              <h2 className="section-title font-bold">So läuft der Werkstattprozess</h2>
              <p className="section-copy">Von der Anfrage bis zur einsatzbereiten Rückgabe</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
              {process.map((item) => (
                <div key={item.step} className="glass-panel--soft card-inner p-5 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/90">
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="mb-3 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          <div className="mx-auto max-w-4xl">
            <div className="section-head mb-10">
              <h2 className="section-title font-bold">Warum Kunden unseren Werkstatt-Service nutzen</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {features.map((feature, index) => (
                <div key={index} className="glass-panel--soft card-inner flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                    <CheckCircle2 className="icon-std icon-std--sm text-white" />
                  </div>
                  <p className="leading-relaxed text-gray-200">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6 font-bold">Jetzt Werkstattanfrage stellen</h2>
            <p className="section-copy mb-8 text-gray-200">
              Schicken Sie uns Ihr Anliegen. Sie erhalten eine transparente Einschätzung mit Aufwand, Zeitrahmen und nächsten Schritten.
            </p>
            <a
              href="/kontakt"
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              <span>Werkstatt-Termin anfragen</span>
              <ArrowRight className="icon-std" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
