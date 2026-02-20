import type { Json } from '../lib/database.types';
import { inquiryRepository, type InquiryCreateInput, type InquiryStatus } from '../repositories/inquiryRepository';

export type InquirySource = 'home' | 'contact' | 'shop';

interface BaseInquiryPayload {
  source: InquirySource;
  name: string;
  email: string;
  phone?: string | null;
  status?: InquiryStatus;
}

export interface GeneralInquiryPayload extends BaseInquiryPayload {
  source: 'home' | 'contact';
  subject?: string | null;
  message: string;
  event_type?: string | null;
  event_date?: string | null;
  event_location?: string | null;
  source_url?: string | null;
}

export interface ShopInquiryPayload extends BaseInquiryPayload {
  source: 'shop';
  inquiry_type: 'rental';
  selected_products?: Json | null;
  product_id?: string | null;
  product_slug?: string | null;
  product_name?: string | null;
  source_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  message?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  event_location?: string | null;
}

export type CreateInquiryPayload = GeneralInquiryPayload | ShopInquiryPayload;

function mapSubjectToInquiryType(subject: string | null | undefined): InquiryCreateInput['inquiry_type'] {
  switch ((subject ?? '').trim().toLowerCase()) {
    case 'mietshop':
      return 'rental';
    case 'dienstleistung':
      return 'service';
    case 'werkstatt':
      return 'workshop';
    default:
      return 'contact';
  }
}

function buildGeneralMessage(subject: string | null | undefined, message: string): string {
  const cleanSubject = (subject ?? '').trim();
  const cleanMessage = message.trim();

  if (!cleanSubject) {
    return cleanMessage;
  }

  return `${cleanSubject}: ${cleanMessage}`;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<void> {
  if (payload.source === 'shop') {
    await inquiryRepository.createInquiry({
      inquiry_type: payload.inquiry_type,
      name: payload.name.trim(),
      company: null,
      email: payload.email.trim(),
      phone: payload.phone?.trim() || null,
      event_type: payload.event_type?.trim() || null,
      event_date: payload.event_date?.trim() || null,
      event_location: payload.event_location?.trim() || null,
      selected_products: payload.selected_products ?? null,
      product_id: payload.product_id ?? null,
      product_slug: payload.product_slug ?? null,
      product_name: payload.product_name ?? null,
      source_url: payload.source_url ?? null,
      utm_source: payload.utm_source ?? null,
      utm_medium: payload.utm_medium ?? null,
      utm_campaign: payload.utm_campaign ?? null,
      message: payload.message?.trim() || null,
      status: payload.status ?? 'new',
    });
    return;
  }

  await inquiryRepository.createInquiry({
    inquiry_type: mapSubjectToInquiryType(payload.subject),
    name: payload.name.trim(),
    company: null,
    email: payload.email.trim(),
    phone: payload.phone?.trim() || null,
    event_type: payload.event_type?.trim() || null,
    event_date: payload.event_date?.trim() || null,
    event_location: payload.event_location?.trim() || null,
    selected_products: null,
    product_id: null,
    product_slug: null,
    product_name: null,
    source_url: payload.source_url ?? null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    message: buildGeneralMessage(payload.subject, payload.message),
    status: payload.status ?? 'new',
  });
}
