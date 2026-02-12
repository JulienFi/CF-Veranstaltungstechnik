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
        'Mieten Sie professionelle Licht-, Ton- und Buehnentechnik fuer Veranstaltungen in Berlin und Brandenburg.',
      link: '/mietshop',
      highlights: ['Lichttechnik', 'Tontechnik', 'DJ-Equipment', 'Buehnentechnik'],
    },
    {
      icon: Music,
      title: 'Dienstleistungen',
      description:
        'Wir uebernehmen Planung, Aufbau und Betreuung, damit Sie sich auf Ihre Gaeste und Inhalte konzentrieren koennen.',
      link: '/dienstleistungen',
      highlights: ['Technische Planung', 'Aufbau & Installation', 'Event-Betreuung', 'Festinstallationen'],
    },
    {
      icon: Wrench,
      title: 'Werkstatt-Services',
      description:
        'Halten Sie Ihr Equipment einsatzbereit: Reparatur, Wartung und Sicherheitspruefung durch erfahrene Techniker.',
      link: '/werkstatt',
      highlights: ['Reparaturen', 'Wartung & Reinigung', 'Modifikationen', 'Sicherheitspruefungen'],
    },
  ];

  const features = [
    'Persoenliche Beratung und klare Ansprechpartner',
    'Professionelles Equipment fuer kleine und grosse Events',
    'Zuverlaessige Umsetzung in Berlin und Brandenburg',
    'Flexible Pakete fuer Privat- und Geschaeftskunden',
    'Transparente Angebote ohne versteckte Kosten',
    'Technischer Support waehrend Ihrer Veranstaltung',
  ];

  const eventTypes = [
    {
      title: 'Hochzeiten & Privatfeiern',
      description: 'Atmosphaere, Sound und Licht aus einem abgestimmten Technikpaket.',
    },
    {
      title: 'Firmenevents & Konferenzen',
      description: 'Professionelle Technik fuer Vortraege, Praesentationen und Live-Programm.',
    },
    {
      title: 'Messen & Ausstellungen',
      description: 'Setzen Sie Marken, Produkte und Botschaften sichtbar in Szene.',
    },
    {
      title: 'Stadtfeste & Festivals',
      description: 'Skalierbare Technikloesungen fuer grosse Flaechen und hohe Reichweiten.',
    },
    {
      title: 'Club-Events & Partys',
      description: 'Dynamische Lichtbilder und druckvoller Sound fuer starke Stimmung.',
    },
    {
      title: 'Theater & Kulturevents',
      description: 'Zuverlaessige Technik fuer Inszenierung, Timing und klare Verstaendlichkeit.',
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
        'Wir erstellen ein klares, nachvollziehbares Konzept fuer Ihre Location, Ihren Ablauf und Ihr Budget.',
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
        'Wir liefern puenktlich, bauen fachgerecht auf und pruefen alle Systeme vor Veranstaltungsstart.',
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
        'Nach dem Event uebernehmen wir den Rueckbau. Sie koennen sich voll auf Ihre Gaeste konzentrieren.',
    },
  ];

  const faqs = [
    {
      question: 'Wie viel Vorlaufzeit sollten wir einplanen?',
      answer:
        'Fuer Events mit Full-Service empfehlen wir 3 bis 6 Wochen Vorlauf. Kurzfristige Anfragen sind moeglich, sofern Technik und Team verfuegbar sind.',
    },
    {
      question: 'Uebernehmen Sie Aufbau und Abbau?',
      answer:
        'Ja. Auf Wunsch uebernehmen wir Lieferung, Aufbau, technischen Betrieb waehrend der Veranstaltung und den kompletten Abbau.',
    },
    {
      question: 'In welchem Einsatzgebiet sind Sie unterwegs?',
      answer:
        'Unser Schwerpunkt liegt auf Berlin und Brandenburg. Einsaetze ausserhalb der Region pruefen wir gerne individuell.',
    },
    {
      question: 'Arbeiten Sie fuer Privatkunden und Geschaeftskunden?',
      answer:
        'Ja, wir betreuen beide Zielgruppen. Von der privaten Feier bis zum Corporate Event erhalten Sie eine passende Loesung.',
    },
    {
      question: 'Wie funktioniert die Preisgestaltung?',
      answer:
        'Im Mietshop finden Sie je nach Produkt ab-Preise oder Richtwerte. Das finale Angebot wird immer auf Umfang, Laufzeit, Logistik und Servicelevel abgestimmt.',
    },
  ];

  return (
    <div className="bg-app-bg text-white">
      <section className="relative min-h-[72vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden py-10 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight fade-in">
              Wir uebernehmen die <span className="text-primary-400">Technik</span>. Sie konzentrieren sich auf Ihr Event.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed slide-up" style={{ animationDelay: '0.2s' }}>
              CF Veranstaltungstechnik ist Ihr Partner fuer Events in Berlin und Brandenburg: von der Technikmiete bis zur vollstaendigen Betreuung vor Ort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center slide-up" style={{ animationDelay: '0.4s' }}>
              <a
                href="/kontakt"
                className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 group"
              >
                <span>Unverbindliches Angebot anfragen</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/mietshop"
                className="w-full sm:w-auto px-8 py-4 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-semibold text-lg border border-gray-700 hover:scale-105"
              >
                Mietshop entdecken
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Unsere Leistungen fuer Ihr Event</h2>
            <p className="text-xl text-gray-400">Technik, Service und Beratung aus einer Hand</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-card-bg border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110">
                  <service.icon className="w-8 h-8 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={service.link}
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium group-hover:translate-x-1 transition-transform"
                >
                  <span>Mehr erfahren</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-app-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Fuer welche Events wir arbeiten</h2>
            <p className="text-xl text-gray-400">Passende Technik fuer private und berufliche Anlaesse</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventTypes.map((event, index) => (
              <div key={index} className="bg-card-bg border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition-all">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm">{event.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/projekte"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
            >
              <span>Referenzen ansehen</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Warum Kunden mit uns arbeiten</h2>
              <p className="text-xl text-gray-400">Verlaesslichkeit, klare Kommunikation und saubere Umsetzung</p>
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

      <section className="py-20 bg-app-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">So arbeiten wir mit Ihnen zusammen</h2>
            <p className="text-xl text-gray-400">Von der Anfrage bis zum Abbau in sechs klaren Schritten</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-card-bg border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all h-full">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-400 text-sm font-bold mb-1">Schritt {step.number}</div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
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

          <div className="text-center mt-12">
            <a
              href="/kontakt"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg shadow-lg shadow-blue-500/20"
            >
              <span>Unverbindliches Angebot anfragen</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-4">
                <HelpCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Haeufige Fragen</h2>
              <p className="text-xl text-gray-400">Kompakte Antworten rund um Ablauf, Region und Preise</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card-bg border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500/30 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-card-hover/50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-400 flex-shrink-0 transition-transform ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-5 text-gray-400 leading-relaxed border-t border-gray-800">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-card-bg border border-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Sie haben eine konkrete Anforderung?</h3>
              <p className="text-gray-400 mb-6">Sprechen Sie mit uns. Wir erstellen Ihnen kurzfristig ein passendes Angebot.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/kontakt"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
                >
                  Kontakt aufnehmen
                </a>
                <a
                  href={COMPANY_INFO.contact.phoneLink}
                  className="px-6 py-3 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{COMPANY_INFO.contact.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Planen Sie Ihr Event mit technischer Sicherheit</h2>
            <p className="text-xl text-gray-300 mb-8">
              Wir unterstuetzen Sie von der ersten Idee bis zur letzten Minute auf der Veranstaltung - in Berlin und Brandenburg.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/kontakt"
                className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg shadow-lg shadow-blue-500/20"
              >
                Unverbindliches Angebot anfragen
              </a>
              <a
                href={COMPANY_INFO.contact.phoneLink}
                className="px-8 py-4 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-semibold text-lg border border-gray-700"
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
