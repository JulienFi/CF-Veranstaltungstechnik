import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { inquiryRepository, type InquiryDTO } from '../../repositories/inquiryRepository';
import { updateInquiryStatus } from '../../services/inquiryService';

type AdminInquiryStatus = 'new' | 'pending' | 'completed' | 'cancelled';
type InquiryFilterStatus = 'all' | AdminInquiryStatus;
type InquiryHandoverType = 'pickup' | 'delivery';

const STATUS_OPTIONS: Array<{ value: InquiryFilterStatus; label: string }> = [
  { value: 'all', label: 'Alle' },
  { value: 'new', label: 'Neu' },
  { value: 'pending', label: 'In Bearbeitung' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Storniert' },
];

const STATUS_LABELS: Record<AdminInquiryStatus, string> = {
  new: 'Neu',
  pending: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
};

const STATUS_BADGE_CLASSES: Record<AdminInquiryStatus, string> = {
  new: 'border border-pink-400/45 bg-pink-500/15 text-pink-200',
  pending: 'border border-amber-400/45 bg-amber-500/15 text-amber-200',
  completed: 'border border-emerald-400/45 bg-emerald-500/15 text-emerald-200',
  cancelled: 'border border-slate-400/45 bg-slate-500/15 text-slate-200',
};

const HANDOVER_LABELS: Record<InquiryHandoverType, string> = {
  pickup: 'Dry-Hire',
  delivery: 'Lieferung',
};

const HANDOVER_BADGE_CLASSES: Record<InquiryHandoverType, string> = {
  pickup: 'border border-sky-400/45 bg-sky-500/15 text-sky-200',
  delivery: 'border border-emerald-400/45 bg-emerald-500/15 text-emerald-200',
};

function toStatus(value: string | null): AdminInquiryStatus {
  const normalized = (value ?? '').trim().toLowerCase();

  if (normalized === 'pending' || normalized === 'in_progress') {
    return 'pending';
  }

  if (normalized === 'completed' || normalized === 'closed') {
    return 'completed';
  }

  if (normalized === 'cancelled') {
    return 'cancelled';
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

function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('de-DE', { dateStyle: 'medium' });
}

function toHandoverType(value: string | null): InquiryHandoverType | null {
  if (value === 'pickup' || value === 'delivery') {
    return value;
  }

  return null;
}

function formatRentalPeriod(inquiry: InquiryDTO): string {
  if (inquiry.start_date && inquiry.end_date) {
    return `${formatDate(inquiry.start_date)} - ${formatDate(inquiry.end_date)}`;
  }

  if (inquiry.start_date) {
    return formatDate(inquiry.start_date);
  }

  if (inquiry.end_date) {
    return formatDate(inquiry.end_date);
  }

  return formatDate(inquiry.event_date);
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
  const handoverType = toHandoverType(inquiry.handover_type);
  const lines: string[] = [
    `Anfrage: ${inquiry.id}`,
    `Status: ${STATUS_LABELS[toStatus(inquiry.status)]}`,
    `Name: ${inquiry.name}`,
    `E-Mail: ${inquiry.email || '-'}`,
    `Telefon: ${inquiry.phone || '-'}`,
    `Produkt: ${inquiry.product_name || inquiry.product_slug || '-'}`,
    `Mietzeitraum: ${formatRentalPeriod(inquiry)}`,
    `Start: ${formatDate(inquiry.start_date)}`,
    `Ende: ${formatDate(inquiry.end_date)}`,
    `Ort: ${inquiry.event_location || '-'}`,
    `Eventtyp: ${inquiry.event_type || '-'}`,
    `Übergabe: ${handoverType ? HANDOVER_LABELS[handoverType] : '-'}`,
    `Gästezahl: ${inquiry.guest_count ?? '-'}`,
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
        const data = await inquiryRepository.listInquiries();
        setInquiries(data);
      } catch (error) {
        console.error('Error loading inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const stats = useMemo(() => {
    return inquiries.reduce(
      (result, inquiry) => {
        const status = toStatus(inquiry.status);
        result[status] += 1;
        return result;
      },
      { new: 0, pending: 0, completed: 0, cancelled: 0 }
    );
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    if (statusFilter === 'all') {
      return inquiries;
    }

    return inquiries.filter((inquiry) => toStatus(inquiry.status) === statusFilter);
  }, [inquiries, statusFilter]);

  const handleStatusChange = async (id: string, status: AdminInquiryStatus) => {
    setUpdatingInquiryId(id);
    try {
      const updated = await updateInquiryStatus(id, status);
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
              <span>In Bearbeitung: {stats.pending}</span>
              <span>Abgeschlossen: {stats.completed}</span>
              <span>Storniert: {stats.cancelled}</span>
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
        ) : filteredInquiries.length === 0 ? (
          <div className="panel panel--neutral p-8 text-center">
            Keine Anfragen für den gewählten Status.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => {
              const status = toStatus(inquiry.status);
              const handoverType = toHandoverType(inquiry.handover_type);
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
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                      <select
                        value={status}
                        disabled={updatingInquiryId === inquiry.id}
                        onChange={(event) =>
                          handleStatusChange(inquiry.id, event.target.value as AdminInquiryStatus)
                        }
                        className="field-control focus-ring py-2 text-sm disabled:opacity-60"
                      >
                        <option value="new">Neu</option>
                        <option value="pending">In Bearbeitung</option>
                        <option value="completed">Abgeschlossen</option>
                        <option value="cancelled">Storniert</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                    <p className="text-gray-300">
                      <span className="text-gray-500">Produkt: </span>
                      {inquiry.product_name || inquiry.product_slug || '-'}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Mietzeitraum: </span>
                      {formatRentalPeriod(inquiry)}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Ort: </span>
                      {inquiry.event_location || '-'}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Eventtyp: </span>
                      {inquiry.event_type || '-'}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Startdatum: </span>
                      {formatDate(inquiry.start_date)}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Enddatum: </span>
                      {formatDate(inquiry.end_date)}
                    </p>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Übergabe: </span>
                      {handoverType ? (
                        <span
                          className={`ml-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${HANDOVER_BADGE_CLASSES[handoverType]}`}
                        >
                          {HANDOVER_LABELS[handoverType]}
                        </span>
                      ) : (
                        '-'
                      )}
                    </div>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Gästezahl: </span>
                      {inquiry.guest_count ?? '-'}
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

