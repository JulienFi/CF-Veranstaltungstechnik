import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown } from 'lucide-react';
import { COMPANY_INFO } from '../config/company';
import BackButton from '../components/BackButton';
import { trackAnalyticsEvent } from '../lib/analytics';
import { FAQ_ITEMS } from '../content/faq';
import { navigate } from '../lib/navigation';
import { createInquiry } from '../services/inquiryService';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Allgemeine Anfrage',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setLoading(true);

    try {
      const inquiryType =
        formData.subject === 'Mietshop'
          ? 'rental'
          : formData.subject === 'Dienstleistung'
            ? 'service'
            : formData.subject === 'Werkstatt'
              ? 'workshop'
              : 'contact';

      await createInquiry({
        source: 'contact',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        source_url: typeof window !== 'undefined' ? window.location.href : null,
        status: 'new',
      });

      trackAnalyticsEvent('Kontaktformular abgesendet', {
        inquiry_type: inquiryType,
        subject: formData.subject,
      });
      navigate('/danke');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitError('Die Anfrage konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="section-shell section-shell--hero bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8 md:mb-10" />
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="section-title mb-6 font-bold">Kontakt & Angebot</h1>
            <p className="section-copy text-gray-200">
              Sie planen ein Event? Ob Miete im Shop oder Full-Service: Wir erstellen ein klares, unverbindliches Angebot
              – deutschlandweit verfügbar, Schwerpunkt Berlin/Brandenburg.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:gap-8">
            <div className="space-y-6 lg:col-span-1">
              <div className="glass-panel--soft card-inner p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/12">
                  <Phone className="icon-std text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Telefon</h3>
                <a href={COMPANY_INFO.contact.phoneLink} className="interactive-link text-gray-200 hover:text-blue-300">
                  {COMPANY_INFO.contact.phone}
                </a>
                <p className="mt-2 text-sm text-gray-400">{COMPANY_INFO.businessHours.weekdays}</p>
              </div>

              <div className="glass-panel--soft card-inner p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/12">
                  <Mail className="icon-std text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold">E-Mail</h3>
                <a
                  href={COMPANY_INFO.contact.emailLink}
                  className="interactive-link break-all text-gray-200 hover:text-blue-300"
                >
                  {COMPANY_INFO.contact.email}
                </a>
                <p className="mt-2 text-sm text-gray-400">Antwort in der Regel innerhalb von 24 Stunden</p>
              </div>

              <div className="glass-panel--soft card-inner p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/12">
                  <MapPin className="icon-std text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Einsatzgebiet</h3>
                <p className="text-gray-300">Deutschlandweit verfügbar, Schwerpunkt Berlin/Brandenburg.</p>
              </div>

              <div className="glass-panel--soft card-inner p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/12">
                  <Clock className="icon-std text-blue-400" />
                </div>
                <h3 className="mb-3 text-lg font-bold">Erreichbarkeit</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    <div className="font-medium text-white">{COMPANY_INFO.businessHours.weekdays}</div>
                    <div className="mt-1 font-medium text-white">{COMPANY_INFO.businessHours.weekend}</div>
                  </div>
                  <p className="mt-3 text-xs text-gray-400">{COMPANY_INFO.businessHours.note}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glass-panel card p-5 sm:p-6 lg:p-8">
                <h2 className="mb-6 text-2xl font-bold md:text-3xl">Unverbindliches Angebot anfragen</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        className="field-control focus-ring"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">E-Mail *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        className="field-control focus-ring"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        className="field-control focus-ring"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Ich interessiere mich für *</label>
                      <div className="relative">
                        <select
                          required
                          value={formData.subject}
                          onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                          className="field-control focus-ring appearance-none pr-11"
                        >
                          <option value="Mietshop">Mietshop</option>
                          <option value="Dienstleistung">Dienstleistung</option>
                          <option value="Werkstatt">Werkstatt</option>
                          <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                        </select>
                        <ChevronDown
                          className="icon-std pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium">Ihre Nachricht *</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                        rows={8}
                        placeholder="Kurz zu Termin, Ort, Personenzahl und gewünschtem Leistungsumfang."
                        className="field-control focus-ring min-h-[12rem] resize-none"
                      />
                    </div>
                  </div>

                  <div className="card-inner rounded-lg border border-blue-500/25 bg-blue-500/10 p-4">
                    <p className="text-sm text-gray-300">
                      Ihre Anfrage ist unverbindlich. Wir antworten in der Regel innerhalb von 24 Stunden.
                    </p>
                  </div>

                  {submitError && (
                    <div className="card-inner rounded-lg border border-red-500/30 bg-red-500/10 p-4" role="alert" aria-live="polite">
                      <p className="text-sm text-red-300">{submitError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="icon-std" />
                    <span>{loading ? 'Wird gesendet...' : 'Anfrage senden'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-app-bg">
        <div className="content-container">
          <div className="mx-auto max-w-4xl">
            <div className="section-head mb-10">
              <h2 className="section-title font-bold">Häufige Fragen</h2>
              <p className="section-copy">Kompakte Antworten zu Ablauf, Region, Kapazitäten und Timing.</p>
            </div>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="glass-panel--soft card-inner p-6">
                  <h3 className="mb-2 text-lg font-bold">{item.question}</h3>
                  <p className="leading-relaxed text-gray-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6 font-bold">Sie bevorzugen ein Telefongespräch?</h2>
            <p className="section-copy mb-8 text-gray-200">
              Rufen Sie uns direkt an. Wir klären schnell den passenden Technikrahmen für Ihr Event.
            </p>
            <a
              href={COMPANY_INFO.contact.phoneLink}
              className="btn-primary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 sm:w-auto px-8 py-4 text-lg"
            >
              <Phone className="icon-std" />
              <span>Jetzt anrufen: {COMPANY_INFO.contact.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
