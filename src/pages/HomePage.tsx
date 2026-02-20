import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
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
const HERO_TRUST_STEPS = ['Planung', 'Aufbau', 'Betrieb', 'Abbau'] as const;
const PROJECT_FALLBACK_CHIPS = ['Seit 2014', '90+ Events/Jahr', 'Bis 2.500 Personen', 'Team 6+ (Crew skalierbar)'] as const;
const PROJECT_FALLBACK_SETUPS = [
  {
    title: 'Firmenevent / Konferenz',
    chips: ['Ton + Funk', 'Präsentation', 'Licht-Akzente'],
  },
  {
    title: 'Konzert / Club',
    chips: ['Ton (PA & Monitoring)', 'Lichtshow', 'DJ-Setup'],
  },
  {
    title: 'Outdoor / Zelt',
    chips: ['Strom & Verteilung', 'Bühne', 'Wetterschutz'],
  },
] as const;
const PROJECT_FALLBACK_STANDARDS = [
  'Ein fester Ansprechpartner',
  'Planung & Dokumentation',
  'Timing im Blick (pünktlich zum Einlass)',
  'Rückbau & Übergabe',
] as const;
const TEAM_FALLBACK_CARDS = [
  {
    title: 'Projektleitung',
    points: ['Briefing und Ablaufkoordination', 'Abstimmung mit Location und Gewerken'],
  },
  {
    title: 'Aufbau / Rigging',
    points: ['Strukturierter Aufbau nach Plan', 'Sicheres Rigging & Kabelführung'],
  },
  {
    title: 'Betrieb vor Ort',
    points: ['Technische Betreuung während der Veranstaltung', 'Schnelle Reaktion bei Änderungen'],
  },
] as const;
const TEAM_FALLBACK_STANDARDS = ['Sicherheitscheck', 'Kommunikation', 'Sauberer Abbau', 'Timing'] as const;
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
  },
  {
    title: 'Tontechnik',
    description: 'PA, Monitoring, Funkstrecken und Mischpulte für Sprache und Musik.',
  },
  {
    title: 'Bühne und Infrastruktur',
    description: 'Bühnenmodule, Traversen, Stromverteilung und sichere Verkabelung.',
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
  const trustPromiseText = (proofContent.microline?.trim() || 'Aufbau nach festen Timings – pünktlich zum Einlass.').trim();

  const serviceCards = servicesContent.cards.map((card, index) => ({
    id: `service-${index + 1}`,
    icon: SERVICE_ICONS[index] ?? Sparkles,
    ...card,
  }));
  const featuredServiceIndex = serviceCards.findIndex((card) => {
    const normalizedTitle = card.title.toLowerCase();
    return normalizedTitle.includes('technik') || normalizedTitle.includes('full-service') || normalizedTitle.includes('full service');
  });
  const fallbackFeaturedServiceIndex = serviceCards.length > 1 ? 1 : 0;
  const resolvedFeaturedServiceIndex = featuredServiceIndex >= 0 ? featuredServiceIndex : fallbackFeaturedServiceIndex;
  const featuredServiceCard = serviceCards[resolvedFeaturedServiceIndex] ?? null;
  const secondaryServiceCards = serviceCards
    .filter((_, index) => index !== resolvedFeaturedServiceIndex)
    .slice(0, 2);

  const processSteps = processContent.steps;
  const workflowTitle = processContent.title.trim() || 'So läuft die Zusammenarbeit';
  const workflowSubline =
    processContent.copy.trim() || 'Ein klarer Ablauf sorgt für Planungssicherheit am Veranstaltungstag.';
  const workflowSteps = (processSteps.length > 0 ? processSteps : WORKFLOW_STEP_FALLBACK).slice(0, 4);
  const validProjects = projects.filter(
    (project) => project.title?.trim().length > 0 && project.description?.trim().length > 0
  );
  const validTeamMembers = teamMembers.filter((member) => member.name?.trim().length > 0 && member.role?.trim().length > 0);
  const hasProjects = validProjects.length > 0 && !previewError;
  const hasTeam = validTeamMembers.length > 0 && !previewError;

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

            <p className="hero-copy type-lead mx-auto mb-10 text-gray-300">{heroContent.subheadline}</p>

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
            <div className="hero-trust">
              <div className="hero-trustTop">
                {trustPromiseText ? (
                  <div className="hero-trustChip">
                    <span className="hero-trustChipLabel">Timing-Garantie</span>
                    <span className="hero-trustChipText">{trustPromiseText}</span>
                  </div>
                ) : null}
                <div className="hero-trustSteps" aria-label="So läuft’s in 4 Schritten">
                  <div className="hero-trustStepsLabel">So läuft’s</div>
                  <ol className="hero-trustStepsList">
                    {HERO_TRUST_STEPS.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="hero-proofChips" aria-label="Kennzahlen">
                {proofContent.items.map((item) => (
                  <div key={item.label} className="hero-proofChip">
                    <span className="hero-proofValue">{item.value}</span>
                    <span className="hero-proofLabel">{item.label}</span>
                  </div>
                ))}
              </div>
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

          <div className="services-grid">
            {featuredServiceCard ? (
              <article className="service-card service-card--featured">
                <div className="service-badge">Full-Service</div>
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.14)]">
                  <featuredServiceCard.icon className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-3 font-bold">{featuredServiceCard.title}</h3>
                <p className="type-body mb-6 text-gray-300">{featuredServiceCard.description}</p>
                <ul className="space-y-2.5">
                  {featuredServiceCard.highlights.map((highlight) => (
                    <li key={highlight} className="type-body flex items-center gap-2 text-gray-100">
                      <CheckCircle2 className="icon-std icon-std--sm text-[rgb(var(--accent))]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}

            <div className="services-side">
              {secondaryServiceCards.map((card) => (
                <article key={card.id} className="service-card service-card--secondary">
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
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
              {ctaContent.primaryLabel}
            </a>
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

              <div className="workflow-ctaRow">
                <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
                  {ctaContent.primaryLabel}
                </a>
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
              <article key={item.title} className="glass-panel--soft card-inner interactive-card p-5 md:p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--primary)/0.14)]">
                  <Layers3 className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-2 font-bold">{item.title}</h3>
                <p className="type-body text-gray-300">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
              {ctaContent.primaryLabel}
            </a>
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
              {hasProjects
                ? 'Referenzen aus realen Produktionen mit unterschiedlichen Anforderungen.'
                : 'Typische Setups – Referenzen senden wir gern passend zu Branche und Größe.'}
            </p>
          </div>

          {isLoadingPreview ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Referenzen werden geladen...</div>
          ) : hasProjects ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {validProjects.map((project) => (
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
              ))}
            </div>
          ) : (
            <div className="blueprint-panel blueprint-grid p-5 md:p-7">
              <div className="projects-fallback-layout">
                <div>
                  <h3 className="type-h3 mb-4 font-bold text-gray-100">Typische Setups</h3>
                  <div className="projects-setup-grid">
                    {PROJECT_FALLBACK_SETUPS.map((setup) => (
                      <article key={setup.title} className="setup-card blueprint-corner">
                        <h4 className="type-h3 font-semibold text-gray-100">{setup.title}</h4>
                        <div className="setup-chips mt-3">
                          {setup.chips.map((chip) => (
                            <span key={chip}>{chip}</span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="standards-row standards-row--compact mt-4" aria-label="Kennzahlen">
                    {PROJECT_FALLBACK_CHIPS.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                </div>

                <aside className="standards-box blueprint-corner">
                  <h3 className="type-h3 font-semibold text-gray-100">Das bekommen Sie</h3>
                  <ul className="standards-list">
                    {PROJECT_FALLBACK_STANDARDS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="workflow-ctaRow">
                    <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
                      {ctaContent.primaryLabel}
                    </a>
                    <a href="/mietshop" className="btn-ghost focus-ring tap-target interactive">
                      {ctaContent.secondaryLabel}
                    </a>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {hasProjects ? (
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="/projekte" className="btn-ghost focus-ring tap-target interactive">
                Alle Projekte ansehen
              </a>
              <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
                {ctaContent.primaryLabel}
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <section id="team" className="section-shell section-surface scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">Team im Überblick</h2>
            <p className="section-copy type-lead">
              {hasTeam
                ? 'Kernteam mit klaren Rollen, bei Bedarf skalierbar mit eingespielter Crew.'
                : 'Kernteam ab 6 Personen – je nach Aufbau skalierbar mit eingespielter Crew.'}
            </p>
          </div>

          {isLoadingPreview ? (
            <div className="glass-panel--soft card-inner py-12 text-center text-gray-300">Team wird geladen...</div>
          ) : hasTeam ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
              {validTeamMembers.map((member) => (
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
                    <h3 className="type-h3 font-bold">{member.name}</h3>
                    <p className="mb-3 text-sm font-medium text-[rgb(var(--accent))]">{member.role}</p>
                    {member.bio ? <p className="type-body mb-3 line-clamp-3 text-gray-300">{member.bio}</p> : null}
                    <p className="text-xs text-gray-300">
                      {member.phone?.trim() ? member.phone : COMPANY_INFO.contact.phone}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="blueprint-panel blueprint-grid p-5 md:p-7">
              <h3 className="type-h3 mb-4 font-bold text-gray-100">Team & Zuständigkeiten</h3>
              <div className="team-setup-grid">
                {TEAM_FALLBACK_CARDS.map((item) => (
                  <article key={item.title} className="setup-card blueprint-corner">
                    <h4 className="type-h3 font-semibold text-gray-100">{item.title}</h4>
                    <ul className="standards-list standards-list--tight">
                      {item.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="standards-row mt-4">
                {TEAM_FALLBACK_STANDARDS.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/#kontakt" className="btn-primary focus-ring tap-target interactive">
              {ctaContent.primaryLabel}
            </a>
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
