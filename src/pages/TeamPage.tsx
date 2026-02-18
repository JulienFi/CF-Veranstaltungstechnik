import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { teamRepository } from '../repositories/teamRepository';
import BackButton from '../components/BackButton';
import { resolveImageUrl } from '../utils/image';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  image_url?: string | null;
  email?: string | null;
  phone?: string | null;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const data = await teamRepository.getAll();
      setTeam(data);
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">Unser Team</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
              Lernen Sie das Team kennen, das Ihre Veranstaltung in Berlin und Brandenburg technisch absichert. Wir planen präzise, arbeiten verlässlich und entlasten Sie im Ablauf.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-card-bg border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 group"
              >
                                <div className="aspect-square bg-gradient-to-br from-card-hover to-card-bg overflow-hidden">
                  <img
                    src={resolveImageUrl(member.image_url, 'team', member.name)}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
                    {member.name}
                  </h2>
                  <p className="text-blue-400 text-sm font-medium mb-4">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {member.bio}
                    </p>
                  )}
                  <div className="space-y-2 text-xs text-gray-400">
                    {member.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${member.email}`} className="hover:text-blue-400 transition-colors">
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${member.phone}`} className="hover:text-blue-400 transition-colors">
                          {member.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Was uns auszeichnet</h2>
              <p className="text-xl text-gray-400">Unser Anspruch für Ihr Event</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-400">01</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Expertise</h3>
                <p className="text-gray-400 leading-relaxed">
                  Über 10 Jahre kombinierte Erfahrung in allen Bereichen der Veranstaltungstechnik.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-400">02</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Kreativität</h3>
                <p className="text-gray-400 leading-relaxed">
                  Innovative Lösungen und kreative Konzepte für unvergessliche Events.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-400">03</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Zuverlässigkeit</h3>
                <p className="text-gray-400 leading-relaxed">
                  Pünktlich, professionell und mit höchstem Qualitätsanspruch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Sprechen Sie mit uns</h2>
            <p className="text-xl text-gray-300 mb-8">
              Wir beraten Sie persönlich und erstellen ein passendes Technik- und Servicekonzept für Ihr Event.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/kontakt"
                className="inline-flex w-full sm:w-auto items-center justify-center space-x-2 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg"
              >
                <Mail className="w-5 h-5" />
                <span>Unverbindliches Angebot anfragen</span>
              </a>
              <a
                href="tel:+4989123456"
                className="inline-flex w-full sm:w-auto items-center justify-center space-x-2 px-8 py-4 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-semibold text-lg border border-gray-700"
              >
                <Phone className="w-5 h-5" />
                <span>+49 89 123 456</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

