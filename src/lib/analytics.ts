type AnalyticsPrimitive = string | number | boolean;
export type AnalyticsEventProps = Record<string, AnalyticsPrimitive | null | undefined>;

const DEFAULT_PLAUSIBLE_DOMAIN = 'analytics-domain.example.com';
const DEFAULT_PLAUSIBLE_SCRIPT_SRC = 'https://plausible.io/js/script.js';
const PLAUSIBLE_SCRIPT_ID = 'plausible-script';

export const ANALYTICS_CONFIG = {
  // In production, set VITE_PLAUSIBLE_DOMAIN in .env (see README section "Web-Analytics").
  domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || DEFAULT_PLAUSIBLE_DOMAIN,
  scriptSrc: import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC || DEFAULT_PLAUSIBLE_SCRIPT_SRC,
};

function sanitizeProps(props?: AnalyticsEventProps): Record<string, AnalyticsPrimitive> | undefined {
  if (!props) {
    return undefined;
  }

  const entries = Object.entries(props).filter(
    (entry): entry is [string, AnalyticsPrimitive] =>
      entry[1] !== null && entry[1] !== undefined
  );

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

export function setupAnalyticsScript(): void {
  if (!import.meta.env.PROD) return;
  if (typeof document === 'undefined') return;

  const existingScript = document.getElementById(PLAUSIBLE_SCRIPT_ID);
  if (existingScript) return;

  const script = document.createElement('script');
  script.id = PLAUSIBLE_SCRIPT_ID;
  script.defer = true;
  script.setAttribute('data-domain', ANALYTICS_CONFIG.domain);
  script.src = ANALYTICS_CONFIG.scriptSrc;
  document.head.appendChild(script);
}

export function track(eventName: string, props?: AnalyticsEventProps): void {
  const sanitizedProps = sanitizeProps(props);

  if (import.meta.env.DEV) {
    console.debug('[analytics]', eventName, sanitizedProps ?? {});
  }

  if (typeof window === 'undefined') {
    return;
  }

  const plausible = window.plausible;
  if (typeof plausible === 'function') {
    if (sanitizedProps) {
      plausible(eventName, { props: sanitizedProps });
    } else {
      plausible(eventName);
    }
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, sanitizedProps ?? {});
  }
}

export function trackAnalyticsEvent(eventName: string, props?: AnalyticsEventProps): void {
  track(eventName, props);
}

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: AnalyticsEventProps }
    ) => void;
    gtag?: (...args: unknown[]) => void;
  }
}
