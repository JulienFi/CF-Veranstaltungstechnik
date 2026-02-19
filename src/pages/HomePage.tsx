import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Headphones,
  Layers3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FAQ_ITEMS } from '../content/faq';
import { COMPANY_INFO } from '../config/company';
import { trackAnalyticsEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { type ProjectDTO, projectRepository } from '../repositories/projectRepository';
import { type TeamMemberDTO, teamRepository } from '../repositories/teamRepository';
import { resolveImageUrl } from '../utils/image';

const PRIMARY_CTA_LABEL = 'Unverbindliches Angebot anfragen';
const SECONDARY_CTA_LABEL = 'Mietshop entdecken';
const RESPONSE_PROMISE = 'Antwort in der Regel innerhalb von 24 Stunden.';

const proofItems = [
  {
    icon: MapPin,
    label: 'Region',
    value: 'Berlin und Brandenburg',
  },
  {
    icon: ShieldCheck,
    label: 'Ablauf',
    value: 'Planung bis Rueckbau',
  },
  {
    icon: Users,
    label: 'Einsatz',
    value: 'Privat, Corporate, Kultur',
  },
  {
    icon: Headphones,
    label: 'Rueckmeldung',
    value: RESPONSE_PROMISE,
  },
];

const serviceCards = [
  {
    id: 'service-rental',
    icon: Store,
    title: 'Mietshop',
    description:
      'Licht-, Ton- und Buehnentechnik mieten. Verfuegbare Systeme, klare Preise und direkte Anfrageoptionen.',
    highlights: ['Licht und Ton', 'Buehne und Rigging', 'DJ- und Event-Equipment'],
    layoutClass: 'lg:col-span-5',
  },
  {
    id: 'service-live',
    icon: Sparkles,
    title: 'Technik-Service',
    description:
      'Wir planen, bauen auf und betreuen den Eventbetrieb vor Ort. Ein Team, ein Ablauf, klare Verantwortung.',
    highlights: ['Technikplanung', 'Aufbau und Betrieb', 'Abstimmung mit Gewerken'],
    layoutClass: 'lg:col-span-4',
  },
  {
    id: 'service-workshop',
    icon: Wrench,
    title: 'Werkstatt',
    description:
      'Reparatur, Wartung und Sicherheitspruefung fuer einsatzbereite Technik und planbare Eventqualitaet.',
    highlights: ['Reparatur', 'Wartung', 'Sicherheitschecks'],
    layoutClass: 'lg:col-span-3',
  },
];

const processSteps = [
  {
    title: 'Anfrage und Zielklaerung',
    description: 'Sie beschreiben Anlass, Termin und Location. Wir klaeren Anforderungen und Prioritaeten.',
  },
  {
    title: 'Konzept und Angebot',
    description: 'Sie erhalten ein klares Setup mit Leistungsumfang, Zeitplan und transparentem Angebot.',
  },
  {
    title: 'Aufbau und Durchfuehrung',
    description: 'Wir liefern, bauen auf und betreuen den Betrieb waehrend des Events in abgestimmten Rollen.',
  },
  {
    title: 'Rueckbau und Nachlauf',
    description: 'Nach Veranstaltungsende uebernehmen wir den Rueckbau und dokumentieren offene Punkte.',
  },
];

const shopHighlights = [
  {
    title: 'Lichttechnik',
    description: 'Moving Heads, Washes, Spots und Ambient-Licht fuer klare Stimmung und Fuehrung.',
  },
  {
    title: 'Tontechnik',
    description: 'PA, Monitoring, Funkstrecken und Mischpulte fuer Sprache und Musik.',
  },
  {
    title: 'Buehne und Infrastruktur',
    description: 'Buehnenmodule, Traversen, Stromverteilung und sichere Verkabelung.',
  },
];

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const DEFAULT_FORM_STATE: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  subject: 'Allgemeine Anfrage',
  message: '',
};

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDTO[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ContactFormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreviewData = async () => {
      try {
        const [projectData, teamData] = await Promise.all([
          projectRepository.getAll(),
          teamRepository.getAll(),
        ]);

        if (!isMounted) return;

        setProjects(projectData.slice(0, 3));
        setTeamMembers(teamData.slice(0, 4));
        setPreviewError(null);
      } catch (error) {
        console.error('Error loading onepager preview data:', error);
        if (!isMounted) return;
        setPreviewError('Inhalte konnten gerade nicht geladen werden.');
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadPreviewData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('inquiries').insert({
        inquiry_type: 'contact',
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: `${formData.subject}: ${formData.message.trim()}`,
        status: 'new',
      });

      if (error) {
        throw error;
      }

      trackAnalyticsEvent('Onepager Kontaktformular abgesendet', {
        subject: formData.subject,
      });

      setSubmitSuccess(true);
      setFormData(DEFAULT_FORM_STATE);
    } catch (error) {
      console.error('Error submitting onepager inquiry:', error);
      setSubmitError('Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-app-bg text-white">
      <section className="section-shell section-shell--hero relative flex min-h-[74vh] items-center overflow-hidden scroll-anchor">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-app-bg/25 to-app-bg/72"></div>
        <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[820px] -translate-x-1/2 rounded-full bg-[rgb(var(--primary)/0.2)] blur-[120px]"></div>
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE0NSwgMTk2LCAyMjMsIDAuMDYpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-25"></div>

        <div className="content-container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="hero-badge mb-6">
              <span className="hero-badge-dot" aria-hidden="true"></span>
              <span>One Team fuer Technik, Ablauf und Betrieb</span>
            </div>

            <h1 className="hero-title text-glow mb-6 font-bold">
              Eventtechnik, die ruhig wirkt. <br className="hidden md:block" />
              <span className="text-transparent bg-gradient-to-b from-white to-white/55 bg-clip-text">
                Weil der Ablauf sicher steht.
              </span>
            </h1>

            <p className="hero-copy mx-auto mb-10 text-gray-300">
              CF Veranstaltungstechnik begleitet Veranstaltungen in Berlin und Brandenburg von der ersten Planung bis zum
              letzten Abbau. Ein Ansprechpartner, ein klarer Prozess, ein verlässliches Ergebnis.
            </p>

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href="/#kontakt"
                className="btn-primary focus-ring tap-target interactive group w-full text-base sm:w-auto"
              >
                <span>{PRIMARY_CTA_LABEL}</span>
                <ArrowRight className="icon-std transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/mietshop"
                className="btn-secondary focus-ring tap-target interactive w-full text-base sm:w-auto"
              >
                {SECONDARY_CTA_LABEL}
              </a>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-2.5 text-left sm:grid-cols-2 lg:grid-cols-4">
              {proofItems.map((item) => (
                <li key={item.label} className="proof-chip">
                  <item.icon className="icon-std icon-std--sm text-[rgb(var(--accent))]" />
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.12em] text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-100">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="leistungen" className="section-shell scroll-anchor">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-14">
            <h2 className="section-title font-bold">Leistungen fuer Events, die funktionieren sollen</h2>
            <p className="section-copy">
              Problem zuerst, Technik danach: Wir strukturieren Anforderungen und liefern passende Systeme.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 md:gap-6">
            {serviceCards.map((card) => (
              <article key={card.id} className={`glass-panel card interactive-card ${card.layoutClass}`}>
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.14)]">
                  <card.icon className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="mb-3 text-2xl font-bold leading-tight">{card.title}</h3>
                <p className="mb-6 leading-relaxed text-gray-300">{card.description}</p>
                <ul className="space-y-2.5">
                  {card.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm text-gray-100">
                      <CheckCircle2 className="icon-std icon-std--sm text-[rgb(var(--accent))]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
              {PRIMARY_CTA_LABEL}
            </a>
            <a href="/mietshop" className="btn-secondary focus-ring tap-target interactive">
              {SECONDARY_CTA_LABEL}
            </a>
          </div>
        </div>
      </section>

      <section id="prozess" className="section-shell scroll-anchor">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-14">
            <h2 className="section-title font-bold">So laeuft die Zusammenarbeit</h2>
            <p className="section-copy">Ein klarer Ablauf minimiert Reibung am Eventtag.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-5">
            {processSteps.map((step, index) => (
              <article key={step.title} className="glass-panel--soft card-inner interactive-card p-5 md:p-6">
                <div className="mb-4 inline-flex items-center rounded-full border border-[rgb(var(--accent)/0.35)] bg-[rgb(var(--primary)/0.12)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[rgb(var(--accent))]">
                  Schritt {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-300">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="mietshop" className="section-shell scroll-anchor">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-14">
            <h2 className="section-title font-bold">Mietshop Preview</h2>
            <p className="section-copy">
              Schnelle Orientierung zu Kategorien und Einsatzzwecken. Die komplette Auswahl bleibt im Shop.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {shopHighlights.map((item) => (
              <article key={item.title} className="glass-panel--soft card-inner interactive-card p-5 md:p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.14)]">
                  <Layers3 className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-300">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
              {PRIMARY_CTA_LABEL}
            </a>
            <a href="/mietshop" className="btn-secondary focus-ring tap-target interactive">
              {SECONDARY_CTA_LABEL}
            </a>
          </div>
        </div>
      </section>

      <section id="projekte" className="section-shell scroll-anchor">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-14">
            <h2 className="section-title font-bold">Ausgewaehlte Projekte</h2>
            <p className="section-copy">Proof aus realen Produktionen mit unterschiedlichen Anforderungen und Setups.</p>
          </div>

          {isLoadingPreview ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Referenzen werden geladen...</div>
          ) : previewError ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">{previewError}</div>
          ) : projects.length === 0 ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Noch keine Referenzen verfuegbar.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {projects.map((project) => (
                <article key={project.id} className="glass-panel card interactive-card overflow-hidden">
                  <div className="card-inner aspect-video overflow-hidden bg-[rgb(var(--card)/0.55)]">
                    <img
                      src={resolveImageUrl(project.image_url, 'project', project.slug ?? project.title)}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="mb-2 text-xl font-bold">{project.title}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-300">{project.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
              {PRIMARY_CTA_LABEL}
            </a>
            <a href="/mietshop" className="btn-secondary focus-ring tap-target interactive">
              {SECONDARY_CTA_LABEL}
            </a>
          </div>
        </div>
      </section>

      <section id="team" className="section-shell scroll-anchor">
        <div className="content-container">
          <div className="section-head mb-12 md:mb-14">
            <h2 className="section-title font-bold">Team Preview</h2>
            <p className="section-copy">Technik, Organisation und Kommunikation greifen in einem Team ineinander.</p>
          </div>

          {isLoadingPreview ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Team wird geladen...</div>
          ) : previewError ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">{previewError}</div>
          ) : teamMembers.length === 0 ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Teamdaten sind derzeit nicht verfuegbar.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
              {teamMembers.map((member) => (
                <article key={member.id} className="glass-panel card interactive-card overflow-hidden">
                  <div className="card-inner aspect-square overflow-hidden bg-[rgb(var(--card)/0.55)]">
                    <img
                      src={resolveImageUrl(member.image_url, 'team', member.name)}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="mb-3 text-sm font-medium text-[rgb(var(--accent))]">{member.role}</p>
                    {member.bio ? <p className="mb-3 line-clamp-3 text-sm text-gray-300">{member.bio}</p> : null}
                    <p className="text-xs text-gray-300">
                      {member.phone?.trim() ? member.phone : COMPANY_INFO.contact.phone}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
              {PRIMARY_CTA_LABEL}
            </a>
            <a href="/mietshop" className="btn-secondary focus-ring tap-target interactive">
              {SECONDARY_CTA_LABEL}
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="section-shell scroll-anchor">
        <div className="content-container">
          <div className="section-head mb-10 md:mb-12">
            <h2 className="section-title font-bold">Haeufige Fragen</h2>
            <p className="section-copy">Ein FAQ-Datensatz fuer konsistente Antworten im gesamten Marketing-Flow.</p>
          </div>

          <div className="mx-auto max-w-4xl space-y-3 md:space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={faq.question} className="glass-panel--soft card-inner interactive-card overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  aria-expanded={openFaqIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  className="focus-ring tap-target interactive flex w-full items-center justify-between px-5 py-4 text-left hover:bg-card-hover/45 md:px-6 md:py-5"
                >
                  <span className="pr-4 text-lg font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`icon-std text-[rgb(var(--accent))] transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index ? (
                  <div id={`faq-answer-${index}`} className="border-subtle-top px-5 pb-5 leading-relaxed text-gray-200 md:px-6">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakt" className="section-shell scroll-anchor">
        <div className="content-container">
          <div className="section-head mb-10 md:mb-12">
            <h2 className="section-title font-bold">Kontakt und Angebot</h2>
            <p className="section-copy">Ein Formular fuer den Marketing-Flow. Produktspezifische Anfragen bleiben im Mietshop.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:gap-8">
            <aside className="space-y-4 lg:col-span-1">
              <div className="glass-panel--soft card-inner p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--accent)/0.28)] bg-[rgb(var(--primary)/0.12)]">
                  <Phone className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Telefon</h3>
                <a href={COMPANY_INFO.contact.phoneLink} className="interactive-link focus-ring inline-flex rounded px-1 py-0.5 text-gray-200">
                  {COMPANY_INFO.contact.phone}
                </a>
                <p className="mt-2 text-sm text-gray-400">{COMPANY_INFO.businessHours.weekdays}</p>
              </div>

              <div className="glass-panel--soft card-inner p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--accent)/0.28)] bg-[rgb(var(--primary)/0.12)]">
                  <Mail className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="mb-2 text-lg font-bold">E-Mail</h3>
                <a href={COMPANY_INFO.contact.emailLink} className="interactive-link focus-ring inline-flex rounded px-1 py-0.5 text-gray-200">
                  {COMPANY_INFO.contact.email}
                </a>
                <p className="mt-2 text-sm text-gray-400">{RESPONSE_PROMISE}</p>
              </div>

              <div className="glass-panel--soft card-inner p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--accent)/0.28)] bg-[rgb(var(--primary)/0.12)]">
                  <ClipboardList className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Servicegebiet</h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  Berlin und Brandenburg. Einsaetze ausserhalb der Region stimmen wir individuell ab.
                </p>
              </div>
            </aside>

            <div className="lg:col-span-2">
              <div className="glass-panel card p-5 sm:p-6 lg:p-8">
                {submitSuccess ? (
                  <div className="card-inner rounded-xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.1)] p-6 text-center">
                    <h3 className="mb-2 text-2xl font-bold">Anfrage eingegangen</h3>
                    <p className="mx-auto mb-6 max-w-[56ch] text-gray-200">
                      Danke fuer Ihre Anfrage. Wir melden uns in der Regel innerhalb von 24 Stunden zurueck.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="btn-secondary focus-ring tap-target interactive"
                    >
                      Neue Anfrage erfassen
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="home-contact-name" className="mb-2 block text-sm font-medium">
                          Name *
                        </label>
                        <input
                          id="home-contact-name"
                          required
                          value={formData.name}
                          onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                          className="field-control focus-ring"
                        />
                      </div>

                      <div>
                        <label htmlFor="home-contact-email" className="mb-2 block text-sm font-medium">
                          E-Mail *
                        </label>
                        <input
                          id="home-contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                          className="field-control focus-ring"
                        />
                      </div>

                      <div>
                        <label htmlFor="home-contact-phone" className="mb-2 block text-sm font-medium">
                          Telefon
                        </label>
                        <input
                          id="home-contact-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                          className="field-control focus-ring"
                        />
                      </div>

                      <div>
                        <label htmlFor="home-contact-subject" className="mb-2 block text-sm font-medium">
                          Anliegen *
                        </label>
                        <select
                          id="home-contact-subject"
                          required
                          value={formData.subject}
                          onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                          className="field-control focus-ring"
                        >
                          <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                          <option value="Mietshop">Mietshop</option>
                          <option value="Dienstleistung">Dienstleistung</option>
                          <option value="Werkstatt">Werkstatt</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="home-contact-message" className="mb-2 block text-sm font-medium">
                        Nachricht *
                      </label>
                      <textarea
                        id="home-contact-message"
                        required
                        rows={7}
                        value={formData.message}
                        onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                        className="field-control focus-ring min-h-[11rem] resize-none"
                        placeholder="Kurzer Kontext zu Termin, Location und Anforderungen."
                      />
                    </div>

                    <div className="card-inner rounded-lg border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.1)] p-4">
                      <p className="text-sm text-gray-200">{RESPONSE_PROMISE}</p>
                    </div>

                    {submitError ? (
                      <div className="card-inner rounded-lg border border-red-500/35 bg-red-500/10 p-4" role="alert" aria-live="polite">
                        <p className="text-sm text-red-200">{submitError}</p>
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 text-base disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowRight className="icon-std" />
                      <span>{isSubmitting ? 'Wird gesendet...' : PRIMARY_CTA_LABEL}</span>
                    </button>

                    <a href="/mietshop" className="btn-secondary focus-ring tap-target interactive inline-flex w-full justify-center">
                      {SECONDARY_CTA_LABEL}
                    </a>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
