import type { Json } from '../lib/database.types';
import {
  inquiryRepository,
  type InquiryCreateInput,
  type InquiryDTO,
  type InquiryStatus,
} from '../repositories/inquiryRepository';

export type InquirySource = 'home' | 'contact' | 'shop';
export type InquiryHandoverType = 'pickup' | 'delivery';

interface BaseInquiryPayload {
  source: InquirySource;
  name: string;
  email: string;
  phone?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  handover_type?: InquiryHandoverType | null;
  guest_count?: number | null;
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

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? '';
  return normalized.length > 0 ? normalized : null;
}

function normalizeHandoverType(
  value: InquiryHandoverType | string | null | undefined
): InquiryCreateInput['handover_type'] {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'pickup' || normalized === 'delivery') {
    return normalized;
  }

  return null;
}

function normalizeGuestCount(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
    return null;
  }

  return value;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<void> {
  if (payload.source === 'shop') {
    await inquiryRepository.createInquiry({
      inquiry_type: payload.inquiry_type,
      name: payload.name.trim(),
      company: null,
      email: payload.email.trim(),
      phone: payload.phone?.trim() || null,
      event_type: normalizeOptionalText(payload.event_type),
      event_date: normalizeOptionalText(payload.event_date),
      event_location: normalizeOptionalText(payload.event_location),
      start_date: normalizeOptionalText(payload.start_date),
      end_date: normalizeOptionalText(payload.end_date),
      handover_type: normalizeHandoverType(payload.handover_type),
      guest_count: normalizeGuestCount(payload.guest_count),
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
    event_type: normalizeOptionalText(payload.event_type),
    event_date: normalizeOptionalText(payload.event_date),
    event_location: normalizeOptionalText(payload.event_location),
    start_date: normalizeOptionalText(payload.start_date),
    end_date: normalizeOptionalText(payload.end_date),
    handover_type: normalizeHandoverType(payload.handover_type),
    guest_count: normalizeGuestCount(payload.guest_count),
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

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryDTO> {
  return inquiryRepository.updateInquiryStatus(id, status);
}
