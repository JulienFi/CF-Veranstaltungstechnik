type AnalyticsEventProps = Record<string, string | number | boolean>;

const DEFAULT_PLAUSIBLE_DOMAIN = 'analytics-domain.example.com';
const DEFAULT_PLAUSIBLE_SCRIPT_SRC = 'https://plausible.io/js/script.js';
const PLAUSIBLE_SCRIPT_ID = 'plausible-script';

export const ANALYTICS_CONFIG = {
  // In production, set VITE_PLAUSIBLE_DOMAIN in .env (see README section "Web-Analytics").
  domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || DEFAULT_PLAUSIBLE_DOMAIN,
  scriptSrc: import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC || DEFAULT_PLAUSIBLE_SCRIPT_SRC,
};

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

export function trackAnalyticsEvent(eventName: string, props?: AnalyticsEventProps): void {
  if (!import.meta.env.PROD) return;
  if (typeof window === 'undefined') return;

  const plausible = window.plausible;
  if (typeof plausible !== 'function') return;

  if (props) {
    plausible(eventName, { props });
    return;
  }

  plausible(eventName);
}

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: AnalyticsEventProps }
    ) => void;
  }
}
