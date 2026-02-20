import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  ImageOff,
  Layers3,
  Mail,
  Phone,
  Sparkles,
  Store,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FAQ_ITEMS } from '../content/faq';
import {
  HOME_CTA_FALLBACK,
  HOME_FAQ_FALLBACK,
  HOME_HERO_FALLBACK,
  HOME_PROCESS_FALLBACK,
  HOME_PROOF_FALLBACK,
  HOME_SERVICES_FALLBACK,
  normalizeHomeCtaContent,
  normalizeHomeFaqContent,
  normalizeHomeHeroContent,
  normalizeHomeProcessContent,
  normalizeHomeProofContent,
  normalizeHomeServicesContent,
} from '../content/siteContent';
import { COMPANY_INFO } from '../config/company';
import { useSiteContent } from '../hooks/useSiteContent';
import { trackAnalyticsEvent } from '../lib/analytics';
import { type ProjectDTO, projectRepository } from '../repositories/projectRepository';
import { type TeamMemberDTO, teamRepository } from '../repositories/teamRepository';
import { createInquiry } from '../services/inquiryService';
import { resolveImageUrl } from '../utils/image';

const SERVICE_ICONS = [Store, Sparkles, Wrench] as const;
type ProjectCardItem = Pick<ProjectDTO, 'id' | 'title' | 'description' | 'image_url' | 'category' | 'slug'>;
type TeamCardItem = Pick<TeamMemberDTO, 'id' | 'name' | 'role' | 'bio' | 'image_url'>;

const PROJECT_GRID_FALLBACK: ProjectCardItem[] = [
  {
    id: 'dummy-project-1',
    title: 'Muster-Projekt 1',
    category: 'Corporate Event',
    description: 'Technikpaket für ein Firmenevent mit klarer Ablaufplanung und verlässlicher Betreuung.',
    image_url: '',
    slug: null,
  },
  {
    id: 'dummy-project-2',
    title: 'Muster-Projekt 2',
    category: 'Live & Konzert',
    description: 'Ton-, Licht- und Bühnen-Setup für ein kompaktes Live-Format inklusive Vor-Ort-Begleitung.',
    image_url: '',
    slug: null,
  },
  {
    id: 'dummy-project-3',
    title: 'Muster-Projekt 3',
    category: 'Outdoor',
    description: 'Wetterfestes Event-Setup mit Fokus auf Strom, Sicherheit und pünktlichem Betriebsstart.',
    image_url: '',
    slug: null,
  },
];

const TEAM_GRID_FALLBACK: TeamCardItem[] = [
  {
    id: 'dummy-team-1',
    name: 'Max Mustermann',
    role: 'Projektleitung',
    bio: 'Koordiniert Briefing, Ablauf und Abstimmungen mit allen Beteiligten.',
    image_url: null,
  },
  {
    id: 'dummy-team-2',
    name: 'Julia Beispiel',
    role: 'Technikplanung',
    bio: 'Plant passgenaue Setups für Ton, Licht und Bühne auf Basis der Anforderungen.',
    image_url: null,
  },
  {
    id: 'dummy-team-3',
    name: 'Leon Muster',
    role: 'Aufbau & Betrieb',
    bio: 'Sorgt für einen strukturierten Aufbau und einen stabilen Betrieb vor Ort.',
    image_url: null,
  },
];
const WORKFLOW_STEP_FALLBACK = [
  {
    title: 'Anfrage & Zielklärung',
    description: 'Anlass, Termin, Ort, Ziel – wir klären Anforderungen und Prioritäten.',
  },
  {
    title: 'Konzept & Angebot',
    description: 'Setup, Leistungsumfang und Zeitplan – als transparentes Angebot.',
  },
  {
    title: 'Aufbau & Betrieb',
    description: 'Aufbau nach Plan und Betrieb vor Ort – pünktlich zum Einlass.',
  },
  {
    title: 'Abbau & Abschluss',
    description: 'Rückbau, Übergabe und offene Punkte sauber abschließen.',
  },
] as const;

