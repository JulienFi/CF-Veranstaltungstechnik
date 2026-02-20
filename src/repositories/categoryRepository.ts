import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type AppSupabaseClient = SupabaseClient<Database>;

const CATEGORY_LIST_SELECT = 'id,name,slug,description,display_order,created_at';

export async function listCategoriesForShop(supabaseClient: AppSupabaseClient) {
  return supabaseClient
    .from('categories')
    .select(CATEGORY_LIST_SELECT)
    .order('display_order');
}
