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
  is_published?: boolean | null;
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
  is_published?: boolean | null;
}

function isMissingOrderIndexError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === '42703' &&
    typeof maybeError.message === 'string' &&
    maybeError.message.includes('order_index')
  );
}

function isMissingCreatedAtError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === '42703' &&
    typeof maybeError.message === 'string' &&
    maybeError.message.includes('created_at')
  );
}

function sortProjectRows(rows: ProjectRow[]): ProjectRow[] {
  return [...rows].sort((a, b) => {
    const aOrderIndex = typeof a.order_index === 'number' ? a.order_index : null;
    const bOrderIndex = typeof b.order_index === 'number' ? b.order_index : null;

    if (aOrderIndex !== null && bOrderIndex !== null) {
      if (aOrderIndex !== bOrderIndex) {
        return aOrderIndex - bOrderIndex;
      }
      return 0;
    }

    if (aOrderIndex !== null) {
      return -1;
    }

    if (bOrderIndex !== null) {
      return 1;
    }

    return 0;
  });
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
    is_published: row.is_published,
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
    is_published: project.is_published ?? true,
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
  if (project.is_published !== undefined) payload.is_published = project.is_published;

  return payload;
}

export const projectRepository = {
  async getAll(): Promise<ProjectDTO[]> {
    const orderedQuery = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderedQuery.error) {
      if (!isMissingCreatedAtError(orderedQuery.error)) {
        throw orderedQuery.error;
      }

      const fallbackQuery = await supabase
        .from('projects')
        .select('*');

      if (fallbackQuery.error) {
        throw fallbackQuery.error;
      }

      return sortProjectRows(fallbackQuery.data ?? []).map(mapProjectRow);
    }

    return sortProjectRows(orderedQuery.data ?? []).map(mapProjectRow);
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

  async getBySlug(slug: string): Promise<ProjectDTO | null> {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) {
      return null;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', normalizedSlug)
      .maybeSingle();

    if (error) throw error;
    return data ? mapProjectRow(data) : null;
  },

  async create(project: ProjectWriteDTO): Promise<ProjectDTO> {
    const insertPayload = toProjectInsert(project);
    let response = await supabase
      .from('projects')
      .insert(insertPayload)
      .select()
      .single();

    if (response.error && isMissingOrderIndexError(response.error)) {
      const fallbackInsertPayload = { ...insertPayload };
      delete fallbackInsertPayload.order_index;
      response = await supabase
        .from('projects')
        .insert(fallbackInsertPayload)
        .select()
        .single();
    }

    if (response.error) throw response.error;
    return mapProjectRow(response.data);
  },

  async update(id: string, project: Partial<ProjectWriteDTO>): Promise<ProjectDTO> {
    const updatePayload = toProjectUpdate(project);
    let response = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (
      response.error &&
      isMissingOrderIndexError(response.error) &&
      Object.prototype.hasOwnProperty.call(updatePayload, 'order_index')
    ) {
      const fallbackUpdatePayload = { ...updatePayload };
      delete fallbackUpdatePayload.order_index;
      response = await supabase
        .from('projects')
        .update(fallbackUpdatePayload)
        .eq('id', id)
        .select()
        .single();
    }

    if (response.error) throw response.error;
    return mapProjectRow(response.data);
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

    if (error && !isMissingOrderIndexError(error)) throw error;
  }
};
