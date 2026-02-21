import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Layers,
  Lightbulb,
  Mail,
  Phone,
  Sparkles,
  Store,
  Volume2,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
import FadeIn from '../components/FadeIn';
import { useSiteContent } from '../hooks/useSiteContent';
import { trackAnalyticsEvent } from '../lib/analytics';
import { navigate } from '../lib/navigation';
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
    title: 'Mainstage Festival',
    category: 'Festival & Großevent',
    description: 'Komplette technische Ausstattung einer Festival-Hauptbühne. Traversenbau, Line-Array-Beschallung und massives Licht-Setup für 5.000 Besucher.',
    image_url: '',
    slug: null,
  },
  {
    id: 'dummy-project-2',
    title: 'Exklusive Hochzeit',
    category: 'Private Event',
    description: 'Dezente Ambiente-Beleuchtung und glasklare Sprachbeschallung für eine freie Trauung und abendliche Gala.',
    image_url: '',
    slug: null,
  },
  {
    id: 'dummy-project-3',
    title: 'Unternehmenskonferenz',
    category: 'Corporate Event',
    description: 'Bühnenbau, Videotechnik und Streaming-Setup für eine internationale Fachkonferenz mit Live-Schalten.',
    image_url: '',
    slug: null,
  },
];

const TEAM_GRID_FALLBACK: TeamCardItem[] = [
  {
    id: 'dummy-team-1',
    name: 'Max S.',
    role: 'Projektleitung',
    bio: 'Koordiniert Briefing, Ablauf und Abstimmungen mit allen Beteiligten.',
    image_url: null,
  },
  {
    id: 'dummy-team-2',
    name: 'Julia K.',
    role: 'Technikplanung',
    bio: 'Plant passgenaue Setups für Ton, Licht und Bühne auf Basis der Anforderungen.',
    image_url: null,
  },
  {
    id: 'dummy-team-3',
    name: 'Leon M.',
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
    icon: Lightbulb,
  },
  {
    title: 'Tontechnik',
    description: 'PA, Monitoring, Funkstrecken und Mischpulte für Sprache und Musik.',
    categorySlug: 'tontechnik',
    icon: Volume2,
  },
  {
    title: 'Bühne und Infrastruktur',
    description: 'Bühnenmodule, Traversen, Stromverteilung und sichere Verkabelung.',
    categorySlug: 'buehne-infrastruktur',
    icon: Layers,
  },
];

const WORKFLOW_TIMELINE_CONTAINER_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
} as const;

