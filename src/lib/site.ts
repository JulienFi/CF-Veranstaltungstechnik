const DEFAULT_SITE_URL = 'https://www.cf-veranstaltungstechnik.berlin';

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  if (envBaseUrl && envBaseUrl.trim() !== '') {
    return normalizeBaseUrl(envBaseUrl);
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  return DEFAULT_SITE_URL;
}

export function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const path = value.startsWith('/') ? value : `/${value}`;
  return `${getBaseUrl()}${path}`;
}
