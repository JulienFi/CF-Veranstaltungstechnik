import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { COMPANY_INFO } from '../config/company';
import BackButton from '../components/BackButton';
import { trackAnalyticsEvent } from '../lib/analytics';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Allgemeine Anfrage',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const faqItems = [
    {
      question: 'Wie viel Vorlaufzeit ist sinnvoll?',
      answer:
        'Für kleinere Events reicht oft ein kurzer Vorlauf. Bei grösseren Veranstaltungen empfehlen wir 3 bis 6 Wochen, damit Technik und Ablauf sauber geplant werden können.',
    },
    {
      question: 'Übernehmen Sie Aufbau und Abbau?',
      answer:
        'Ja. Wir übernehmen auf Wunsch Lieferung, Aufbau, technische Betreuung während des Events und den kompletten Abbau.',
    },
    {
      question: 'In welchem Gebiet sind Sie aktiv?',
      answer:
        'Unser Schwerpunkt liegt auf Berlin und Brandenburg. Einsätze ausserhalb der Region prüfen wir gerne individuell.',
    },
    {
      question: 'Arbeiten Sie für Privat- und Geschäftskunden?',
      answer:
        'Ja. Wir betreuen private Feiern, Vereine und Unternehmen mit passendem Technik- und Serviceumfang.',
    },
    {
      question: 'Wie funktioniert die Preisgestaltung?',
      answer:
        'Je nach Anfrage arbeiten wir mit ab-Preisen bzw. Richtwerten. Das finale Angebot richtet sich nach Technikumfang, Laufzeit, Logistik und Betreuungsbedarf.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const { error } = await supabase.from('inquiries').insert({
        inquiry_type: inquiryType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `${formData.subject}: ${formData.message}`,
        status: 'new',
      });

      if (error) throw error;

      trackAnalyticsEvent('Kontaktformular abgesendet', {
        inquiry_type: inquiryType,
        subject: formData.subject,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitError('Die Anfrage konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-app-bg text-white min-h-screen flex items-center justify-center p-4">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Ihre Anfrage ist bei uns eingegangen</h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Vielen Dank für Ihr Vertrauen. Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium">
                Zur Startseite
              </a>
              <a
                href="/mietshop"
                className="px-6 py-3 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
              >
                Zum Mietshop
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen">
      <section className="py-14 md:py-20 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="container mx-auto px-4">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8" />
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">Kontakt & Angebot</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
              Sie planen ein Event in Berlin oder Brandenburg? Senden Sie uns kurz Ihre Anforderungen. Wir übernehmen die Technik und erstellen ein klares, unverbindliches Angebot.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card-bg border border-gray-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Telefon</h3>
                <a href={COMPANY_INFO.contact.phoneLink} className="text-gray-300 hover:text-blue-400 transition-colors">
                  {COMPANY_INFO.contact.phone}
                </a>
                <p className="text-sm text-gray-500 mt-2">{COMPANY_INFO.businessHours.weekdays}</p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">E-Mail</h3>
                <a
                  href={COMPANY_INFO.contact.emailLink}
                  className="text-gray-300 hover:text-blue-400 transition-colors break-all"
                >
                  {COMPANY_INFO.contact.email}
                </a>
                <p className="text-sm text-gray-500 mt-2">Antwort in der Regel innerhalb von 24h</p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Adresse</h3>
                <p className="text-gray-300">
                  {COMPANY_INFO.address.street}
                  <br />
                  {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}
                  <br />
                  {COMPANY_INFO.address.country}
                </p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-3">Erreichbarkeit</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    <div className="text-white font-medium">{COMPANY_INFO.businessHours.weekdays}</div>
                    <div className="text-white font-medium mt-1">{COMPANY_INFO.businessHours.weekend}</div>
                  </div>
                  <p className="text-gray-500 text-xs mt-3">{COMPANY_INFO.businessHours.note}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-card-bg border border-gray-800 rounded-xl p-5 sm:p-6 lg:p-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Unverbindliches Angebot anfragen</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">E-Mail *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Ich interessiere mich für *</label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      >
                        <option value="Mietshop">Mietshop</option>
                        <option value="Dienstleistung">Dienstleistung</option>
                        <option value="Werkstatt">Werkstatt</option>
                        <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Ihre Nachricht *</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={8}
                        placeholder="Beschreiben Sie kurz Ihr Anliegen, Termin und Location ..."
                        className="w-full px-4 py-3 bg-card-hover border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      Ihre Anfrage ist unverbindlich. Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
                    </p>
                  </div>

                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4" role="alert" aria-live="polite">
                      <p className="text-sm text-red-300">{submitError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    <span>{loading ? 'Wird gesendet...' : 'Anfrage senden'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-app-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Häufige Fragen</h2>
              <p className="text-gray-400">Kompakte Antworten rund um Ablauf, Region und Preislogik</p>
            </div>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-card-bg border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-2">{item.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Sie bevorzugen ein Telefongespräch?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Rufen Sie uns direkt an. Wir klären mit Ihnen schnell den passenden Technikrahmen für Ihr Event.
            </p>
            <a
              href={COMPANY_INFO.contact.phoneLink}
              className="inline-flex w-full sm:w-auto items-center justify-center space-x-2 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg"
            >
              <Phone className="w-5 h-5" />
              <span>Jetzt anrufen: {COMPANY_INFO.contact.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
