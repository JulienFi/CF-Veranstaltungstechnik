import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useSEO } from '../contexts/seo-state';
import { generateEventSchema } from '../lib/seo';
import { getBaseUrl } from '../lib/site';
import { type ProjectDTO, projectRepository } from '../repositories/projectRepository';
import { resolveImageUrl } from '../utils/image';

interface ProjectDetailPageProps {
  slug: string;
}

export default function ProjectDetailPage({ slug }: ProjectDetailPageProps) {
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { setSEO } = useSEO();

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await projectRepository.getBySlug(slug);
        if (!isMounted) {
          return;
        }

        if (!data || data.is_published === false) {
          setProject(null);
          setNotFound(true);
          return;
        }

        setProject(data);
      } catch (error) {
        console.error('Error loading project detail:', error);
        if (!isMounted) {
          return;
        }
        setProject(null);
        setNotFound(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProject();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!project) {
      return;
    }

    const canonical = `${getBaseUrl()}/projekte/${slug}`;
    const description =
      project.description?.trim() ||
      `Projekt-Referenz von CF Veranstaltungstechnik: ${project.title}.`;
    const ogImage = resolveImageUrl(project.image_url, 'project', project.slug ?? project.title);

    setSEO({
      title: `${project.title} | Projekt | CF Veranstaltungstechnik`,
      description,
      canonical,
      ogImage,
      schemaData: generateEventSchema({
        title: project.title,
        description,
        location: project.location?.trim() || 'Berlin und Brandenburg',
      }),
    });
  }, [project, setSEO, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="glass-panel--soft card px-8 py-6 text-center text-gray-300">Projekt wird geladen...</div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-app-bg text-white">
        <section className="section-shell">
          <div className="content-container">
            <BackButton href="/projekte" label="Zurück zu Projekten" className="mb-8" />
            <div className="glass-panel--soft card py-14 text-center">
              <h1 className="text-3xl font-bold mb-4">Projekt nicht gefunden</h1>
              <p className="text-gray-300 mb-8">
                Die gewünschte Projektseite ist nicht verfügbar oder wurde entfernt.
              </p>
              <a href="/projekte" className="btn-secondary focus-ring tap-target interactive inline-flex">
                Zur Projektübersicht
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-white">
      <section className="section-shell section-shell--hero bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <BackButton href="/projekte" label="Zurück zu Projekten" className="mb-8 md:mb-10" />

          <article className="glass-panel card overflow-hidden">
            <div className="card-inner aspect-[16/8] overflow-hidden bg-[rgb(var(--card)/0.55)]">
              <img
                src={resolveImageUrl(project.image_url, 'project', project.slug ?? project.title)}
                alt={project.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>

            <div className="pt-6 space-y-4">
              {project.category ? (
                <span className="inline-flex rounded-md bg-blue-500/14 px-2.5 py-1 text-xs font-medium text-blue-300">
                  {project.category}
                </span>
              ) : null}

              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{project.title}</h1>

              <div className="flex flex-col gap-2 text-sm text-gray-300 sm:flex-row sm:gap-6">
                {project.location ? (
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="icon-std icon-std--sm" />
                    <span>{project.location}</span>
                  </div>
                ) : null}
                {project.date ? (
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="icon-std icon-std--sm" />
                    <span>{project.date}</span>
                  </div>
                ) : null}
              </div>

              <p className="text-gray-200 leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          <div className="glass-panel--soft card text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ähnliches Projekt geplant?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Beschreiben Sie Ihre Anforderungen. Wir erstellen ein unverbindliches Angebot in der Regel innerhalb von 24 Stunden.
            </p>
            <a
              href="/#kontakt"
              className="btn-primary focus-ring tap-target interactive inline-flex items-center justify-center gap-2"
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
