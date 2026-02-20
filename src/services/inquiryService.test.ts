import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Json } from '../lib/database.types';
import { createInquiry, updateInquiryStatus } from './inquiryService';

const mockCreateInquiry = vi.hoisted(() => vi.fn());
const mockUpdateInquiryStatus = vi.hoisted(() => vi.fn());

vi.mock('../repositories/inquiryRepository', () => ({
  inquiryRepository: {
    createInquiry: mockCreateInquiry,
    updateInquiryStatus: mockUpdateInquiryStatus,
  },
}));

describe('createInquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateInquiry.mockResolvedValue(undefined);
    mockUpdateInquiryStatus.mockResolvedValue({
      id: 'inquiry-1',
      status: 'completed',
    });
  });

  it('maps contact payload to repository input with normalized fields', async () => {
    await createInquiry({
      source: 'contact',
      name: '  Max Mustermann  ',
      email: '  max@example.com ',
      phone: '  +49 171 000000  ',
      subject: 'Dienstleistung',
      message: '  Bitte um Angebot.  ',
      event_type: '  Firmenfeier ',
      event_date: ' 2026-03-10 ',
      event_location: '  Berlin ',
      source_url: 'https://example.com/contact',
    });

    expect(mockCreateInquiry).toHaveBeenCalledWith({
      inquiry_type: 'service',
      name: 'Max Mustermann',
      company: null,
      email: 'max@example.com',
      phone: '+49 171 000000',
      event_type: 'Firmenfeier',
      event_date: '2026-03-10',
      event_location: 'Berlin',
      start_date: null,
      end_date: null,
      handover_type: null,
      guest_count: null,
      selected_products: null,
      product_id: null,
      product_slug: null,
      product_name: null,
      source_url: 'https://example.com/contact',
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      message: 'Dienstleistung: Bitte um Angebot.',
      status: 'new',
    });
  });

  it('uses contact inquiry type when subject is empty', async () => {
    await createInquiry({
      source: 'home',
      name: 'Julia',
      email: 'julia@example.com',
      subject: '   ',
      message: '  Hallo Team  ',
    });

    expect(mockCreateInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiry_type: 'contact',
        message: 'Hallo Team',
      })
    );
  });

  it('passes through shop payload including selected products', async () => {
    const selectedProducts: Json = [
      { id: 'p-1', qty: 2 },
      { id: 'p-2', qty: 1 },
    ] as Json;

    await createInquiry({
      source: 'shop',
      inquiry_type: 'rental',
      name: '  Shop User ',
      email: ' shop@example.com ',
      phone: '  ',
      selected_products: selectedProducts,
      product_id: 'p-1',
      product_slug: 'moving-head',
      product_name: 'Moving Head',
      source_url: 'https://example.com/mietshop/anfrage',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'launch',
      message: '  ',
      event_type: ' Konzert ',
      event_date: ' 2026-07-01 ',
      event_location: ' Hamburg ',
      start_date: ' 2026-07-01 ',
      end_date: ' 2026-07-03 ',
      handover_type: 'delivery',
      guest_count: 250,
      status: 'in_progress',
    });

    expect(mockCreateInquiry).toHaveBeenCalledWith({
      inquiry_type: 'rental',
      name: 'Shop User',
      company: null,
      email: 'shop@example.com',
      phone: null,
      event_type: 'Konzert',
      event_date: '2026-07-01',
      event_location: 'Hamburg',
      start_date: '2026-07-01',
      end_date: '2026-07-03',
      handover_type: 'delivery',
      guest_count: 250,
      selected_products: selectedProducts,
      product_id: 'p-1',
      product_slug: 'moving-head',
      product_name: 'Moving Head',
      source_url: 'https://example.com/mietshop/anfrage',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'launch',
      message: null,
      status: 'in_progress',
    });
  });
});

describe('updateInquiryStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateInquiryStatus.mockResolvedValue({
      id: 'inquiry-1',
      status: 'completed',
    });
  });

  it('forwards id and status to the repository', async () => {
    await updateInquiryStatus('inquiry-1', 'completed');

    expect(mockUpdateInquiryStatus).toHaveBeenCalledWith('inquiry-1', 'completed');
  });
});
