import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type AppSupabaseClient = SupabaseClient<Database>;

export const PRODUCT_WITH_CATEGORY_SELECT =
  'id,name,slug,category_id,short_description,full_description,specs,suitable_for,scope_of_delivery,tags,image_url,price_net,vat_rate,show_price,is_active,created_at,updated_at,categories!products_category_id_fkey(id,name,slug)';

const PRODUCT_WITH_CATEGORY_SELECT_FALLBACK = '*,categories!products_category_id_fkey(*)';

function hasMissingColumnError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const maybeMessage = 'message' in error ? String((error as { message?: unknown }).message ?? '') : '';
  return /column .* does not exist/i.test(maybeMessage);
}

export async function listActiveProductsForShop(supabaseClient: AppSupabaseClient) {
  const primary = await supabaseClient.from('products').select(PRODUCT_WITH_CATEGORY_SELECT).eq('is_active', true);
  if (primary.error && hasMissingColumnError(primary.error)) {
    return supabaseClient.from('products').select(PRODUCT_WITH_CATEGORY_SELECT_FALLBACK).eq('is_active', true);
  }
  return primary;
}

export async function getActiveProductBySlug(supabaseClient: AppSupabaseClient, slug: string) {
  const primary = await supabaseClient
    .from('products')
    .select(PRODUCT_WITH_CATEGORY_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (primary.error && hasMissingColumnError(primary.error)) {
    return supabaseClient
      .from('products')
      .select(PRODUCT_WITH_CATEGORY_SELECT_FALLBACK)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
  }
  return primary;
}

export async function listRelatedByCategory(
  supabaseClient: AppSupabaseClient,
  categoryId: string,
  excludeId: string
) {
  const primary = await supabaseClient
    .from('products')
    .select(PRODUCT_WITH_CATEGORY_SELECT)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(3);
  if (primary.error && hasMissingColumnError(primary.error)) {
    return supabaseClient
      .from('products')
      .select(PRODUCT_WITH_CATEGORY_SELECT_FALLBACK)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', excludeId)
      .limit(3);
  }
  return primary;
}
