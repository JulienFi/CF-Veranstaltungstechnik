import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectDTO {
  id: string;
  title: string;
  slug?: string | null;
  description: string;
  image_url: string;
  location?: string | null;
  date?: string | null;
  category?: string | null;
  order_index?: number | null;
}

export interface ProjectWriteDTO {
  title: string;
  slug?: string | null;
  description: string;
  image_url: string;
  location?: string | null;
  date?: string | null;
  category?: string | null;
  order_index?: number | null;
}

function mapProjectRow(row: ProjectRow): ProjectDTO {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? '',
    image_url: row.image_url ?? '',
    location: row.location,
    date: row.date,
    category: row.category,
    order_index: row.order_index,
  };
}

function toProjectInsert(project: ProjectWriteDTO): ProjectInsert {
  return {
    title: project.title,
    slug: project.slug ?? null,
    description: project.description,
    image_url: project.image_url,
    location: project.location ?? null,
    date: project.date ?? null,
    category: project.category ?? null,
    order_index: project.order_index ?? 0,
  };
}

function toProjectUpdate(project: Partial<ProjectWriteDTO>): ProjectUpdate {
  const payload: ProjectUpdate = {};

  if (project.title !== undefined) payload.title = project.title;
  if (project.slug !== undefined) payload.slug = project.slug;
  if (project.description !== undefined) payload.description = project.description;
  if (project.image_url !== undefined) payload.image_url = project.image_url;
  if (project.location !== undefined) payload.location = project.location;
  if (project.date !== undefined) payload.date = project.date;
  if (project.category !== undefined) payload.category = project.category;
  if (project.order_index !== undefined) payload.order_index = project.order_index;

  return payload;
}

export const projectRepository = {
  async getAll(): Promise<ProjectDTO[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapProjectRow);
  },

  async getById(id: string): Promise<ProjectDTO | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapProjectRow(data) : null;
  },

  async create(project: ProjectWriteDTO): Promise<ProjectDTO> {
    const { data, error } = await supabase
      .from('projects')
      .insert(toProjectInsert(project))
      .select()
      .single();

    if (error) throw error;
    return mapProjectRow(data);
  },

  async update(id: string, project: Partial<ProjectWriteDTO>): Promise<ProjectDTO> {
    const { data, error } = await supabase
      .from('projects')
      .update(toProjectUpdate(project))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapProjectRow(data);
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
