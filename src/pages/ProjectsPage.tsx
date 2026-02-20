import { useEffect, useMemo, useState } from 'react';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useSEO } from '../contexts/seo-state';
import { getBaseUrl } from '../lib/site';
import { projectRepository } from '../repositories/projectRepository';
import BackButton from '../components/BackButton';
import { resolveImageUrl } from '../utils/image';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Awaited<ReturnType<typeof projectRepository.getAll>>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { setSEO } = useSEO();

  useEffect(() => {
    const canonical = `${getBaseUrl()}/projekte`;
    setSEO({
      title: 'Projekte und Referenzen | CF Veranstaltungstechnik',
      description:
        'Ausgewählte Referenzen aus realen Produktionen – seit 2014 im Einsatz, rund 90 Events pro Jahr.',
      canonical,
      ogImage: '/images/og-cf-veranstaltungstechnik.jpg',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Projekte',
        description: 'Referenzprojekte von CF Veranstaltungstechnik',
        url: canonical,
      },
    });
  }, [setSEO]);

  useEffect(() => {
    void loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectRepository.getAll();
      setProjects(data.filter((project) => project.is_published !== false));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = useMemo(
    () =>
      Array.from(new Set(projects.map((project) => project.category).filter(Boolean))) as string[],
    [projects]
  );

  const filteredProjects = useMemo(
    () =>
      selectedCategory === 'all'
        ? projects
        : projects.filter((project) => project.category === selectedCategory),
    [projects, selectedCategory]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="glass-panel--soft card px-8 py-6 text-center text-gray-300">Laden...</div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell section-shell--hero bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8 md:mb-10" />
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="section-title mb-6 font-bold">Ausgewählte Projekte</h1>
            <p className="section-copy text-gray-200">
              Von Corporate-Event bis Live-Produktion: reale Einsätze mit unterschiedlichen technischen Anforderungen.
            </p>
          </div>
        </div>
      </section>

      {allCategories.length > 0 ? (
        <section className="section-shell--tight sticky top-[4.7rem] z-40 border-subtle-bottom bg-card-bg/92 py-6 backdrop-blur-sm sm:top-[5rem]">
          <div className="content-container">
            <div className="flex flex-wrap justify-center gap-2.5 md:gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                aria-pressed={selectedCategory === 'all'}
                className={`focus-ring tap-target interactive rounded-lg px-5 py-2.5 text-sm font-medium ${
                  selectedCategory === 'all'
                    ? 'border border-blue-400/70 bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'glass-panel--soft border-subtle text-gray-200 hover:text-white'
                }`}
              >
                Alle Projekte
              </button>
              {allCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`focus-ring tap-target interactive rounded-lg px-5 py-2.5 text-sm font-medium ${
                    selectedCategory === category
                      ? 'border border-blue-400/70 bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'glass-panel--soft border-subtle text-gray-200 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-shell">
        <div className="content-container">
          {filteredProjects.length === 0 ? (
            <div className="glass-panel--soft card py-16 text-center">
              <p className="text-lg text-gray-300 md:text-xl">Keine Projekte mit diesem Filter gefunden.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
              {filteredProjects.map((project) => {
                const detailHref = project.slug ? `/projekte/${project.slug}` : null;

                return (
                  <article key={project.id} className="glass-panel card interactive-card group overflow-hidden">
                    <div className="card-inner aspect-video overflow-hidden bg-gradient-to-br from-card-hover to-card-bg">
                      <img
                        src={resolveImageUrl(project.image_url, 'project', project.slug ?? project.title)}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-6">
                      {project.category ? (
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="card-inner rounded-md bg-blue-500/14 px-2.5 py-1 text-xs font-medium text-blue-300">
                            {project.category}
                          </span>
                        </div>
                      ) : null}

                      <h2 className="mb-3 text-2xl font-bold transition-colors group-hover:text-blue-300">{project.title}</h2>

                      <div className="mb-4 space-y-2">
                        {project.location ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="icon-std icon-std--sm" />
                            <span>{project.location}</span>
                          </div>
                        ) : null}
                        {project.date ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="icon-std icon-std--sm" />
                            <span>{project.date}</span>
                          </div>
                        ) : null}
                      </div>

                      <p className="leading-relaxed text-gray-300 mb-5">{project.description}</p>

                      {detailHref ? (
                        <a href={detailHref} className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2">
                          <span>Projekt ansehen</span>
                          <ArrowRight className="icon-std icon-std--sm" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Detailseite verfügbar, sobald ein Slug gesetzt ist.</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section-shell bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6 font-bold">Ihr Projekt mit uns?</h2>
            <p className="section-copy mb-8 text-gray-200">
              Beschreiben Sie kurz Anlass, Termin und Location. Sie erhalten ein unverbindliches Angebot in der Regel innerhalb von 24 Stunden.
            </p>
            <a
              href="/#kontakt"
              className="btn-primary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 sm:w-auto px-8 py-4 text-lg"
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


