import { supabase } from '../lib/supabase';
import type { Database, Json } from '../lib/database.types';

type InquiryRow = Database['public']['Tables']['inquiries']['Row'];
type InquiryInsert = Database['public']['Tables']['inquiries']['Insert'];
type InquiryUpdate = Database['public']['Tables']['inquiries']['Update'];

export type InquiryStatus = 'new' | 'pending' | 'completed' | 'cancelled' | 'in_progress' | 'closed';

export interface InquiryDTO {
  id: string;
  inquiry_type: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  event_location: string | null;
  start_date: string | null;
  end_date: string | null;
  handover_type: string | null;
  guest_count: number | null;
  selected_products: Json | null;
  product_id: string | null;
  product_slug: string | null;
  product_name: string | null;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
}

export interface InquiryListOptions {
  status?: InquiryStatus;
}

export interface InquiryCreateInput {
  inquiry_type: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  event_location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  handover_type?: string | null;
  guest_count?: number | null;
  selected_products?: Json | null;
  product_id?: string | null;
  product_slug?: string | null;
  product_name?: string | null;
  source_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  message?: string | null;
  status?: InquiryStatus;
}

function mapInquiryRow(row: InquiryRow): InquiryDTO {
  return {
    id: row.id,
    inquiry_type: row.inquiry_type,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    event_type: row.event_type,
    event_date: row.event_date,
    event_location: row.event_location,
    start_date: row.start_date,
    end_date: row.end_date,
    handover_type: row.handover_type,
    guest_count: row.guest_count,
    selected_products: row.selected_products,
    product_id: row.product_id,
    product_slug: row.product_slug,
    product_name: row.product_name,
    source_url: row.source_url,
    utm_source: row.utm_source,
    utm_medium: row.utm_medium,
    utm_campaign: row.utm_campaign,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
  };
}

function toInquiryInsert(input: InquiryCreateInput): InquiryInsert {
  return {
    inquiry_type: input.inquiry_type,
    name: input.name,
    company: input.company ?? null,
    email: input.email,
    phone: input.phone ?? null,
    event_type: input.event_type ?? null,
    event_date: input.event_date ?? null,
    event_location: input.event_location ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    handover_type: input.handover_type ?? null,
    guest_count: input.guest_count ?? null,
    selected_products: input.selected_products ?? null,
    product_id: input.product_id ?? null,
    product_slug: input.product_slug ?? null,
    product_name: input.product_name ?? null,
    source_url: input.source_url ?? null,
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    message: input.message ?? null,
    status: input.status ?? 'new',
  };
}

export const inquiryRepository = {
  async createInquiry(input: InquiryCreateInput): Promise<void> {
    const payload = toInquiryInsert(input);
    const { error } = await supabase
      .from('inquiries')
      .insert(payload);

    if (error) {
      throw error;
    }
  },

  async listInquiries(options: InquiryListOptions = {}): Promise<InquiryDTO[]> {
    const baseQuery = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    const query = options.status ? baseQuery.eq('status', options.status) : baseQuery;
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapInquiryRow);
  },

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryDTO> {
    const payload: InquiryUpdate = { status };
    const { data, error } = await supabase
      .from('inquiries')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapInquiryRow(data);
  },
};
