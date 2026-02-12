import { supabase } from '../lib/supabase';

export interface TeamMemberDTO {
  id?: string;
  name: string;
  slug?: string;
  role: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
  order_index?: number;
}

export const teamRepository = {
  async getAll(): Promise<TeamMemberDTO[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<TeamMemberDTO | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(member: TeamMemberDTO): Promise<TeamMemberDTO> {
    const { data, error } = await supabase
      .from('team_members')
      .insert([member])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, member: Partial<TeamMemberDTO>): Promise<TeamMemberDTO> {
    const { data, error } = await supabase
      .from('team_members')
      .update(member)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
