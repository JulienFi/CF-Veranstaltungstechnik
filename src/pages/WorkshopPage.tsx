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
      <section className="py-20 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="container mx-auto px-4">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8" />
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Werkstatt-Service für verlässliche Technik</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Wir halten Ihr Equipment in Berlin und Brandenburg einsatzbereit - mit Reparatur, Wartung und Sicherheitsprüfung. So reduzieren Sie Ausfälle und sichern Ihre Eventqualität.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-card-bg border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{service.title}</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Leistungsumfang</h3>
                  <ul className="space-y-2">
                    {service.details.map((detail, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Ihr Nutzen</h3>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
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

      <section className="py-20 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">So läuft der Werkstattprozess</h2>
              <p className="text-xl text-gray-400">Von der Anfrage bis zur einsatzbereiten Rückgabe</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {process.map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-card-bg border border-gray-800 rounded-xl p-6 text-center h-full">
                    <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-card-hover -z-10"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Warum Kunden unseren Werkstatt-Service nutzen</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-300 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Jetzt Werkstattanfrage stellen</h2>
            <p className="text-xl text-gray-300 mb-8">
              Schicken Sie uns Ihr Anliegen. Sie erhalten eine transparente Einschätzung mit Aufwand, Zeitrahmen und nächsten Schritten.
            </p>
            <a
              href="/kontakt"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg shadow-lg"
            >
              <span>Werkstatt-Termin anfragen</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
