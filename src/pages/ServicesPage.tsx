import { Lightbulb, Wrench, Users, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function ServicesPage() {
  const services = [
    {
      icon: Lightbulb,
      title: 'Technische Planung',
      description:
        'Wir planen Ihr Event technisch bis ins Detail, damit am Veranstaltungstag alles stabil und planbar läuft.',
      details: [
        'Analyse von Anlass, Location und Ablauf',
        'Konzept für Licht-, Ton- und Bühnentechnik',
        'Abstimmung mit Location und weiteren Gewerken',
        'Budgetorientierte Varianten und klare Empfehlungen',
        'Transparente Angebotsbasis ohne Überraschungen',
      ],
      process: [
        'Briefing und Zielklärung',
        'Technische Einschätzung und Konzeptvorschlag',
        'Feinabstimmung nach Budget und Ablauf',
        'Finales Setup inkl. Zeit- und Aufbauplan',
        'Übergabe an Umsetzungsteam',
      ],
      useCases:
        'Ideal für Firmenveranstaltungen, Konferenzen, Galas, Messen und private Feiern mit hohem Qualitätsanspruch.',
    },
    {
      icon: Wrench,
      title: 'Aufbau & Installation',
      description:
        'Wir übernehmen Lieferung, Aufbau und technische Inbetriebnahme, damit Sie keinen Koordinationsaufwand haben.',
      details: [
        'Pünktliche Anlieferung der Technik',
        'Fachgerechter Aufbau nach abgestimmtem Plan',
        'Sichere Verkabelung und Systemtests',
        'Soundcheck und finale Lichtabstimmung',
        'Geordneter Rückbau nach Veranstaltungsende',
      ],
      process: [
        'Zeitplan für Anlieferung und Aufbau',
        'Montage vor Ort',
        'Systemtest und Abnahme mit Ihnen',
        'Eventbetrieb gemäss Ablauf',
        'Abbau und Rücktransport',
      ],
      useCases:
        'Ideal, wenn Sie die Technik nicht selbst aufbauen möchten und einen verlässlichen Full-Service benötigen.',
    },
    {
      icon: Users,
      title: 'Technische Betreuung',
      description:
        'Unsere Techniker begleiten Ihr Event vor Ort und sorgen für einen störungsfreien Ablauf.',
      details: [
        'Technische Betreuung während der Veranstaltung',
        'Bedienung von Licht- und Tonsystemen',
        'Schnelle Reaktion auf kurzfristige Änderungen',
        'Fehlerbehebung ohne Umwege',
        'Klare Kommunikation mit Regie, Moderation oder DJ',
      ],
      process: [
        'Ablaufbriefing vor Veranstaltungsstart',
        'Finaler Technikcheck',
        'Laufender Betrieb und Monitoring',
        'Situative Anpassungen in Echtzeit',
        'Abschluss und geordnete Übergabe',
      ],
      useCases:
        'Ideal für Events mit Liveslots, mehreren Programmpunkten oder wechselnden Sprecher- und Showelementen.',
    },
    {
      icon: Building2,
      title: 'Festinstallationen',
      description:
        'Wir planen und installieren dauerhafte Techniklösungen für Locations in Berlin und Brandenburg.',
      details: [
        'Konzeption passender Festinstallationen',
        'Integration in bestehende Infrastruktur',
        'Montage und technische Einrichtung',
        'Dokumentation und Einweisung des Teams',
        'Optionaler Wartungs- und Supportvertrag',
      ],
      process: [
        'Bestandsaufnahme vor Ort',
        'Technik- und Installationskonzept',
        'Freigabe und Terminierung',
        'Montage und Inbetriebnahme',
        'Schulung und Support-Setup',
      ],
      useCases:
        'Ideal für Clubs, Bars, Säle, Konferenzflächen und Eventlocations mit regelmässigem Betrieb.',
    },
  ];

  const faq = [
    {
      question: 'Wie viel Vorlaufzeit ist sinnvoll?',
      answer:
        'Für grössere Produktionen empfehlen wir 3 bis 6 Wochen Vorlauf. Kurzfristige Einsätze sind möglich, wenn Material und Team verfügbar sind.',
    },
    {
      question: 'Übernehmen Sie Aufbau und Abbau komplett?',
      answer:
        'Ja. Wir können Lieferung, Aufbau, Betreuung und Abbau vollständig übernehmen. Sie entscheiden den gewünschten Serviceumfang.',
    },
    {
      question: 'In welchem Gebiet bieten Sie den Service an?',
      answer:
        'Unser Kerngebiet ist Berlin und Brandenburg. Einsätze ausserhalb der Region kalkulieren wir transparent als individuelles Angebot.',
    },
    {
      question: 'Arbeiten Sie mit Privat- und Geschäftskunden?',
      answer:
        'Ja. Wir betreuen private Feiern, Vereine, Agenturen und Unternehmen mit jeweils passender technischer und organisatorischer Tiefe.',
    },
    {
      question: 'Wie werden Preise berechnet?',
      answer:
        'Preise orientieren sich an Technikumfang, Laufzeit, Transport, Aufbauaufwand und Betreuungslevel. Sie erhalten vorab ein klares, unverbindliches Angebot.',
    },
  ];

  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell section-shell--hero bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8" />
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="section-title text-4xl md:text-6xl font-bold mb-6">Dienstleistungen für reibungslose Events</h1>
            <p className="section-copy text-xl text-gray-300 leading-relaxed">
              Wir übernehmen die technische Umsetzung Ihrer Veranstaltung in Berlin und Brandenburg - von der Planung bis zur Betreuung vor Ort. Sie konzentrieren sich auf Gäste und Inhalte.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          <div className="space-y-20">
            {services.map((service, index) => (
              <div key={index} className="mx-auto max-w-5xl">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <div className="glass-panel--soft card-inner border-subtle mb-6 flex h-16 w-16 items-center justify-center">
                      <service.icon className="icon-std icon-std--lg text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">{service.description}</p>
                    <div className="glass-panel--soft card-inner border-blue-500/25 p-4">
                      <p className="text-sm text-gray-300">{service.useCases}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                        <CheckCircle2 className="icon-std text-blue-400" />
                        <span>Leistungsumfang</span>
                      </h3>
                      <div className="glass-panel card p-6">
                        <ul className="space-y-3">
                          {service.details.map((detail, i) => (
                            <li key={i} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                              <span className="text-gray-300 leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Ablauf</h3>
                      <div className="space-y-3">
                        {service.process.map((step, i) => (
                          <div key={i} className="glass-panel--soft card-inner flex items-start space-x-4 p-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                              <span className="text-blue-400 font-bold text-sm">{i + 1}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {index < services.length - 1 && <div className="border-subtle-bottom mt-20"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title font-bold mb-12 text-center">Häufige Fragen</h2>
            <div className="space-y-6">
              {faq.map((item, index) => (
                <div key={index} className="glass-panel--soft card-inner p-6">
                  <h3 className="text-xl font-bold mb-3">{item.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title text-4xl md:text-5xl font-bold mb-6">Planen Sie Ihr Event mit technischer Sicherheit</h2>
            <p className="section-copy text-xl text-gray-300 mb-8">
              Fordern Sie ein unverbindliches Angebot an. Wir stimmen Technik, Ablauf und Budget exakt auf Ihre Veranstaltung ab.
            </p>
            <a
              href="/kontakt"
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              <span>Unverbindliches Angebot anfragen</span>
              <ArrowRight className="icon-std" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
