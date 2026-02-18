import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type AppSupabaseClient = SupabaseClient<Database>;

const CATEGORY_JOIN_SELECT = 'categories!products_category_id_fkey(id,name,slug)';

export const PRODUCT_SHOP_SELECT =
  'id,name,slug,category_id,short_description,full_description,specs,suitable_for,scope_of_delivery,tags,image_url,price_net,vat_rate,show_price,is_active,created_at,updated_at,categories!products_category_id_fkey(id,name,slug)';

export const PRODUCT_DETAIL_SELECT =
  'id,name,slug,category_id,short_description,full_description,specs,suitable_for,scope_of_delivery,tags,image_url,price_net,vat_rate,show_price,categories!products_category_id_fkey(id,name,slug)';

export const PRODUCT_RELATED_SELECT = `id,name,slug,category_id,short_description,image_url,${CATEGORY_JOIN_SELECT}`;

export async function listActiveProductsForShop(supabaseClient: AppSupabaseClient) {
  return supabaseClient.from('products').select(PRODUCT_SHOP_SELECT).eq('is_active', true);
}

export async function getActiveProductBySlug(supabaseClient: AppSupabaseClient, slug: string) {
  return supabaseClient
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
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
