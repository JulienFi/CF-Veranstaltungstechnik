export type PriceMode = 'net' | 'gross';

const DEFAULT_VAT_FACTOR = 0.19;

const EUR_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizeMoneyInput(input: string): string {
  return input.replace(/\s+/g, '').replace(/[^\d,.-]/g, '');
}

export function parseMoneyToCents(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      return null;
    }
    return Math.round(input * 100);
  }

  const trimmed = sanitizeMoneyInput(input).trim();
  if (trimmed === '') {
    return null;
  }

  const lastComma = trimmed.lastIndexOf(',');
  const lastDot = trimmed.lastIndexOf('.');
  let decimalSeparator: ',' | '.' | null = null;

  if (lastComma >= 0 && lastDot >= 0) {
    decimalSeparator = lastComma > lastDot ? ',' : '.';
  } else if (lastComma >= 0) {
    const decimals = trimmed.length - lastComma - 1;
    decimalSeparator = decimals > 0 && decimals <= 2 ? ',' : null;
  } else if (lastDot >= 0) {
    const decimals = trimmed.length - lastDot - 1;
    decimalSeparator = decimals > 0 && decimals <= 2 ? '.' : null;
  }

  let normalized: string;

  if (decimalSeparator) {
    const separatorIndex = trimmed.lastIndexOf(decimalSeparator);
    const integerPart = trimmed.slice(0, separatorIndex).replace(/[.,]/g, '');
    const decimalPart = trimmed.slice(separatorIndex + 1).replace(/[.,]/g, '');
    normalized = `${integerPart}.${decimalPart}`;
  } else {
    normalized = trimmed.replace(/[.,]/g, '');
  }

  if (normalized === '' || normalized === '-' || normalized === '.-' || normalized === '-.') {
    return null;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}

export function formatCentsEUR(cents: number): string {
  const value = cents / 100;
  return EUR_FORMATTER.format(value).replace(/\u00A0/g, ' ');
}

export function normalizeVatRate(v: number | null | undefined): number {
  if (v === null || v === undefined || !Number.isFinite(v)) {
    return DEFAULT_VAT_FACTOR;
  }

  let normalized: number;

  if (v >= 2 && v <= 30) {
    normalized = v / 100;
  } else if (v > 30 && v <= 3000) {
    normalized = v / 10000;
  } else if (v > 0 && v < 2) {
    normalized = v;
  } else if (v > 3000) {
    normalized = v / 10000;
  } else {
    normalized = v;
  }

  return clamp(normalized, 0, 0.3);
}

export function netToGrossCents(netCents: number, vatFactor: number): number {
  return Math.round(netCents * (1 + vatFactor));
}

export function formatPrice(
  priceNetCents: number,
  vatRate: number | null | undefined,
  mode: PriceMode
): string {
  const vatFactor = normalizeVatRate(vatRate);
  const amountCents = mode === 'gross' ? netToGrossCents(priceNetCents, vatFactor) : priceNetCents;
  return formatCentsEUR(amountCents);
}
