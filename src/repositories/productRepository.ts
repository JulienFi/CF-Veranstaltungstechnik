import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type AppSupabaseClient = SupabaseClient<Database>;

const CATEGORY_JOIN_SELECT = 'categories!products_category_id_fkey(id,name,slug)';
const CATEGORY_NAME_JOIN_SELECT = 'categories!products_category_id_fkey(name)';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PRODUCT_SHOP_SELECT =
  'id,name,slug,category_id,short_description,full_description,specs,suitable_for,scope_of_delivery,tags,image_url,price_net,vat_rate,show_price,is_active,created_at,updated_at,categories!products_category_id_fkey(id,name,slug)';

export const PRODUCT_DETAIL_SELECT =
  'id,name,slug,category_id,short_description,full_description,specs,suitable_for,scope_of_delivery,tags,image_url,price_net,vat_rate,show_price,categories!products_category_id_fkey(id,name,slug)';

export const PRODUCT_RELATED_SELECT = `id,name,slug,category_id,short_description,image_url,${CATEGORY_JOIN_SELECT}`;
export const PRODUCT_INQUIRY_LOOKUP_SELECT = `id,slug,name,image_url,${CATEGORY_NAME_JOIN_SELECT}`;

export async function listActiveProductsForShop(supabaseClient: AppSupabaseClient) {
  return supabaseClient.from('products').select(PRODUCT_SHOP_SELECT).eq('is_active', true);
}

export async function getActiveProductBySlug(supabaseClient: AppSupabaseClient, slug: string) {
  const trimmed = slug.trim();
  let decoded = trimmed;

  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    decoded = trimmed;
  }

  const slugCandidates = Array.from(new Set([trimmed, decoded].filter(Boolean)));

  let query = supabaseClient.from('products').select(PRODUCT_DETAIL_SELECT).eq('is_active', true);
  if (slugCandidates.length > 1) {
    query = query.in('slug', slugCandidates);
  } else {
    query = query.eq('slug', slugCandidates[0] ?? '');
  }

  return query.single();
}

export async function getActiveProductLookupByReference(
  supabaseClient: AppSupabaseClient,
  reference: string
) {
  const candidate = reference.trim();
  const baseQuery = supabaseClient
    .from('products')
    .select(PRODUCT_INQUIRY_LOOKUP_SELECT)
    .eq('is_active', true)
    .limit(1);

  if (UUID_PATTERN.test(candidate)) {
    return baseQuery.eq('id', candidate).maybeSingle();
  }

  return baseQuery.eq('slug', candidate).maybeSingle();
}

export async function listActiveProductLookupsByIds(
  supabaseClient: AppSupabaseClient,
  ids: string[]
) {
  return supabaseClient
    .from('products')
    .select(PRODUCT_INQUIRY_LOOKUP_SELECT)
    .in('id', ids)
    .eq('is_active', true);
}

export async function listRelatedByCategory(
  supabaseClient: AppSupabaseClient,
  categoryId: string,
  excludeId: string
) {
  return supabaseClient
    .from('products')
    .select(PRODUCT_RELATED_SELECT)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(3);
}