const shopHighlights = [
  {
    title: 'Lichttechnik',
    description: 'Moving Heads, Washes, Spots und Ambient-Licht für klare Stimmung und Führung.',
    categorySlug: 'lichttechnik',
  },
  {
    title: 'Tontechnik',
    description: 'PA, Monitoring, Funkstrecken und Mischpulte für Sprache und Musik.',
    categorySlug: 'tontechnik',
  },
  {
    title: 'Bühne und Infrastruktur',
    description: 'Bühnenmodule, Traversen, Stromverteilung und sichere Verkabelung.',
    categorySlug: 'buehne-infrastruktur',
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

function getPrefilledContactSubject(): ContactFormState['subject'] {
  if (typeof window === 'undefined') {
    return DEFAULT_FORM_STATE.subject;
  }

  const subjectParam = (new URLSearchParams(window.location.search).get('subject') ?? '').trim().toLowerCase();

  if (subjectParam === 'mietshop') {
    return 'Mietshop';
  }

  if (subjectParam === 'dienstleistung' || subjectParam === 'service' || subjectParam === 'projekt') {
    return 'Dienstleistung';
  }

  if (subjectParam === 'werkstatt') {
    return 'Werkstatt';
  }

  return DEFAULT_FORM_STATE.subject;
}

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDTO[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ContactFormState>(() => ({
    ...DEFAULT_FORM_STATE,
    subject: getPrefilledContactSubject(),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { data: heroContent } = useSiteContent('home.hero', HOME_HERO_FALLBACK, normalizeHomeHeroContent);
  const { data: proofContent } = useSiteContent('home.proof', HOME_PROOF_FALLBACK, normalizeHomeProofContent);
  const { data: servicesContent } = useSiteContent('home.services', HOME_SERVICES_FALLBACK, normalizeHomeServicesContent);
  const { data: processContent } = useSiteContent('home.process', HOME_PROCESS_FALLBACK, normalizeHomeProcessContent);
  const { data: faqContent } = useSiteContent('home.faq', HOME_FAQ_FALLBACK, normalizeHomeFaqContent);
  const { data: ctaContent } = useSiteContent('home.cta', HOME_CTA_FALLBACK, normalizeHomeCtaContent);

  const heroBadge = heroContent.badge.trim();
  const heroSubheadline = heroContent.subheadline.trim();
  const heroBadgeLower = heroBadge.toLowerCase();
  const heroSubheadlineLower = heroSubheadline.toLowerCase();
  const hasMatchingRegionCopy =
    heroBadgeLower.includes('deutschlandweit') &&
    heroSubheadlineLower.includes('deutschlandweit') &&
    ((heroBadgeLower.includes('berlin') && heroSubheadlineLower.includes('berlin')) ||
      (heroBadgeLower.includes('brandenburg') && heroSubheadlineLower.includes('brandenburg')));
  const isDuplicateBadge = heroBadgeLower === heroSubheadlineLower;
  const shouldShowHeroBadge = heroBadge.length > 0 && !hasMatchingRegionCopy && !isDuplicateBadge;
  const serviceCards = servicesContent.cards
    .map((card, index) => ({
      id: `service-${index + 1}`,
      icon: SERVICE_ICONS[index] ?? Sparkles,
      ...card,
    }))
    .slice(0, 3);

  const processSteps = processContent.steps;
  const workflowTitle = processContent.title.trim() || 'So läuft die Zusammenarbeit';
  const workflowSubline =
    processContent.copy.trim() || 'Ein klarer Ablauf sorgt für Planungssicherheit am Veranstaltungstag.';
  const workflowSteps = (processSteps.length > 0 ? processSteps : WORKFLOW_STEP_FALLBACK).slice(0, 4);
  const validProjects = projects.filter(
    (project) => project.title?.trim().length > 0 && project.description?.trim().length > 0
  );
  const validTeamMembers = teamMembers.filter((member) => member.name?.trim().length > 0 && member.role?.trim().length > 0);
  const projectCards: ProjectCardItem[] = projects.length === 0 ? PROJECT_GRID_FALLBACK : validProjects;
  const teamCards: TeamCardItem[] = teamMembers.length === 0 ? TEAM_GRID_FALLBACK : validTeamMembers;
  const isUsingProjectFallback = projects.length === 0;
  const isUsingTeamFallback = teamMembers.length === 0;

  useEffect(() => {
    let isMounted = true;

    const loadPreviewData = async () => {
      try {
        const [projectData, teamData] = await Promise.all([
          projectRepository.getAll(),
          teamRepository.getAll(),
        ]);

        if (!isMounted) return;

        const visibleProjects = projectData.filter((project) => project.is_published !== false);
        setProjects(visibleProjects.slice(0, 3));
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
      await createInquiry({
        source: 'home',
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        source_url: typeof window !== 'undefined' ? window.location.href : null,
        status: 'new',
      });

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
      <section id="home-hero" className="section-shell section-shell--hero relative flex min-h-[74vh] items-center overflow-hidden scroll-anchor">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-app-bg/25 to-app-bg/72"></div>
        <div aria-hidden="true" className="hero-spotlight pointer-events-none absolute inset-0"></div>
        <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[820px] -translate-x-1/2 rounded-full bg-[rgb(var(--primary)/0.2)] blur-[120px]"></div>
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE0NSwgMTk2LCAyMjMsIDAuMDYpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-25"></div>

        <div className="content-container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {shouldShowHeroBadge ? (
              <div className="hero-badge mb-6">
                <span className="hero-badge-dot" aria-hidden="true"></span>
                <span>{heroBadge}</span>
              </div>
            ) : null}

            <h1 className="hero-title type-h1 text-glow mb-6 font-bold">
              {heroContent.headline}
              {heroContent.highlightedText.trim() ? (
                <>
                  {' '}
                  <br className="hidden md:block" />
                  <span className="text-transparent bg-gradient-to-b from-white to-white/55 bg-clip-text">
                    {heroContent.highlightedText}
                  </span>
                </>
              ) : null}
            </h1>

            <p className="hero-copy type-lead mx-auto mb-10 max-w-[66ch] text-gray-300">
              Miete im Shop oder Full-Service. Wir liefern passgenaue Technik und sorgen für einen reibungslosen Ablauf.
            </p>

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href="/#kontakt"
                className="btn-primary focus-ring tap-target interactive group w-full text-base sm:w-auto"
              >
                <span>{ctaContent.primaryLabel}</span>
                <ArrowRight className="icon-std transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/mietshop"
                className="btn-ghost focus-ring tap-target interactive w-full text-base sm:w-auto"
              >
                {ctaContent.secondaryLabel}
              </a>
            </div>
            <div className="hero-proofChips !mt-12" aria-label="Kennzahlen">
              {proofContent.items.map((item) => (
                <div key={item.label} className="hero-proofChip">
                  <span className="hero-proofValue !text-xs sm:!text-sm">{item.value}</span>
                  <span className="hero-proofLabel !text-xs sm:!text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="leistungen" className="section-shell section-surface brand-motif brand-motif--left scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">{servicesContent.title}</h2>
            <p className="section-copy type-lead">{servicesContent.copy}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {serviceCards.map((card) => (
              <article key={card.id} className="service-card">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.14)]">
                  <card.icon className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-3 font-bold">{card.title}</h3>
                <p className="type-body mb-6 text-gray-300">{card.description}</p>
                <ul className="space-y-2.5">
                  {card.highlights.map((highlight) => (
                    <li key={highlight} className="type-body flex items-center gap-2 text-gray-100">
                      <CheckCircle2 className="icon-std icon-std--sm text-[rgb(var(--accent))]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a href="/mietshop" className="btn-ghost focus-ring tap-target interactive">
              {ctaContent.secondaryLabel}
            </a>
          </div>
        </div>
      </section>

      <section id="prozess" className="section-shell section-surface section-surface--alt brand-motif scroll-anchor">
        <div className="content-container">
          <div className="workflow-split">
            <div className="workflow-left">
              <h2 className="section-title type-h2 font-bold">{workflowTitle}</h2>
              <p className="workflow-subline type-lead">{workflowSubline}</p>

              <ul className="workflow-bullets">
                <li className="type-body">
                  <strong>Klare Zuständigkeiten</strong> – ein Ansprechpartner, sauberer Ablauf.
                </li>
                <li className="type-body">
                  <strong>Timing im Blick</strong> – Aufbau nach festen Timings, pünktlich zum Einlass.
                </li>
                <li className="type-body">
                  <strong>Transparentes Angebot</strong> – Umfang, Zeiten und Budget nachvollziehbar.
                </li>
              </ul>

              <div className="workflow-ctaRow justify-center">
                <a href="/mietshop" className="btn-ghost focus-ring tap-target interactive">
                  {ctaContent.secondaryLabel}
                </a>
              </div>
            </div>

            <ol className="workflow-stepper" aria-label="Ablauf in 4 Schritten">
              {workflowSteps.map((step, index) => (
                <li key={`${step.title}-${index}`} className="workflow-step">
                  <div className="workflow-stepRail" aria-hidden="true">
                    <div className="workflow-stepDot" />
                    <div className="workflow-stepLine" />
                  </div>

                  <div className="workflow-stepBody">
                    <div className="workflow-stepMeta">
                      <span className="workflow-stepNum">{String(index + 1).padStart(2, '0')}</span>
                      <span className="workflow-stepTitle type-h3">{step.title}</span>
                    </div>
                    <p className="workflow-stepDesc type-body">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="mietshop" className="section-shell section-surface scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">Mietshop im Überblick</h2>
            <p className="section-copy type-lead">
              Eine schnelle Orientierung zu Kategorien und Einsatzbereichen. Die komplette Auswahl bleibt im Shop.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {shopHighlights.map((item) => (
              <a
                key={item.title}
                href={`/mietshop?category=${encodeURIComponent(item.categorySlug)}`}
                className="glass-panel--soft card-inner interactive-card block p-5 md:p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.14)]">
                  <Layers3 className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-2 font-bold">{item.title}</h3>
                <p className="type-body text-gray-300">{item.description}</p>
              </a>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a href="/mietshop" className="btn-ghost focus-ring tap-target interactive">
              {ctaContent.secondaryLabel}
            </a>
          </div>
        </div>
      </section>

      <section id="projekte" className="section-shell section-surface section-surface--alt scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">Ausgewählte Projekte</h2>
            <p className="section-copy type-lead">
              {isUsingProjectFallback
                ? 'Beispielhafte Kartenansicht im Leerlauf – sobald Projekte gepflegt sind, erscheinen hier die echten Referenzen.'
                : 'Referenzen aus realen Produktionen mit unterschiedlichen Anforderungen.'}
            </p>
          </div>

          {isLoadingPreview ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Referenzen werden geladen...</div>
          ) : (
            <>
              {previewError ? (
                <div className="card-inner mb-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  {previewError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projectCards.map((project) => {
                  const hasProjectImage = (project.image_url ?? '').trim().length > 0;
                  const projectImageSrc = hasProjectImage
                    ? resolveImageUrl(project.image_url, 'project', project.slug ?? project.title)
                    : null;

                  return (
                    <article key={project.id} className="glass-panel card interactive-card group overflow-hidden">
                      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800">
                        {projectImageSrc ? (
                          <img
                            src={projectImageSrc}
                            alt={project.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="icon-std icon-std--lg text-slate-600" />
                          </div>
                        )}
                      </div>

                      <div className="pt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent))]">
                          {(project.category ?? '').trim() || 'Projekt'}
                        </p>
                        <h3 className="type-h3 mb-2 font-bold">{project.title}</h3>
                        <p className="type-body line-clamp-3 text-gray-300">{project.description}</p>
                        {project.slug ? (
                          <a
                            href={`/projekte/${project.slug}`}
                            className="btn-ghost focus-ring tap-target interactive mt-4 inline-flex"
                          >
                            Projekt ansehen
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-10 flex justify-center">
            <a href="/projekte" className="btn-ghost focus-ring tap-target interactive">
              Alle Projekte ansehen
            </a>
          </div>
        </div>
      </section>

      <section id="team" className="section-shell section-surface scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">Team im Überblick</h2>
            <p className="section-copy type-lead">
              {isUsingTeamFallback
                ? 'Beispielhafte Teamkarten im Leerlauf – sobald Teammitglieder gepflegt sind, wird hier das echte Team gezeigt.'
                : 'Kernteam mit klaren Rollen, bei Bedarf skalierbar mit eingespielter Crew.'}
            </p>
          </div>

          {isLoadingPreview ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Team wird geladen...</div>
          ) : (
            <>
              {previewError ? (
                <div className="card-inner mb-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  {previewError}
                </div>
              ) : null}

              <div className="mx-auto grid max-w-6xl grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teamCards.map((member) => {
                  const hasMemberImage = (member.image_url ?? '').trim().length > 0;
                  const memberImageSrc = hasMemberImage
                    ? resolveImageUrl(member.image_url, 'team', member.name)
                    : null;

                  return (
                    <article key={member.id} className="glass-panel card interactive-card group p-6 text-center">
                      <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border border-[rgb(var(--accent)/0.35)] bg-slate-800">
                        {memberImageSrc ? (
                          <img
                            src={memberImageSrc}
                            alt={member.name}
                            loading="lazy"
                            className="h-32 w-32 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="icon-std icon-std--lg text-slate-600" />
                          </div>
                        )}
                      </div>

                      <h3 className="type-h3 font-bold">{member.name}</h3>
                      <p className="mb-3 text-sm font-medium text-[rgb(var(--accent))]">{member.role}</p>
                      <p className="type-body text-gray-300">{member.bio?.trim() || 'Kurzprofil folgt in Kürze.'}</p>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-10 flex justify-center">
            <a href="/mietshop" className="btn-ghost focus-ring tap-target interactive">
              {ctaContent.secondaryLabel}
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="section-shell section-surface section-surface--alt scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">{faqContent.title}</h2>
            <p className="section-copy type-lead">{faqContent.copy}</p>
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

      <section id="kontakt" className="section-shell section-surface brand-motif brand-motif--right scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">{ctaContent.contactTitle}</h2>
            <p className="section-copy type-lead">{ctaContent.contactCopy}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:gap-8">
            <aside className="space-y-4 lg:col-span-1">
              <div className="glass-panel--soft card-inner p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--accent)/0.28)] bg-[rgb(var(--primary)/0.12)]">
                  <Phone className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-2 font-bold">Telefon</h3>
                <a href={COMPANY_INFO.contact.phoneLink} className="interactive-link focus-ring inline-flex rounded px-1 py-0.5 text-gray-200">
                  {COMPANY_INFO.contact.phone}
                </a>
                <p className="mt-2 text-sm text-gray-400">{COMPANY_INFO.businessHours.weekdays}</p>
              </div>

              <div className="glass-panel--soft card-inner p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--accent)/0.28)] bg-[rgb(var(--primary)/0.12)]">
                  <Mail className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-2 font-bold">E-Mail</h3>
                <a href={COMPANY_INFO.contact.emailLink} className="interactive-link focus-ring inline-flex rounded px-1 py-0.5 text-gray-200">
                  {COMPANY_INFO.contact.email}
                </a>
                <p className="mt-2 text-sm text-gray-400">{ctaContent.responsePromise}</p>
              </div>

              <div className="glass-panel--soft card-inner p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--accent)/0.28)] bg-[rgb(var(--primary)/0.12)]">
                  <ClipboardList className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-2 font-bold">Servicegebiet</h3>
                <p className="type-body text-gray-300">
                  Deutschlandweit verfügbar, Schwerpunkt Berlin/Brandenburg.
                </p>
              </div>
            </aside>

            <div className="lg:col-span-2">
              <div className="glass-panel card p-5 sm:p-6 lg:p-8">
                {submitSuccess ? (
                  <div className="card-inner rounded-xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.1)] p-6 text-center">
                    <h3 className="type-h3 mb-2 font-bold">Anfrage eingegangen</h3>
                    <p className="type-body mx-auto mb-6 max-w-[56ch] text-gray-200">
                      Danke für Ihre Anfrage. Wir melden uns in der Regel innerhalb von 24 Stunden zurück.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="btn-ghost focus-ring tap-target interactive"
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
                        <div className="relative">
                          <select
                            id="home-contact-subject"
                            required
                            value={formData.subject}
                            onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                            className="field-control focus-ring appearance-none pr-11"
                          >
                            <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                            <option value="Mietshop">Mietshop</option>
                            <option value="Dienstleistung">Dienstleistung</option>
                            <option value="Werkstatt">Werkstatt</option>
                          </select>
                          <ChevronDown
                            className="icon-std pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
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
                      <p className="text-sm text-gray-200">{ctaContent.responsePromise}</p>
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
                      <span>{isSubmitting ? 'Wird gesendet...' : ctaContent.primaryLabel}</span>
                    </button>

                    <a href="/mietshop" className="btn-ghost focus-ring tap-target interactive inline-flex w-full justify-center">
                      {ctaContent.secondaryLabel}
                    </a>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="section-bottom-divider" aria-hidden="true"></div>
      </section>
    </div>
  );
}
