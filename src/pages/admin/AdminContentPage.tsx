import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import {
  HOME_CTA_FALLBACK,
  HOME_FAQ_FALLBACK,
  HOME_HERO_FALLBACK,
  HOME_PROCESS_FALLBACK,
  HOME_PROOF_FALLBACK,
  HOME_SERVICES_FALLBACK,
  type HomeCtaContent,
  type HomeFaqContent,
  type HomeHeroContent,
  type HomeProcessContent,
  type HomeProofContent,
  type HomeServicesContent,
  normalizeHomeCtaContent,
  normalizeHomeFaqContent,
  normalizeHomeHeroContent,
  normalizeHomeProcessContent,
  normalizeHomeProofContent,
  normalizeHomeServicesContent,
} from '../../content/siteContent';
import { getContent, upsertContent } from '../../repositories/contentRepository';

type SaveState = {
  section: string | null;
  type: 'success' | 'error' | null;
  message: string | null;
};

type SavingMap = Record<string, boolean>;

const CMS_KEYS = {
  hero: 'home.hero',
  proof: 'home.proof',
  services: 'home.services',
  process: 'home.process',
  faq: 'home.faq',
  cta: 'home.cta',
} as const;

function parseMultiline(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default function AdminContentPage() {
  const { user } = useAuth();
  const [heroContent, setHeroContent] = useState<HomeHeroContent>(HOME_HERO_FALLBACK);
  const [proofContent, setProofContent] = useState<HomeProofContent>(HOME_PROOF_FALLBACK);
  const [servicesContent, setServicesContent] = useState<HomeServicesContent>(HOME_SERVICES_FALLBACK);
  const [processContent, setProcessContent] = useState<HomeProcessContent>(HOME_PROCESS_FALLBACK);
  const [faqContent, setFaqContent] = useState<HomeFaqContent>(HOME_FAQ_FALLBACK);
  const [ctaContent, setCtaContent] = useState<HomeCtaContent>(HOME_CTA_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SavingMap>({});
  const [saveState, setSaveState] = useState<SaveState>({
    section: null,
    type: null,
    message: null,
  });

  useEffect(() => {
    if (!user) {
      window.location.href = '/admin/login';
      return;
    }

    let isMounted = true;

    const loadContent = async () => {
      setLoading(true);
      try {
        const [hero, proof, services, process, faq, cta] = await Promise.all([
          getContent<Record<string, unknown>>(CMS_KEYS.hero),
          getContent<Record<string, unknown>>(CMS_KEYS.proof),
          getContent<Record<string, unknown>>(CMS_KEYS.services),
          getContent<Record<string, unknown>>(CMS_KEYS.process),
          getContent<Record<string, unknown>>(CMS_KEYS.faq),
          getContent<Record<string, unknown>>(CMS_KEYS.cta),
        ]);

        if (!isMounted) {
          return;
        }

        setHeroContent(normalizeHomeHeroContent(hero, HOME_HERO_FALLBACK));
        setProofContent(normalizeHomeProofContent(proof, HOME_PROOF_FALLBACK));
        setServicesContent(normalizeHomeServicesContent(services, HOME_SERVICES_FALLBACK));
        setProcessContent(normalizeHomeProcessContent(process, HOME_PROCESS_FALLBACK));
        setFaqContent(normalizeHomeFaqContent(faq, HOME_FAQ_FALLBACK));
        setCtaContent(normalizeHomeCtaContent(cta, HOME_CTA_FALLBACK));
      } catch (error) {
        console.error('Error loading CMS content:', error);
        if (!isMounted) {
          return;
        }
        setSaveState({
          section: 'load',
          type: 'error',
          message: 'CMS-Inhalte konnten nicht geladen werden.',
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const setSavingState = (key: string, value: boolean) => {
    setSaving((prev) => ({ ...prev, [key]: value }));
  };

  const saveSection = async (sectionKey: string, data: object, sectionLabel: string) => {
    setSavingState(sectionKey, true);
    setSaveState({ section: null, type: null, message: null });

    try {
      await upsertContent(sectionKey, data as Record<string, unknown>);
      setSaveState({
        section: sectionKey,
        type: 'success',
        message: `${sectionLabel} wurde gespeichert.`,
      });
    } catch (error) {
      console.error(`Error saving ${sectionKey}:`, error);
      setSaveState({
        section: sectionKey,
        type: 'error',
        message: `${sectionLabel} konnte nicht gespeichert werden.`,
      });
    } finally {
      setSavingState(sectionKey, false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">CMS-Inhalte werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-bg border-b border-card">
        <div className="content-container py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/admin" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück zum Dashboard</span>
            </a>
            <h1 className="text-white text-xl font-bold">OnePager Content verwalten</h1>
          </div>
        </div>
      </header>

      <main className="content-container py-8 md:py-12 space-y-8">
        {saveState.message ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              saveState.type === 'success'
                ? 'border-green-500/30 bg-green-500/10 text-green-200'
                : 'border-red-500/35 bg-red-500/10 text-red-200'
            }`}
          >
            {saveState.message}
          </div>
        ) : null}

        <section className="glass-panel card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Home Hero (`home.hero`)</h2>
            <button
              type="button"
              onClick={() => {
                if (!heroContent.headline.trim()) {
                  setSaveState({
                    section: CMS_KEYS.hero,
                    type: 'error',
                    message: 'Hero Headline ist erforderlich.',
                  });
                  return;
                }

                void saveSection(CMS_KEYS.hero, heroContent, 'Hero');
              }}
              disabled={Boolean(saving[CMS_KEYS.hero])}
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving[CMS_KEYS.hero] ? 'Speichert...' : 'Hero speichern'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Badge</label>
              <input
                type="text"
                value={heroContent.badge}
                onChange={(event) => setHeroContent((prev) => ({ ...prev, badge: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Headline</label>
              <input
                type="text"
                value={heroContent.headline}
                onChange={(event) => setHeroContent((prev) => ({ ...prev, headline: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Highlight-Text</label>
              <input
                type="text"
                value={heroContent.highlightedText}
                onChange={(event) => setHeroContent((prev) => ({ ...prev, highlightedText: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Subheadline</label>
              <textarea
                rows={4}
                value={heroContent.subheadline}
                onChange={(event) => setHeroContent((prev) => ({ ...prev, subheadline: event.target.value }))}
                className="field-control focus-ring resize-none"
              />
            </div>
          </div>
        </section>

        <section className="glass-panel card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Home Proof (`home.proof`)</h2>
            <button
              type="button"
              onClick={() => {
                const hasInvalid = proofContent.items.some((item) => !item.label.trim() || !item.value.trim());
                if (hasInvalid) {
                  setSaveState({
                    section: CMS_KEYS.proof,
                    type: 'error',
                    message: 'Alle Proof-Felder sind erforderlich.',
                  });
                  return;
                }

                void saveSection(CMS_KEYS.proof, proofContent as unknown as Record<string, unknown>, 'Proof');
              }}
              disabled={Boolean(saving[CMS_KEYS.proof])}
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving[CMS_KEYS.proof] ? 'Speichert...' : 'Proof speichern'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {proofContent.items.map((item, index) => (
              <div key={`${item.label}-${index}`} className="glass-panel--soft card-inner p-4 space-y-3">
                <p className="text-xs uppercase tracking-wider text-gray-400">Item {index + 1}</p>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(event) =>
                      setProofContent((prev) => ({
                        ...prev,
                        items: prev.items.map((entry, itemIndex) =>
                          itemIndex === index ? { ...entry, label: event.target.value } : entry
                        ),
                      }))
                    }
                    className="field-control focus-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Wert</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(event) =>
                      setProofContent((prev) => ({
                        ...prev,
                        items: prev.items.map((entry, itemIndex) =>
                          itemIndex === index ? { ...entry, value: event.target.value } : entry
                        ),
                      }))
                    }
                    className="field-control focus-ring"
                  />
                </div>
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Microline (optional)</label>
              <input
                type="text"
                value={proofContent.microline ?? ''}
                onChange={(event) =>
                  setProofContent((prev) => ({
                    ...prev,
                    microline: event.target.value,
                  }))
                }
                className="field-control focus-ring"
              />
            </div>
          </div>
        </section>

        <section className="glass-panel card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Home Services (`home.services`)</h2>
            <button
              type="button"
              onClick={() => {
                if (!servicesContent.title.trim()) {
                  setSaveState({
                    section: CMS_KEYS.services,
                    type: 'error',
                    message: 'Services-Titel ist erforderlich.',
                  });
                  return;
                }

                void saveSection(CMS_KEYS.services, servicesContent as unknown as Record<string, unknown>, 'Services');
              }}
              disabled={Boolean(saving[CMS_KEYS.services])}
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving[CMS_KEYS.services] ? 'Speichert...' : 'Services speichern'}</span>
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sektionstitel</label>
              <input
                type="text"
                value={servicesContent.title}
                onChange={(event) => setServicesContent((prev) => ({ ...prev, title: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sektionstext</label>
              <textarea
                rows={3}
                value={servicesContent.copy}
                onChange={(event) => setServicesContent((prev) => ({ ...prev, copy: event.target.value }))}
                className="field-control focus-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {servicesContent.cards.map((card, index) => (
                <div key={`${card.title}-${index}`} className="glass-panel--soft card-inner p-4 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Card {index + 1}</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Titel</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(event) =>
                        setServicesContent((prev) => ({
                          ...prev,
                          cards: prev.cards.map((entry, cardIndex) =>
                            cardIndex === index ? { ...entry, title: event.target.value } : entry
                          ),
                        }))
                      }
                      className="field-control focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Beschreibung</label>
                    <textarea
                      rows={4}
                      value={card.description}
                      onChange={(event) =>
                        setServicesContent((prev) => ({
                          ...prev,
                          cards: prev.cards.map((entry, cardIndex) =>
                            cardIndex === index ? { ...entry, description: event.target.value } : entry
                          ),
                        }))
                      }
                      className="field-control focus-ring resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Highlights (eine Zeile pro Eintrag)</label>
                    <textarea
                      rows={4}
                      value={card.highlights.join('\n')}
                      onChange={(event) =>
                        setServicesContent((prev) => ({
                          ...prev,
                          cards: prev.cards.map((entry, cardIndex) =>
                            cardIndex === index ? { ...entry, highlights: parseMultiline(event.target.value) } : entry
                          ),
                        }))
                      }
                      className="field-control focus-ring resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-panel card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Home Prozess (`home.process`)</h2>
            <button
              type="button"
              onClick={() => {
                if (!processContent.title.trim()) {
                  setSaveState({
                    section: CMS_KEYS.process,
                    type: 'error',
                    message: 'Prozess-Titel ist erforderlich.',
                  });
                  return;
                }

                void saveSection(CMS_KEYS.process, processContent as unknown as Record<string, unknown>, 'Prozess');
              }}
              disabled={Boolean(saving[CMS_KEYS.process])}
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving[CMS_KEYS.process] ? 'Speichert...' : 'Prozess speichern'}</span>
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sektionstitel</label>
              <input
                type="text"
                value={processContent.title}
                onChange={(event) => setProcessContent((prev) => ({ ...prev, title: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sektionstext</label>
              <textarea
                rows={3}
                value={processContent.copy}
                onChange={(event) => setProcessContent((prev) => ({ ...prev, copy: event.target.value }))}
                className="field-control focus-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {processContent.steps.map((step, index) => (
                <div key={`${step.title}-${index}`} className="glass-panel--soft card-inner p-4 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Schritt {index + 1}</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Titel</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(event) =>
                        setProcessContent((prev) => ({
                          ...prev,
                          steps: prev.steps.map((entry, stepIndex) =>
                            stepIndex === index ? { ...entry, title: event.target.value } : entry
                          ),
                        }))
                      }
                      className="field-control focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Beschreibung</label>
                    <textarea
                      rows={4}
                      value={step.description}
                      onChange={(event) =>
                        setProcessContent((prev) => ({
                          ...prev,
                          steps: prev.steps.map((entry, stepIndex) =>
                            stepIndex === index ? { ...entry, description: event.target.value } : entry
                          ),
                        }))
                      }
                      className="field-control focus-ring resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-panel card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Home FAQ (`home.faq`)</h2>
            <button
              type="button"
              onClick={() => {
                if (!faqContent.title.trim()) {
                  setSaveState({
                    section: CMS_KEYS.faq,
                    type: 'error',
                    message: 'FAQ-Titel ist erforderlich.',
                  });
                  return;
                }

                void saveSection(CMS_KEYS.faq, faqContent as unknown as Record<string, unknown>, 'FAQ');
              }}
              disabled={Boolean(saving[CMS_KEYS.faq])}
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving[CMS_KEYS.faq] ? 'Speichert...' : 'FAQ speichern'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sektionstitel</label>
              <input
                type="text"
                value={faqContent.title}
                onChange={(event) => setFaqContent((prev) => ({ ...prev, title: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sektionstext</label>
              <input
                type="text"
                value={faqContent.copy}
                onChange={(event) => setFaqContent((prev) => ({ ...prev, copy: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
          </div>
        </section>

        <section className="glass-panel card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Home CTA (`home.cta`)</h2>
            <button
              type="button"
              onClick={() => {
                if (!ctaContent.primaryLabel.trim()) {
                  setSaveState({
                    section: CMS_KEYS.cta,
                    type: 'error',
                    message: 'Primärer CTA-Text ist erforderlich.',
                  });
                  return;
                }

                void saveSection(CMS_KEYS.cta, ctaContent as unknown as Record<string, unknown>, 'CTA');
              }}
              disabled={Boolean(saving[CMS_KEYS.cta])}
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving[CMS_KEYS.cta] ? 'Speichert...' : 'CTA speichern'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primärer CTA</label>
              <input
                type="text"
                value={ctaContent.primaryLabel}
                onChange={(event) => setCtaContent((prev) => ({ ...prev, primaryLabel: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sekundärer CTA</label>
              <input
                type="text"
                value={ctaContent.secondaryLabel}
                onChange={(event) => setCtaContent((prev) => ({ ...prev, secondaryLabel: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rückmeldeversprechen</label>
              <input
                type="text"
                value={ctaContent.responsePromise}
                onChange={(event) => setCtaContent((prev) => ({ ...prev, responsePromise: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kontakt-Sektion Titel</label>
              <input
                type="text"
                value={ctaContent.contactTitle}
                onChange={(event) => setCtaContent((prev) => ({ ...prev, contactTitle: event.target.value }))}
                className="field-control focus-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Kontakt-Sektion Text</label>
              <textarea
                rows={3}
                value={ctaContent.contactCopy}
                onChange={(event) => setCtaContent((prev) => ({ ...prev, contactCopy: event.target.value }))}
                className="field-control focus-ring resize-none"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


