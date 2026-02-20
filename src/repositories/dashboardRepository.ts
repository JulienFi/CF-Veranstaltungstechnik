import { supabase } from '../lib/supabase';

export interface DashboardStats {
  products: number;
  projects: number;
  team: number;
  inquiries: number;
}

export async function loadDashboardStats(): Promise<DashboardStats> {
  const [productsRes, projectsRes, teamRes, inquiriesRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('team_members').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  if (productsRes.error) throw productsRes.error;
  if (projectsRes.error) throw projectsRes.error;
  if (teamRes.error) throw teamRes.error;
  if (inquiriesRes.error) throw inquiriesRes.error;

  return {
    products: productsRes.count || 0,
    projects: projectsRes.count || 0,
    team: teamRes.count || 0,
    inquiries: inquiriesRes.count || 0,
  };
}
