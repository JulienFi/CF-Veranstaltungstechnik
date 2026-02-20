import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import {
  inquiryRepository,
  type InquiryDTO,
  type InquiryStatus,
} from '../../repositories/inquiryRepository';

type InquiryFilterStatus = 'all' | InquiryStatus;

const STATUS_OPTIONS: Array<{ value: InquiryFilterStatus; label: string }> = [
  { value: 'all', label: 'Alle' },
  { value: 'new', label: 'Neu' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'closed', label: 'Abgeschlossen' },
];

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'Neu',
  in_progress: 'In Bearbeitung',
  closed: 'Abgeschlossen',
};

const STATUS_BADGE_CLASSES: Record<InquiryStatus, string> = {
  new: 'badge--warning',
  in_progress: 'badge--info',
  closed: 'badge--success',
};

function toStatus(value: string | null): InquiryStatus {
  if (value === 'in_progress' || value === 'closed') {
    return value;
  }

  return 'new';
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function sanitizePhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

function buildWhatsAppReplyLink(inquiry: InquiryDTO): string | null {
  if (!inquiry.phone) {
    return null;
  }

  const targetPhone = sanitizePhoneNumber(inquiry.phone);
  if (!targetPhone) {
    return null;
  }

  const message = [
    `Hallo ${inquiry.name},`,
    'danke für Ihre Anfrage bei CF Veranstaltungstechnik.',
    'Wir melden uns kurzfristig mit einem passenden Angebot.',
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

function buildInquirySummary(inquiry: InquiryDTO): string {
  const lines: string[] = [
    `Anfrage: ${inquiry.id}`,
    `Status: ${toStatus(inquiry.status)}`,
    `Name: ${inquiry.name}`,
    `E-Mail: ${inquiry.email || '-'}`,
    `Telefon: ${inquiry.phone || '-'}`,
    `Produkt: ${inquiry.product_name || inquiry.product_slug || '-'}`,
    `Datum: ${inquiry.event_date || '-'}`,
    `Ort: ${inquiry.event_location || '-'}`,
    `Eventtyp: ${inquiry.event_type || '-'}`,
  ];

  if (inquiry.message) {
    lines.push(`Nachricht: ${inquiry.message}`);
  }

  if (inquiry.source_url) {
    lines.push(`Quelle: ${inquiry.source_url}`);
  }

  return lines.join('\n');
}

export default function AdminInquiriesPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<InquiryFilterStatus>('all');
  const [inquiries, setInquiries] = useState<InquiryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(null);
  const [copyFeedbackId, setCopyFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      window.location.href = '/admin/login';
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const data = await inquiryRepository.listInquiries({
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
        setInquiries(data);
      } catch (error) {
        console.error('Error loading inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, statusFilter]);

  const stats = useMemo(() => {
    return inquiries.reduce(
      (result, inquiry) => {
        const status = toStatus(inquiry.status);
        result[status] += 1;
        return result;
      },
      { new: 0, in_progress: 0, closed: 0 }
    );
  }, [inquiries]);

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    setUpdatingInquiryId(id);
    try {
      const updated = await inquiryRepository.updateInquiryStatus(id, status);
      setInquiries((current) =>
        current.map((inquiry) => (inquiry.id === updated.id ? updated : inquiry))
      );
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  const handleCopySummary = async (inquiry: InquiryDTO) => {
    const summary = buildInquirySummary(inquiry);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopyFeedbackId(inquiry.id);
      window.setTimeout(() => setCopyFeedbackId((current) => (current === inquiry.id ? null : current)), 1500);
    } catch (error) {
      console.error('Error copying inquiry summary:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-bg border-b border-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/admin" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück zum Dashboard</span>
            </a>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span>Neu: {stats.new}</span>
              <span>In Bearbeitung: {stats.in_progress}</span>
              <span>Abgeschlossen: {stats.closed}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Anfragen verwalten</h1>

          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="text-sm text-gray-300">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as InquiryFilterStatus)}
              className="field-control focus-ring py-2"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-300">Lade Anfragen...</div>
        ) : inquiries.length === 0 ? (
          <div className="panel panel--neutral p-8 text-center">
            Keine Anfragen für den gewählten Status.
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => {
              const status = toStatus(inquiry.status);
              const selectedProductsCount = Array.isArray(inquiry.selected_products)
                ? inquiry.selected_products.length
                : 0;
              const whatsappLink = buildWhatsAppReplyLink(inquiry);

              return (
                <article key={inquiry.id} className="bg-card-bg border border-card rounded-xl p-5 md:p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{inquiry.name}</h2>
                      <p className="text-sm text-gray-400">
                        Eingegangen: {formatDateTime(inquiry.created_at)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Typ: {inquiry.inquiry_type} | Produkte: {selectedProductsCount}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <span
                        className={`badge ${STATUS_BADGE_CLASSES[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                      <select
                        value={status}
                        disabled={updatingInquiryId === inquiry.id}
                        onChange={(event) =>
                          handleStatusChange(inquiry.id, event.target.value as InquiryStatus)
                        }
                        className="field-control focus-ring py-2 text-sm disabled:opacity-60"
                      >
                        <option value="new">Neu</option>
                        <option value="in_progress">In Bearbeitung</option>
                        <option value="closed">Abgeschlossen</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                    <p className="text-gray-300">
                      <span className="text-gray-500">Produkt: </span>
                      {inquiry.product_name || inquiry.product_slug || '-'}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Eventdatum: </span>
                      {inquiry.event_date || '-'}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Ort: </span>
                      {inquiry.event_location || '-'}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Eventtyp: </span>
                      {inquiry.event_type || '-'}
                    </p>
                  </div>

                  {inquiry.message && (
                    <div className="panel panel--neutral mt-4">
                      <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopySummary(inquiry)}
                      className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copyFeedbackId === inquiry.id ? 'Kopiert' : 'Zusammenfassung kopieren'}</span>
                    </button>

                    {inquiry.email && (
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 px-3 py-2 text-sm"
                      >
                        <Mail className="w-4 h-4" />
                        <span>E-Mail</span>
                      </a>
                    )}

                    {inquiry.phone && (
                      <a
                        href={`tel:${inquiry.phone}`}
                        className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 px-3 py-2 text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Anrufen</span>
                      </a>
                    )}

                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 px-3 py-2 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {inquiry.source_url && (
                      <a
                        href={inquiry.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 px-3 py-2 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Quelle</span>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

