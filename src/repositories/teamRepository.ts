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
  return {
    name: member.name,
    role: member.role,
    bio: member.bio ?? null,
    image_url: member.image_url ?? null,
    email: member.email ?? null,
    phone: member.phone ?? null,
    order_index: member.order_index ?? 0,
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
  if (member.order_index !== undefined) payload.order_index = member.order_index;

  return payload;
}

export const teamRepository = {
  async getAll(): Promise<TeamMemberDTO[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapTeamRow);
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
    const { data, error } = await supabase
      .from('team_members')
      .insert(toTeamInsert(member))
      .select()
      .single();

    if (error) throw error;
    return mapTeamRow(data);
  },

  async update(id: string, member: Partial<TeamMemberWriteDTO>): Promise<TeamMemberDTO> {
    const { data, error } = await supabase
      .from('team_members')
      .update(toTeamUpdate(member))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapTeamRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateOrderIndex(id: string, orderIndex: number): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ order_index: orderIndex })
      .eq('id', id);

    if (error) throw error;
  }
};
