/**
 * Produktverwaltung für den Mietshop
 *
 * Hier können neue Produkte angelegt, bearbeitet und aktiviert/deaktiviert werden.
 *
 * Neues Produkt hinzufügen:
 * 1. Auf "Neues Produkt" klicken
 * 2. Name: Produktbezeichnung (z.B. "LED Par 64 Set (4x)")
 * 3. Slug: URL-freundlicher Name (z.B. "led-par-64-set")
 * 4. Kategorie auswählen
 * 5. Kurzbeschreibung: 1-2 Sätze für Produktkarten
 * 6. Ausführliche Beschreibung: Detaillierte Info für Produktseite
 * 7. Technische Spezifikationen als JSON-Array:
 *    [{"label": "Leistung", "value": "150W"}, {"label": "Farben", "value": "RGBW"}]
 * 8. "Geeignet für": Anwendungsfälle beschreiben
 * 9. "Lieferumfang": Was wird mitgeliefert
 * 10. Tags: Schlagworte wie "Beliebt", "Indoor", "Einsteigerfreundlich"
 * 11. "Produkt ist aktiv" aktivieren für Sichtbarkeit im Shop
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Filter, Upload, X, FolderOpen } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database, Json } from '../../lib/database.types';
import { buildSlugImagePath, resolveImageUrl } from '../../utils/image';
import { normalizeVatRate, parseMoneyToCents } from '../../utils/price';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type ProductRowWithCategory = ProductRow & {
  categories: Pick<CategoryRow, 'name'> | null;
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  categories: { name: string };
  is_active: boolean;
  tags: string[];
}

interface ProductFormData {
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  full_description: string;
  specs: string;
  suitable_for: string;
  scope_of_delivery: string;
  tags: string;
  image_url: string;
  is_active: boolean;
  show_price: boolean;
  price_net_input: string;
  vat_rate_input: string;
}

const DEFAULT_PRODUCT_FORM_DATA: ProductFormData = {
  name: '',
  slug: '',
  category_id: '',
  short_description: '',
  full_description: '',
  specs: '',
  suitable_for: '',
  scope_of_delivery: '',
  tags: '',
  image_url: '',
  is_active: true,
  show_price: false,
  price_net_input: '',
  vat_rate_input: '19',
};

function mapProductListRow(row: ProductRowWithCategory): Product {
  return {
    id: row.id,
    name: row.name ?? '',
    slug: row.slug ?? '',
    image_url: row.image_url ?? '',
    categories: { name: row.categories?.name ?? '' },
    is_active: row.is_active ?? true,
    tags: row.tags ?? [],
  };
}

function formatCentsForInput(cents: number | null | undefined): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    return '';
  }
  return (cents / 100).toFixed(2).replace('.', ',');
}

function normalizeVatInputToPercent(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(normalizeVatRate(parsed) * 100);
}

function formatVatForInput(vatRate: number | null | undefined): string {
  if (typeof vatRate !== 'number' || !Number.isFinite(vatRate)) {
    return '19';
  }
  return String(Math.round(normalizeVatRate(vatRate) * 100));
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_PRODUCT_FORM_DATA);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0
  });

  useEffect(() => {
    if (!user) {
      window.location.href = '/admin/login';
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order')
      ]);

      if (productsRes.data) {
        const mappedProducts = (productsRes.data as ProductRowWithCategory[]).map(mapProductListRow);
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      }
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getDefaultImagePath = (slug: string): string => buildSlugImagePath('product', slug) ?? '';


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine Bilddatei aus');
      return;
    }

    if (file.size > 5242880) {
      alert('Bild ist zu groß. Maximale Größe: 5 MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(getDefaultImagePath(formData.slug));
    setFormData({ ...formData, image_url: '' });
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image_url;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error('Fehler beim Hochladen des Bildes');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const specs = formData.specs ? (JSON.parse(formData.specs) as Json) : ([] as Json);
      const tags = formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      const imageUrl = await uploadImage();
      const normalizedPriceNet = parseMoneyToCents(formData.price_net_input);
      const normalizedVatRate = normalizeVatInputToPercent(formData.vat_rate_input);

      const productData: ProductInsert = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category_id: formData.category_id || null,
        short_description: formData.short_description.trim() || null,
        full_description: formData.full_description.trim() || null,
        specs,
        suitable_for: formData.suitable_for.trim() || null,
        scope_of_delivery: formData.scope_of_delivery.trim() || null,
        tags,
        image_url: imageUrl || null,
        price_net: normalizedPriceNet,
        vat_rate: normalizedVatRate,
        show_price: formData.show_price,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData as ProductUpdate)
          .eq('id', editingProduct);
        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) {
          throw error;
        }
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Fehler beim Speichern: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      await supabase.from('products').update({ is_active: !currentState }).eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error toggling product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Produkt wirklich löschen?')) return;

    try {
      await supabase.from('products').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const editProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
      console.error('Error loading product for edit:', error);
      return;
    }

    if (data) {
      const row = data as ProductRow;
      setFormData({
        name: row.name ?? '',
        slug: row.slug ?? '',
        category_id: row.category_id ?? '',
        short_description: row.short_description ?? '',
        full_description: row.full_description ?? '',
        specs: JSON.stringify(row.specs ?? [], null, 2),
        suitable_for: row.suitable_for ?? '',
        scope_of_delivery: row.scope_of_delivery ?? '',
        tags: (row.tags ?? []).join(', '),
        image_url: row.image_url ?? '',
        is_active: row.is_active ?? true,
        show_price: row.show_price ?? false,
        price_net_input: formatCentsForInput(row.price_net),
        vat_rate_input: formatVatForInput(row.vat_rate),
      });
      if (row.image_url) {
        setImagePreview(row.image_url);
      } else {
        setImagePreview(getDefaultImagePath(row.slug ?? ''));
      }
      setEditingProduct(id);
      setShowForm(true);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_PRODUCT_FORM_DATA);
    setImageFile(null);
    setImagePreview('');
    setEditingProduct(null);
    setShowForm(false);
  };

  const filterByCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.categories.name === categories.find(c => c.id === categoryId)?.name));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const categoryData = {
        name: categoryFormData.name,
        slug: categoryFormData.slug,
        description: categoryFormData.description || null,
        display_order: categoryFormData.display_order
      };

      if (editingCategory) {
        await supabase.from('categories').update(categoryData).eq('id', editingCategory);
      } else {
        await supabase.from('categories').insert(categoryData);
      }

      resetCategoryForm();
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Fehler beim Speichern der Kategorie: ' + (error as Error).message);
    }
  };

  const editCategory = async (id: string) => {
    const { data } = await supabase.from('categories').select('*').eq('id', id).single();
    if (data) {
      setCategoryFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        display_order: data.display_order || 0
      });
      setEditingCategory(id);
      setShowCategoryForm(true);
    }
  };

  const deleteCategory = async (id: string) => {
    const productsInCategory = products.filter(p => {
      const category = categories.find(c => c.id === id);
      return category && p.categories.name === category.name;
    });

    if (productsInCategory.length > 0) {
      alert(`Diese Kategorie kann nicht gelöscht werden, da sie ${productsInCategory.length} Produkt(e) enthält.`);
      return;
    }

    if (!confirm('Kategorie wirklich löschen?')) return;

    try {
      await supabase.from('categories').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      display_order: 0
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-bg border-b border-card">
        <div className="content-container py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/admin" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück zum Dashboard</span>
            </a>
            {!showForm && !showCategoryManager && (
              <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCategoryManager(true)}
                  className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2"
                >
                  <FolderOpen className="w-5 h-5" />
                  <span>Kategorien verwalten</span>
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Neues Produkt</span>
                </button>
              </div>
            )}
            {showCategoryManager && (
              <button
                onClick={() => setShowCategoryManager(false)}
                className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zurück zu Produkten</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="content-container py-8 md:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Produkte verwalten</h1>
          <div className="text-gray-400 text-sm">
            {filteredProducts.length} von {products.length} Produkten
          </div>
        </div>

        {!showForm && !showCategoryManager && (
          <div className="glass-panel--soft card-inner p-6 mb-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex-1 flex flex-wrap gap-2">
                <button
                  onClick={() => filterByCategory('')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === ''
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Alle ({products.length})
                </button>
                {categories.map(category => {
                  const count = products.filter(p => p.categories.name === category.name).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => filterByCategory(category.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {showCategoryManager ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-white">Kategorien verwalten</h2>
              {!showCategoryForm && (
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Neue Kategorie</span>
                </button>
              )}
            </div>

            {showCategoryForm ? (
              <div className="glass-panel card mb-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen'}
                </h3>
                <form onSubmit={handleCategorySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                        className="field-control focus-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL) *</label>
                      <input
                        type="text"
                        required
                        value={categoryFormData.slug}
                        onChange={(e) => setCategoryFormData({...categoryFormData, slug: e.target.value})}
                        className="field-control focus-ring"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Beschreibung</label>
                      <textarea
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                        rows={3}
                        className="field-control focus-ring resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Anzeigereihenfolge</label>
                      <input
                        type="number"
                        value={categoryFormData.display_order}
                        onChange={(e) => setCategoryFormData({...categoryFormData, display_order: parseInt(e.target.value)})}
                        className="field-control focus-ring"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="btn-primary focus-ring tap-target interactive px-6 py-2"
                    >
                      {editingCategory ? 'Änderungen speichern' : 'Kategorie erstellen'}
                    </button>
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="btn-secondary focus-ring tap-target interactive px-6 py-2"
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-panel card">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Slug</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Beschreibung</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Anzeigereihenfolge</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Produkte</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {categories.map(category => {
                      const productCount = products.filter(p => p.categories.name === category.name).length;
                      return (
                        <tr key={category.id} className="hover:bg-gray-800/50">
                          <td className="px-6 py-4 text-white">{category.name}</td>
                          <td className="px-6 py-4 text-gray-400">{category.slug}</td>
                          <td className="px-6 py-4 text-gray-400">{category.description || '-'}</td>
                          <td className="px-6 py-4 text-gray-400">{category.display_order}</td>
                          <td className="px-6 py-4 text-gray-400">{productCount}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => editCategory(category.id)}
                                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteCategory(category.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>

                {categories.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Noch keine Kategorien vorhanden</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : showForm ? (
          <div className="glass-panel card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt erstellen'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="field-control focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL) *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => {
                        const nextSlug = e.target.value;
                        const currentDefault = getDefaultImagePath(formData.slug);
                        const nextDefault = getDefaultImagePath(nextSlug);
                        const currentImage = formData.image_url.trim();
                        const shouldSyncImagePath =
                          !editingProduct &&
                          (currentImage === '' || currentImage === currentDefault);

                        const nextImagePath = shouldSyncImagePath ? nextDefault : formData.image_url;
                        setFormData({ ...formData, slug: nextSlug, image_url: nextImagePath });

                        if (!imageFile && shouldSyncImagePath) {
                          setImagePreview(nextImagePath);
                        }
                      }}
                      className="field-control focus-ring"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kategorie *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="field-control focus-ring"
                  >
                    <option value="">Bitte wählen</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (kommagetrennt)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="Indoor, Outdoor, Bestseller"
                    className="field-control focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nettopreis (EUR)</label>
                  <input
                    type="text"
                    value={formData.price_net_input}
                    onChange={(e) => setFormData({ ...formData, price_net_input: e.target.value })}
                    placeholder="z. B. 49,00"
                    className="field-control focus-ring"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Erwartet Euro-Betrag, wird als Cent-Integer gespeichert.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">MwSt.-Satz (%)</label>
                  <input
                    type="text"
                    value={formData.vat_rate_input}
                    onChange={(e) => setFormData({ ...formData, vat_rate_input: e.target.value })}
                    placeholder="19"
                    className="field-control focus-ring"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Speicherung als Prozentwert (z. B. 19).
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.show_price}
                      onChange={(e) => setFormData({ ...formData, show_price: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-gray-300">Preis im Shop anzeigen</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bildpfad (empfohlen: relativ)</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setFormData({ ...formData, image_url: nextValue });
                      if (!imageFile) {
                        setImagePreview(nextValue || getDefaultImagePath(formData.slug));
                      }
                    }}
                    placeholder="/images/products/mh-110-wash.jpg"
                    className="field-control focus-ring"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Empfohlen: Bild als <code>/public/images/products/&lt;slug&gt;.jpg</code> ablegen und <code>image_url</code> leer lassen. Alternativ funktionieren relative Pfade (z. B. <code>/images/products/mh-110-wash.jpg</code>) und absolute URLs.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Produktbild</label>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={resolveImageUrl(imagePreview, 'product', formData.slug)}
                          alt="Produktbild Vorschau"
                          className="w-48 h-48 object-cover rounded-lg border-2 border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors bg-gray-800/50">
                        <Upload className="w-12 h-12 text-gray-500 mb-2" />
                        <span className="text-gray-400 text-sm">Bild hochladen</span>
                        <span className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP (max. 5 MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-xs text-gray-500">
                      Optionaler Upload: Das Bild wird zu Supabase Storage hochgeladen und als absolute URL gespeichert.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kurzbeschreibung</label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    rows={2}
                    className="field-control focus-ring resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ausführliche Beschreibung</label>
                  <textarea
                    value={formData.full_description}
                    onChange={(e) => setFormData({...formData, full_description: e.target.value})}
                    rows={4}
                    className="field-control focus-ring resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Technische Spezifikationen (JSON-Array)
                  </label>
                  <textarea
                    value={formData.specs}
                    onChange={(e) => setFormData({...formData, specs: e.target.value})}
                    rows={4}
                    placeholder='[{"label": "Leistung", "value": "150W"}]'
                    className="field-control focus-ring resize-none font-mono text-sm"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Geeignet für</label>
                  <textarea
                    value={formData.suitable_for}
                    onChange={(e) => setFormData({...formData, suitable_for: e.target.value})}
                    rows={2}
                    className="field-control focus-ring resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Lieferumfang</label>
                  <textarea
                    value={formData.scope_of_delivery}
                    onChange={(e) => setFormData({...formData, scope_of_delivery: e.target.value})}
                    rows={2}
                    className="field-control focus-ring resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-gray-300">Produkt ist aktiv</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary focus-ring tap-target interactive px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Wird gespeichert...' : (editingProduct ? 'Änderungen speichern' : 'Produkt erstellen')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary focus-ring tap-target interactive px-6 py-2"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="glass-panel card">
            <div className="space-y-4 lg:hidden">
              {filteredProducts.map(product => (
                <article key={product.id} className="glass-panel--soft card-inner p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={resolveImageUrl(product.image_url, 'product', product.slug)}
                      alt={product.name}
                      className="h-16 w-16 flex-shrink-0 rounded-md border border-gray-700 object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-white">{product.name}</h3>
                      <p className="text-xs text-gray-400">Kategorie: {product.categories.name}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Tags: {product.tags.length > 0 ? product.tags.slice(0, 3).join(', ') : '-'}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded px-2 py-1 text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {product.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => toggleActive(product.id, product.is_active)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title={product.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      aria-label={`Produkt ${product.name} ${product.is_active ? 'deaktivieren' : 'aktivieren'}`}
                    >
                      {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => editProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      aria-label={`Produkt ${product.name} bearbeiten`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label={`Produkt ${product.name} löschen`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Bild</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kategorie</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tags</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <img
                        src={resolveImageUrl(product.image_url, 'product', product.slug)}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-md border border-gray-700"
                        loading="lazy"
                      />
                    </td>
                    <td className="px-6 py-4 text-white">{product.name}</td>
                    <td className="px-6 py-4 text-gray-400">{product.categories.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {product.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                          title={product.is_active ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => editProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  {products.length === 0
                    ? 'Noch keine Produkte vorhanden'
                    : 'Keine Produkte in dieser Kategorie gefunden'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

