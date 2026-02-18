import { useEffect, useState } from 'react';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { projectRepository } from '../repositories/projectRepository';
import BackButton from '../components/BackButton';
import { resolveImageUrl } from '../utils/image';

interface Project {
  id: string;
  title: string;
  slug?: string | null;
  description: string;
  image_url: string;
  location?: string | null;
  date?: string | null;
  category?: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectRepository.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = Array.from(
    new Set(projects.map(p => p.category).filter(Boolean))
  ) as string[];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="py-14 md:py-20 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="container mx-auto px-4">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8" />
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">Unsere Projekte</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
              Sehen Sie, wie wir Veranstaltungen in Berlin und Brandenburg technisch umgesetzt haben. Von der Planung bis zum Abbau übernehmen wir die Technik, damit Sie sich auf Ihr Event konzentrieren können.
            </p>
          </div>
        </div>
      </section>

      {allCategories.length > 0 && (
        <section className="py-8 bg-card-bg/50 sticky top-20 z-40 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-card-hover text-gray-300 hover:bg-gray-700'
                }`}
              >
                Alle Projekte
              </button>
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-card-hover text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">Keine Projekte mit diesem Filter gefunden.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-card-bg border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 group"
                >
                  <div className="aspect-video bg-gradient-to-br from-card-hover to-card-bg overflow-hidden">
                    <img
                      src={resolveImageUrl(project.image_url, 'project', project.slug ?? project.title)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-6">
                    {project.category && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
                          {project.category}
                        </span>
                      </div>
                    )}

                    <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h2>

                    <div className="space-y-2 mb-4">
                      {project.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location}</span>
                        </div>
                      )}
                      {project.date && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{project.date}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-300 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 md:py-20 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ihr Projekt mit uns?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Lassen Sie uns Ihr nächstes Event gemeinsam planen. Sie erhalten ein klares, unverbindliches Angebot für Technik und Service.
            </p>
            <a
              href="/kontakt"
              className="inline-flex w-full sm:w-auto items-center justify-center space-x-2 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg shadow-lg"
            >
              <span>Unverbindliches Angebot anfragen</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

