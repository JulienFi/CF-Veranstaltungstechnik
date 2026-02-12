import { supabase } from '../lib/supabase';

export interface ProjectDTO {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  image_url: string;
  location?: string;
  date?: string;
  category?: string;
  order_index?: number;
}

export const projectRepository = {
  async getAll(): Promise<ProjectDTO[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<ProjectDTO | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(project: ProjectDTO): Promise<ProjectDTO> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, project: Partial<ProjectDTO>): Promise<ProjectDTO> {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateOrderIndex(id: string, orderIndex: number): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ order_index: orderIndex })
      .eq('id', id);

    if (error) throw error;
  }
};
