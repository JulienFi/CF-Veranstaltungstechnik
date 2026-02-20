import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type AdminProductListRow = ProductRow & {
  categories: Pick<CategoryRow, 'name'> | null;
};

export async function listAdminProductsWithCategory(): Promise<AdminProductListRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as AdminProductListRow[]) ?? [];
}

export async function listAdminCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data ?? [];
}

export async function getAdminProductById(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createAdminProduct(product: ProductInsert): Promise<void> {
  const { error } = await supabase.from('products').insert(product);
  if (error) throw error;
}

export async function updateAdminProduct(id: string, product: ProductUpdate): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id);

  if (error) throw error;
}

export async function toggleAdminProductActive(id: string, nextActiveState: boolean): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: nextActiveState })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getAdminCategoryById(id: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createAdminCategory(category: CategoryInsert): Promise<void> {
  const { error } = await supabase.from('categories').insert(category);
  if (error) throw error;
}

export async function updateAdminCategory(id: string, category: CategoryUpdate): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadAdminProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error('Fehler beim Hochladen des Bildes');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(filePath);

  return publicUrl;
}