const WORKFLOW_TIMELINE_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
} as const;

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
  const placeholderImages = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  ];
  const teamPlaceholders = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  ];

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
      navigate('/danke');
    } catch (error) {
      console.error('Error submitting onepager inquiry:', error);
      setSubmitError('Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceClick = (title: string) => {
    if (title.includes('Mietshop')) {
      navigate('/mietshop');
      return;
    }

    if (title.includes('Technik')) {
      setFormData((prev) => ({
        ...prev,
        subject: 'Dienstleistung',
        message:
          'Hallo CF-Team,\n\nich plane eine Veranstaltung am [Datum] in [Location] und benötige Unterstützung bei der Technikplanung und Durchführung.\n\nBitte kontaktiert mich für ein erstes Angebot.\n\nViele Grüße',
      }));
      document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (title.includes('Werkstatt')) {
      setFormData((prev) => ({
        ...prev,
        subject: 'Werkstatt',
        message:
          'Hallo CF-Team,\n\nich habe defektes Event-Equipment ([Geräte-Name/Typ]) und benötige eine schnelle Reparatur bzw. Wartung.\n\nBitte kontaktiert mich bezüglich des weiteren Vorgehens.\n\nViele Grüße',
      }));
      document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
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
              <div className="hero-badge mb-6 !px-4 !py-2 !text-sm !text-gray-200 border-white/15 bg-black/50 backdrop-blur-sm">
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

            <p className="hero-copy type-lead mx-auto max-w-[66ch] !text-lg !text-gray-300 sm:!text-xl">
              Miete im Shop oder Full-Service. Wir liefern passgenaue Technik und sorgen für einen reibungslosen Ablauf.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
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
            <div className="hero-proofChips !mt-16" aria-label="Kennzahlen">
              {proofContent.items.map((item) => (
                <div
                  key={item.label}
                  className="hero-proofChip glass-panel--soft !rounded-2xl !border-white/10 !bg-white/5 !px-5 !py-3 transition duration-300 hover:-translate-y-1 hover:!border-white/30"
                >
                  <span className="hero-proofValue !text-sm !font-bold !text-white sm:!text-base">{item.value}</span>
                  <span className="hero-proofLabel !text-xs !text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FadeIn viewport={{ once: true }}>
        <section id="leistungen" className="section-shell section-surface brand-motif brand-motif--left scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">{servicesContent.title}</h2>
            <p className="section-copy type-lead">{servicesContent.copy}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {serviceCards.map((card, index) => (
              <article
                key={card.id}
                className="cursor-pointer group glass-panel--soft border border-white/5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col h-full"
                onClick={() => handleServiceClick(card.title)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleServiceClick(card.title);
                  }
                }}
              >
                <div className="flex h-full flex-col p-6">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] shadow-[0_0_15px_rgb(var(--accent)/0.15)]">
                  <card.icon className="icon-std text-[rgb(var(--accent))]" />
                </div>
                <h3 className="type-h3 mb-3 font-bold">{card.title}</h3>
                <p className={`type-body mb-6 text-gray-300 ${index === 0 ? 'max-w-[50ch]' : ''}`}>{card.description}</p>
                <ul className="space-y-2 sm:space-y-2.5">
                  {card.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-3 text-sm leading-relaxed text-gray-100 sm:text-base">
                      <CheckCircle2 className="icon-std icon-std--sm text-[rgb(var(--accent))]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <span className="text-sm text-[rgb(var(--accent))] opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1 mt-auto pt-4 font-medium">
                  Weiter <ArrowRight size={16} />
                </span>
                </div>
              </article>
            ))}
          </div>

        </div>
        </section>
      </FadeIn>

      <section id="prozess" className="section-shell section-surface section-surface--alt brand-motif scroll-anchor">
        <div className="content-container">
          <div className="workflow-split">
            <div className="workflow-left flex flex-col justify-center space-y-6 lg:space-y-8">
              <h2 className="section-title type-h2 font-bold">{workflowTitle}</h2>
              <p className="workflow-subline type-lead">{workflowSubline}</p>

              <ul className="workflow-bullets gap-4">
                <li className="type-body leading-relaxed text-gray-300">
                  <strong>Klare Zuständigkeiten</strong> – ein Ansprechpartner, sauberer Ablauf.
                </li>
                <li className="type-body leading-relaxed text-gray-300">
                  <strong>Timing im Blick</strong> – Aufbau nach festen Timings, pünktlich zum Einlass.
                </li>
                <li className="type-body leading-relaxed text-gray-300">
                  <strong>Transparentes Angebot</strong> – Umfang, Zeiten und Budget nachvollziehbar.
                </li>
              </ul>

              <div className="workflow-ctaRow self-start">
                <button
                  type="button"
                  onClick={() => handleServiceClick('Technik')}
                  className="btn-primary focus-ring tap-target interactive inline-flex self-start items-center gap-2"
                >
                  <span>Projekt anfragen</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <motion.div
              className="relative pl-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={WORKFLOW_TIMELINE_CONTAINER_VARIANTS}
            >
              <div
                className="absolute left-[1.15rem] top-8 bottom-8 w-px bg-gradient-to-b from-[rgb(var(--accent)/0.5)] via-white/10 to-transparent md:left-[1.65rem]"
                aria-hidden="true"
              />
              <ol className="space-y-4" aria-label="Ablauf in 4 Schritten">
                {workflowSteps.map((step, index) => (
                  <li key={`${step.title}-${index}`} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-6 top-6 h-2.5 w-2.5 rounded-full bg-[rgb(var(--accent))] shadow-[0_0_10px_rgb(var(--accent)/0.6)]"
                    />
                    <motion.article
                      variants={WORKFLOW_TIMELINE_ITEM_VARIANTS}
                      className="glass-panel--soft border border-white/5 p-5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-[rgb(var(--accent))] tracking-[0.14em]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="type-h3 text-white">{step.title}</span>
                      </div>
                      <p className="type-body text-gray-300">{step.description}</p>
                    </motion.article>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      <FadeIn viewport={{ once: true }}>
        <section id="mietshop" className="section-shell section-surface scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">Mietshop im Überblick</h2>
            <p className="section-copy type-lead">
              Die passende Technik für Ihr Projekt. Eine schnelle Übersicht unserer Kategorien – das gesamte Inventar
              erwartet Sie im Shop.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {shopHighlights.map((item) => {
              const ItemIcon = item.icon;
              const categoryHref = `/mietshop?category=${encodeURIComponent(item.categorySlug)}`;

              return (
                <a
                  key={item.title}
                  href={categoryHref}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(categoryHref);
                  }}
                  className="cursor-pointer group glass-panel--soft border border-white/5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col h-full p-5 md:p-6"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] shadow-[0_0_15px_rgb(var(--accent)/0.15)]">
                    <ItemIcon className="h-5 w-5 text-[rgb(var(--accent))]" />
                  </div>
                  <h3 className="type-h3 mb-2 font-bold">{item.title}</h3>
                  <p className="type-body text-gray-300">{item.description}</p>
                  <span className="text-sm text-[rgb(var(--accent))] opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1 mt-auto pt-4 font-medium">
                    Zur Kategorie <ArrowRight size={16} />
                  </span>
                </a>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <a href="/mietshop" className="btn-primary focus-ring tap-target interactive">
              {ctaContent.secondaryLabel}
            </a>
          </div>
        </div>
        </section>
      </FadeIn>

      <FadeIn viewport={{ once: true }}>
        <section id="projekte" className="section-shell section-surface section-surface--alt scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">Ausgewählte Projekte</h2>
            <p className="section-copy type-lead">
              Technik in Aktion. Entdecken Sie eine Auswahl unserer vergangenen Produktionen und Setups.
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
                {projectCards.map((project, index) => {
                  const hasProjectImage = (project.image_url ?? '').trim().length > 0;
                  const projectImageSrc = hasProjectImage
                    ? resolveImageUrl(project.image_url, 'project', project.slug ?? project.title)
                    : null;
                  const displayImage = projectImageSrc || placeholderImages[index % placeholderImages.length];

                  return (
                    <article
                      key={project.id}
                      className="group glass-panel--soft border border-white/5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-full rounded-2xl"
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        <img
                          src={displayImage}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-col flex-grow p-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent))]">
                          {(project.category ?? '').trim() || 'Projekt'}
                        </p>
                        <h3 className="type-h3 mb-2 font-bold">{project.title}</h3>
                        <p className="type-body line-clamp-3 text-gray-300">{project.description}</p>
                        {project.slug ? (
                          <a
                            href={`/projekte/${project.slug}`}
                            className="btn-ghost focus-ring tap-target interactive mt-auto inline-flex"
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
            <a
              href="/projekte"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-base font-medium text-white transition-all duration-300 hover:border-[rgb(var(--accent)/0.5)] hover:bg-[rgb(var(--accent)/0.1)] hover:text-[rgb(var(--accent))] hover:shadow-[0_0_20px_rgb(var(--accent)/0.15)]"
            >
              <span>Alle Projekte ansehen</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
        </section>
      </FadeIn>

      <FadeIn viewport={{ once: true }}>
        <section id="team" className="section-shell section-surface scroll-anchor">
        <div className="content-container">
          <div className="section-head">
            <h2 className="section-title type-h2 font-bold">Team im Überblick</h2>
            <p className="section-copy type-lead">
              Die Köpfe hinter den Kulissen. Ein eingespieltes Team aus erfahrenen Technikern und Projektleitern.
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

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
                {teamCards.map((member, index) => {
                  const hasMemberImage = (member.image_url ?? '').trim().length > 0;
                  const memberImageSrc = hasMemberImage
                    ? resolveImageUrl(member.image_url, 'team', member.name)
                    : null;
                  const displayMemberImage = memberImageSrc || teamPlaceholders[index % teamPlaceholders.length];

                  return (
                    <article
                      key={member.id}
                      className="group glass-panel--soft border border-white/5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center p-8 text-center h-full rounded-2xl"
                    >
                      <img
                        src={displayMemberImage}
                        alt={member.name}
                        loading="lazy"
                        className="h-24 w-24 rounded-full object-cover mb-4 border-2 border-[rgb(var(--accent)/0.3)] transition-transform duration-500 group-hover:scale-105 group-hover:border-[rgb(var(--accent))]"
                      />

                      <h3 className="type-h3 font-bold">{member.name}</h3>
                      <p className="mb-3 text-sm font-medium text-[rgb(var(--accent))]">{member.role}</p>
                      <p className="type-body text-gray-300">{member.bio?.trim() || 'Kurzprofil folgt in Kürze.'}</p>
                    </article>
                  );
                })}
              </div>
            </>
          )}

        </div>
        </section>
      </FadeIn>

      <FadeIn viewport={{ once: true }}>
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
      </FadeIn>

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
              </div>
            </div>
          </div>
        </div>
        <div className="section-bottom-divider" aria-hidden="true"></div>
      </section>
    </div>
  );
}
