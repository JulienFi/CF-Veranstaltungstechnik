import { useState, useEffect } from 'react';
import { CheckCircle2, X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import { trackAnalyticsEvent } from '../lib/analytics';

interface Product {
  id: string;
  name: string;
  categories: {
    name: string;
  };
}

export default function InquiryPage() {
  const [inquiryList, setInquiryList] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    eventLocation: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('inquiryList');
    if (saved) {
      const ids = JSON.parse(saved);
      setInquiryList(ids);
      loadProducts(ids);
    }
  }, []);

  const loadProducts = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, categories(name)')
        .in('id', ids);

      if (data) setProducts(data as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const removeProduct = (productId: string) => {
    const updated = inquiryList.filter(id => id !== productId);
    setInquiryList(updated);
    setProducts(products.filter(p => p.id !== productId));
    localStorage.setItem('inquiryList', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiry-updated'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setLoading(true);

    try {
      const selectedProductsData = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.categories.name
      }));

      const { error } = await supabase.from('inquiries').insert({
        inquiry_type: 'rental',
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        event_type: formData.eventType,
        event_date: formData.eventDate || null,
        event_location: formData.eventLocation,
        selected_products: selectedProductsData,
        message: formData.message,
        status: 'new'
      });

      if (error) throw error;

      localStorage.removeItem('inquiryList');
      trackAnalyticsEvent('Angebotsanfrage abgesendet', {
        inquiry_type: 'rental',
        selected_products_count: products.length,
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Vielen Dank fÃ¼r Ihre Anfrage!</h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Wir haben Ihre Anfrage erhalten und werden uns zeitnah mit einem individuellen Angebot bei Ihnen melden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/mietshop"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
              >
                ZurÃ¼ck zum Shop
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
              >
                Zur Startseite
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen py-14 md:py-20">
      <div className="container mx-auto px-4">
        <BackButton href="/mietshop" label="ZurÃ¼ck zum Shop" className="mb-8" />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Angebotsanfrage</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 md:mb-12">
            FÃ¼llen Sie das Formular aus und wir erstellen Ihnen ein individuelles Angebot fÃ¼r Ihre Veranstaltung. Die Anfrage ist fÃ¼r Sie unverbindlich.
          </p>

          {products.length > 0 && (
            <div className="bg-card-bg border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">AusgewÃ¤hlte Produkte ({products.length})</h2>
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card-hover rounded-lg p-4">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-400">{product.categories.name}</div>
                    </div>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Firma (optional)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-Mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Art der Veranstaltung *</label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Bitte auswÃ¤hlen</option>
                  <option value="Hochzeit">Hochzeit</option>
                  <option value="Firmenevent">Firmenevent</option>
                  <option value="Privatfeier">Privatfeier</option>
                  <option value="Festival">Festival</option>
                  <option value="Club-Event">Club-Event</option>
                  <option value="Stadtfest">Stadtfest</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Datum der Veranstaltung</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Veranstaltungsort *</label>
                <input
                  type="text"
                  required
                  value={formData.eventLocation}
                  onChange={(e) => setFormData({...formData, eventLocation: e.target.value})}
                  placeholder="z.B. MÃ¼nchen, Villa Belvedere"
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Ihre Nachricht / Besonderheiten</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={6}
                  placeholder="z.B. Anzahl der GÃ¤ste, RaumgrÃ¶ÃŸe, Indoor/Outdoor, besondere Anforderungen..."
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                Die Anfrage ist fÃ¼r Sie unverbindlich. Wir melden uns innerhalb von 24 Stunden mit einem individuellen Angebot bei Ihnen.
              </p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4" role="alert" aria-live="polite">
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Wird gesendet...' : 'Anfrage absenden'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
