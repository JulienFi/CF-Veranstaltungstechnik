import {
  ArrowRight,
  Lightbulb,
  Music,
  Wrench,
  CheckCircle2,
  Phone,
  Calendar,
  Truck,
  Settings,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { COMPANY_INFO } from '../config/company';

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const services = [
    {
      icon: Lightbulb,
      title: 'Mietshop',
      description:
        'Mieten Sie professionelle Licht-, Ton- und Bühnentechnik für Veranstaltungen in Berlin und Brandenburg.',
      link: '/mietshop',
      highlights: ['Lichttechnik', 'Tontechnik', 'DJ-Equipment', 'Bühnentechnik'],
    },
    {
      icon: Music,
      title: 'Dienstleistungen',
      description:
        'Wir übernehmen Planung, Aufbau und Betreuung, damit Sie sich auf Ihre Gäste und Inhalte konzentrieren können.',
      link: '/dienstleistungen',
      highlights: ['Technische Planung', 'Aufbau & Installation', 'Event-Betreuung', 'Festinstallationen'],
    },
    {
      icon: Wrench,
      title: 'Werkstatt-Services',
      description:
        'Halten Sie Ihr Equipment einsatzbereit: Reparatur, Wartung und Sicherheitsprüfung durch erfahrene Techniker.',
      link: '/werkstatt',
      highlights: ['Reparaturen', 'Wartung & Reinigung', 'Modifikationen', 'Sicherheitsprüfungen'],
    },
  ];

  const features = [
    'Persönliche Beratung und klare Ansprechpartner',
    'Professionelles Equipment für kleine und grosse Events',
    'Zuverlässige Umsetzung in Berlin und Brandenburg',
    'Flexible Pakete für Privat- und Geschäftskunden',
    'Transparente Angebote ohne versteckte Kosten',
    'Technischer Support während Ihrer Veranstaltung',
  ];

  const eventTypes = [
    {
      title: 'Hochzeiten & Privatfeiern',
      description: 'Atmosphäre, Sound und Licht aus einem abgestimmten Technikpaket.',
    },
    {
      title: 'Firmenevents & Konferenzen',
      description: 'Professionelle Technik für Vorträge, Präsentationen und Live-Programm.',
    },
    {
      title: 'Messen & Ausstellungen',
      description: 'Setzen Sie Marken, Produkte und Botschaften sichtbar in Szene.',
    },
    {
      title: 'Stadtfeste & Festivals',
      description: 'Skalierbare Techniklösungen für grosse Flächen und hohe Reichweiten.',
    },
    {
      title: 'Club-Events & Partys',
      description: 'Dynamische Lichtbilder und druckvoller Sound für starke Stimmung.',
    },
    {
      title: 'Theater & Kulturevents',
      description: 'Zuverlässige Technik für Inszenierung, Timing und klare Verständlichkeit.',
    },
  ];

  const processSteps = [
    {
      icon: Phone,
      number: '01',
      title: 'Anfrage & Beratung',
      description:
        'Sie schildern uns Ihr Event und Ihre Ziele. Wir beraten Sie direkt zu passender Technik und Aufwand.',
    },
    {
      icon: Calendar,
      number: '02',
      title: 'Technikkonzept',
      description:
        'Wir erstellen ein klares, nachvollziehbares Konzept für Ihre Location, Ihren Ablauf und Ihr Budget.',
    },
    {
      icon: CheckCircle2,
      number: '03',
      title: 'Angebot & Termin',
      description:
        'Sie erhalten ein unverbindliches Angebot. Nach Freigabe reservieren wir Technik und Team verbindlich.',
    },
    {
      icon: Truck,
      number: '04',
      title: 'Lieferung & Aufbau',
      description:
        'Wir liefern pünktlich, bauen fachgerecht auf und prüfen alle Systeme vor Veranstaltungsstart.',
    },
    {
      icon: Settings,
      number: '05',
      title: 'Betreuung vor Ort',
      description:
        'Auf Wunsch begleiten wir Ihr Event technisch, reagieren schnell und halten den Ablauf stabil.',
    },
    {
      icon: CheckCircle2,
      number: '06',
      title: 'Abbau & Abschluss',
      description:
        'Nach dem Event übernehmen wir den Rückbau. Sie können sich voll auf Ihre Gäste konzentrieren.',
    },
  ];

  const faqs = [
    {
      question: 'Wie viel Vorlaufzeit sollten wir einplanen?',
      answer:
        'Für Events mit Full-Service empfehlen wir 3 bis 6 Wochen Vorlauf. Kurzfristige Anfragen sind möglich, sofern Technik und Team verfügbar sind.',
    },
    {
      question: 'Übernehmen Sie Aufbau und Abbau?',
      answer:
        'Ja. Auf Wunsch übernehmen wir Lieferung, Aufbau, technischen Betrieb während der Veranstaltung und den kompletten Abbau.',
    },
    {
      question: 'In welchem Einsatzgebiet sind Sie unterwegs?',
      answer:
        'Unser Schwerpunkt liegt auf Berlin und Brandenburg. Einsätze ausserhalb der Region prüfen wir gerne individuell.',
    },
    {
      question: 'Arbeiten Sie für Privatkunden und Geschäftskunden?',
      answer:
        'Ja, wir betreuen beide Zielgruppen. Von der privaten Feier bis zum Corporate Event erhalten Sie eine passende Lösung.',
    },
    {
      question: 'Wie funktioniert die Preisgestaltung?',
      answer:
        'Im Mietshop finden Sie je nach Produkt ab-Preise oder Richtwerte. Das finale Angebot wird immer auf Umfang, Laufzeit, Logistik und Servicelevel abgestimmt.',
    },
  ];

  return (
    <div className="bg-app-bg text-white">
      <section className="section-shell section-shell--hero relative flex min-h-[72vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="content-container relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="hero-title text-glow mb-6 font-bold fade-in">
              Wir übernehmen die <span className="text-primary-400">Technik</span>. Sie konzentrieren sich auf Ihr Event.
            </h1>
            <p className="hero-copy mx-auto mb-8 text-gray-300 slide-up" style={{ animationDelay: '0.2s' }}>
              CF Veranstaltungstechnik ist Ihr Partner für Events in Berlin und Brandenburg: von der Technikmiete bis zur vollständigen Betreuung vor Ort.
            </p>
            <div className="slide-up flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={{ animationDelay: '0.4s' }}>
              <a
                href="/kontakt"
                className="btn-primary focus-ring tap-target group w-full text-base sm:w-auto"
              >
                <span>Unverbindliches Angebot anfragen</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/mietshop"
                className="btn-secondary focus-ring tap-target w-full text-base sm:w-auto"
              >
                Mietshop entdecken
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-16">
            <h2 className="section-title font-bold">Unsere Leistungen für Ihr Event</h2>
            <p className="section-copy">Technik, Service und Beratung aus einer Hand</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-7">
            {services.map((service, index) => (
              <div
                key={index}
                className="glass-panel interactive-card group rounded-xl p-6 md:p-8"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-500/12 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-500/22">
                  <service.icon className="w-8 h-8 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h3 className="mb-3 text-2xl font-bold leading-tight">{service.title}</h3>
                <p className="mb-6 text-gray-300 leading-relaxed">{service.description}</p>
                <ul className="mb-6 space-y-2.5">
                  {service.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={service.link}
                  className="interactive-link focus-ring inline-flex items-center gap-2 rounded-md px-1 py-1 text-blue-300 font-medium group-hover:translate-x-1 transition-transform"
                >
                  <span>Mehr erfahren</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-app-bg">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-16">
            <h2 className="section-title font-bold">Für welche Events wir arbeiten</h2>
            <p className="section-copy">Passende Technik für private und berufliche Anlässe</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {eventTypes.map((event, index) => (
              <div key={index} className="glass-panel--soft interactive-card rounded-lg p-5 md:p-6">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center md:mt-12">
            <a
              href="/projekte"
              className="btn-secondary focus-ring tap-target inline-flex items-center gap-2"
            >
              <span>Referenzen ansehen</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <div className="section-head mb-10 md:mb-12">
              <h2 className="section-title font-bold">Warum Kunden mit uns arbeiten</h2>
              <p className="section-copy">Verlässlichkeit, klare Kommunikation und saubere Umsetzung</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {features.map((feature, index) => (
                <div key={index} className="glass-panel--soft flex items-start gap-3 rounded-xl p-4 md:p-5">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-200 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-app-bg">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-16">
            <h2 className="section-title font-bold">So arbeiten wir mit Ihnen zusammen</h2>
            <p className="section-copy">Von der Anfrage bis zum Abbau in sechs klaren Schritten</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="glass-panel interactive-card h-full rounded-xl p-6">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                          <step.icon className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-400 text-sm font-bold mb-1">Schritt {step.number}</div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-blue-500/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center md:mt-12">
            <a
              href="/kontakt"
              className="btn-primary focus-ring tap-target inline-flex items-center gap-2"
            >
              <span>Unverbindliches Angebot anfragen</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <div className="section-head mb-10 md:mb-12">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <HelpCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="section-title font-bold">Häufige Fragen</h2>
              <p className="section-copy">Kompakte Antworten rund um Ablauf, Region und Preise</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="glass-panel--soft interactive-card overflow-hidden rounded-xl"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="focus-ring tap-target flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-card-hover/45 md:px-6 md:py-5"
                  >
                    <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-400 flex-shrink-0 transition-transform ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="border-t border-gray-700/80 px-5 pb-5 text-gray-300 leading-relaxed md:px-6">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="glass-panel mt-10 rounded-xl p-6 text-center md:mt-12 md:p-8">
              <h3 className="mb-3 text-2xl font-bold leading-tight">Sie haben eine konkrete Anforderung?</h3>
              <p className="mx-auto mb-6 max-w-[60ch] text-gray-300">Sprechen Sie mit uns. Wir erstellen Ihnen kurzfristig ein passendes Angebot.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="/kontakt"
                  className="btn-primary focus-ring tap-target"
                >
                  Kontakt aufnehmen
                </a>
                <a
                  href={COMPANY_INFO.contact.phoneLink}
                  className="btn-secondary focus-ring tap-target inline-flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{COMPANY_INFO.contact.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6 font-bold">Planen Sie Ihr Event mit technischer Sicherheit</h2>
            <p className="section-copy mb-8 text-gray-200">
              Wir unterstützen Sie von der ersten Idee bis zur letzten Minute auf der Veranstaltung - in Berlin und Brandenburg.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/kontakt"
                className="btn-primary focus-ring tap-target"
              >
                Unverbindliches Angebot anfragen
              </a>
              <a
                href={COMPANY_INFO.contact.phoneLink}
                className="btn-secondary focus-ring tap-target"
              >
                {COMPANY_INFO.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
