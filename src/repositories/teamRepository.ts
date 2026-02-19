import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type TeamRow = Database['public']['Tables']['team_members']['Row'];
type TeamInsert = Database['public']['Tables']['team_members']['Insert'];
type TeamUpdate = Database['public']['Tables']['team_members']['Update'];

export interface TeamMemberDTO {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  image_url?: string | null;
  email?: string | null;
  phone?: string | null;
  order_index?: number | null;
}

export interface TeamMemberWriteDTO {
  name: string;
  role: string;
  bio?: string | null;
  image_url?: string | null;
  email?: string | null;
  phone?: string | null;
  order_index?: number | null;
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

function isMissingDisplayOrderError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === '42703' &&
    typeof maybeError.message === 'string' &&
    maybeError.message.includes('display_order')
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

function readOrderValue(row: TeamRow): number | null {
  if (typeof row.order_index === 'number') {
    return row.order_index;
  }
  if (typeof row.display_order === 'number') {
    return row.display_order;
  }
  return null;
}

function sortTeamRows(rows: TeamRow[]): TeamRow[] {
  return [...rows].sort((a, b) => {
    const aOrder = readOrderValue(a);
    const bOrder = readOrderValue(b);

    if (aOrder !== null && bOrder !== null && aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    if (aOrder !== null && bOrder === null) {
      return -1;
    }

    if (aOrder === null && bOrder !== null) {
      return 1;
    }

    const aCreatedAt = a.created_at ? Date.parse(a.created_at) : NaN;
    const bCreatedAt = b.created_at ? Date.parse(b.created_at) : NaN;
    if (Number.isFinite(aCreatedAt) && Number.isFinite(bCreatedAt) && aCreatedAt !== bCreatedAt) {
      return bCreatedAt - aCreatedAt;
    }

    return (a.name ?? '').localeCompare(b.name ?? '', 'de', { sensitivity: 'base' });
  });
}

function mapTeamRow(row: TeamRow): TeamMemberDTO {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    image_url: row.image_url,
    email: row.email,
    phone: row.phone,
    order_index: row.order_index ?? row.display_order ?? 0,
  };
}

function toTeamInsert(member: TeamMemberWriteDTO): TeamInsert {
  const orderValue = member.order_index ?? 0;
  return {
    name: member.name,
    role: member.role,
    bio: member.bio ?? null,
    image_url: member.image_url ?? null,
    email: member.email ?? null,
    phone: member.phone ?? null,
    order_index: orderValue,
    display_order: orderValue,
  };
}

function toTeamUpdate(member: Partial<TeamMemberWriteDTO>): TeamUpdate {
  const payload: TeamUpdate = {};

  if (member.name !== undefined) payload.name = member.name;
  if (member.role !== undefined) payload.role = member.role;
  if (member.bio !== undefined) payload.bio = member.bio;
  if (member.image_url !== undefined) payload.image_url = member.image_url;
  if (member.email !== undefined) payload.email = member.email;
  if (member.phone !== undefined) payload.phone = member.phone;
  if (member.order_index !== undefined) {
    payload.order_index = member.order_index;
    payload.display_order = member.order_index;
  }

  return payload;
}

export const teamRepository = {
  async getAll(): Promise<TeamMemberDTO[]> {
    const orderedQuery = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderedQuery.error) {
      if (!isMissingCreatedAtError(orderedQuery.error)) {
        throw orderedQuery.error;
      }

      const fallbackQuery = await supabase
        .from('team_members')
        .select('*');

      if (fallbackQuery.error) {
        throw fallbackQuery.error;
      }

      return sortTeamRows(fallbackQuery.data ?? []).map(mapTeamRow);
    }

    return sortTeamRows(orderedQuery.data ?? []).map(mapTeamRow);
  },

  async getById(id: string): Promise<TeamMemberDTO | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapTeamRow(data) : null;
  },

  async create(member: TeamMemberWriteDTO): Promise<TeamMemberDTO> {
    const insertPayload = toTeamInsert(member);
    let response = await supabase
      .from('team_members')
      .insert(insertPayload)
      .select()
      .single();

    if (response.error && isMissingOrderIndexError(response.error)) {
      const withoutOrderIndex = { ...insertPayload };
      delete withoutOrderIndex.order_index;
      response = await supabase
        .from('team_members')
        .insert(withoutOrderIndex)
        .select()
        .single();
    }

    if (response.error && isMissingDisplayOrderError(response.error)) {
      const withoutDisplayOrder = { ...insertPayload };
      delete withoutDisplayOrder.display_order;
      response = await supabase
        .from('team_members')
        .insert(withoutDisplayOrder)
        .select()
        .single();
    }

    if (response.error) throw response.error;
    return mapTeamRow(response.data);
  },

  async update(id: string, member: Partial<TeamMemberWriteDTO>): Promise<TeamMemberDTO> {
    const updatePayload = toTeamUpdate(member);
    let response = await supabase
      .from('team_members')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (
      response.error &&
      isMissingOrderIndexError(response.error) &&
      Object.prototype.hasOwnProperty.call(updatePayload, 'order_index')
    ) {
      const withoutOrderIndex = { ...updatePayload };
      delete withoutOrderIndex.order_index;
      response = await supabase
        .from('team_members')
        .update(withoutOrderIndex)
        .eq('id', id)
        .select()
        .single();
    }

    if (
      response.error &&
      isMissingDisplayOrderError(response.error) &&
      Object.prototype.hasOwnProperty.call(updatePayload, 'display_order')
    ) {
      const withoutDisplayOrder = { ...updatePayload };
      delete withoutDisplayOrder.display_order;
      response = await supabase
        .from('team_members')
        .update(withoutDisplayOrder)
        .eq('id', id)
        .select()
        .single();
    }

    if (response.error) throw response.error;
    return mapTeamRow(response.data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateOrderIndex(id: string, orderIndex: number): Promise<void> {
    const primaryResponse = await supabase
      .from('team_members')
      .update({ order_index: orderIndex, display_order: orderIndex })
      .eq('id', id);

    if (!primaryResponse.error) {
      return;
    }

    if (isMissingOrderIndexError(primaryResponse.error)) {
      const fallbackResponse = await supabase
        .from('team_members')
        .update({ display_order: orderIndex })
        .eq('id', id);
      if (fallbackResponse.error && !isMissingDisplayOrderError(fallbackResponse.error)) {
        throw fallbackResponse.error;
      }
      return;
    }

    if (isMissingDisplayOrderError(primaryResponse.error)) {
      const fallbackResponse = await supabase
        .from('team_members')
        .update({ order_index: orderIndex })
        .eq('id', id);
      if (fallbackResponse.error && !isMissingOrderIndexError(fallbackResponse.error)) {
        throw fallbackResponse.error;
      }
      return;
    }

    throw primaryResponse.error;
  }
};
