import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { teamRepository } from '../repositories/teamRepository';
import BackButton from '../components/BackButton';
import { resolveImageUrl } from '../utils/image';
import { COMPANY_INFO } from '../config/company';

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
            <h1 className="section-title mb-6 font-bold">Unser Team</h1>
            <p className="section-copy text-gray-200">
              Lernen Sie das Team kennen, das Ihre Veranstaltung in Berlin und Brandenburg technisch absichert. Wir planen präzise, arbeiten verlässlich und entlasten Sie im Ablauf.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
            {team.map((member) => (
              <div key={member.id} className="glass-panel card interactive-card group overflow-hidden">
                <div className="card-inner aspect-square overflow-hidden bg-gradient-to-br from-card-hover to-card-bg">
                  <img
                    src={resolveImageUrl(member.image_url, 'team', member.name)}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-6">
                  <h2 className="mb-1 text-xl font-bold transition-colors group-hover:text-blue-300">{member.name}</h2>
                  <p className="mb-4 text-sm font-medium text-blue-300">{member.role}</p>
                  {member.bio && <p className="mb-4 text-sm leading-relaxed text-gray-300">{member.bio}</p>}
                  <div className="space-y-2 text-xs text-gray-400">
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="icon-std icon-std--sm" />
                        <a href={`mailto:${member.email}`} className="interactive-link hover:text-blue-300">
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="icon-std icon-std--sm" />
                        <a href={`tel:${member.phone}`} className="interactive-link hover:text-blue-300">
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

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="mx-auto max-w-4xl">
            <div className="section-head mb-10">
              <h2 className="section-title font-bold">Was uns auszeichnet</h2>
              <p className="section-copy">Unser Anspruch für Ihr Event</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="glass-panel--soft card-inner p-5 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500/12">
                  <span className="text-2xl font-bold text-blue-300">01</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Expertise</h3>
                <p className="leading-relaxed text-gray-300">
                  Über 10 Jahre kombinierte Erfahrung in allen Bereichen der Veranstaltungstechnik.
                </p>
              </div>

              <div className="glass-panel--soft card-inner p-5 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500/12">
                  <span className="text-2xl font-bold text-blue-300">02</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Kreativität</h3>
                <p className="leading-relaxed text-gray-300">
                  Innovative Lösungen und kreative Konzepte für unvergessliche Events.
                </p>
              </div>

              <div className="glass-panel--soft card-inner p-5 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500/12">
                  <span className="text-2xl font-bold text-blue-300">03</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Zuverlässigkeit</h3>
                <p className="leading-relaxed text-gray-300">
                  Pünktlich, professionell und mit höchstem Qualitätsanspruch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6 font-bold">Sprechen Sie mit uns</h2>
            <p className="section-copy mb-8 text-gray-200">
              Wir beraten Sie persönlich und erstellen ein passendes Technik- und Servicekonzept für Ihr Event.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/kontakt"
                className="btn-primary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 sm:w-auto px-8 py-4 text-lg"
              >
                <Mail className="icon-std" />
                <span>Unverbindliches Angebot anfragen</span>
              </a>
              <a
                href={COMPANY_INFO.contact.phoneLink}
                className="btn-secondary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 sm:w-auto px-8 py-4 text-lg"
              >
                <Phone className="icon-std" />
                <span>{COMPANY_INFO.contact.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
