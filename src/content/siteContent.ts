export interface HomeHeroContent {
  badge: string;
  headline: string;
  highlightedText: string;
  subheadline: string;
}

export interface HomeProofItemContent {
  label: string;
  value: string;
}

export interface HomeProofContent {
  items: HomeProofItemContent[];
  microline?: string;
}

export interface HomeServiceCardContent {
  title: string;
  description: string;
  highlights: string[];
}

export interface HomeServicesContent {
  title: string;
  copy: string;
  cards: HomeServiceCardContent[];
}

export interface HomeProcessStepContent {
  title: string;
  description: string;
}

export interface HomeProcessContent {
  title: string;
  copy: string;
  steps: HomeProcessStepContent[];
}

export interface HomeFaqContent {
  title: string;
  copy: string;
}

export interface HomeCtaContent {
  primaryLabel: string;
  secondaryLabel: string;
  responsePromise: string;
  contactTitle: string;
  contactCopy: string;
}

export const HOME_HERO_FALLBACK: HomeHeroContent = {
  badge: 'Berlin/Brandenburg • deutschlandweit auf Anfrage',
  headline: 'Eventtechnik, die einfach läuft.',
  highlightedText: '',
  subheadline:
    'Miete im Shop oder Full-Service. Wir liefern passgenaue Technik und sorgen für einen reibungslosen Ablauf.',
};

export const HOME_PROOF_FALLBACK: HomeProofContent = {
  items: [
    { label: 'Erfahrung', value: 'Seit 2014' },
    { label: 'Events', value: '90+ Events/Jahr' },
    { label: 'Kapazität', value: 'Bis 2.500 Personen' },
    { label: 'Team', value: 'Team 6+ (Crew skalierbar)' },
  ],
  microline: 'Aufbau nach festen Timings – pünktlich zum Einlass.',
};

export const HOME_SERVICES_FALLBACK: HomeServicesContent = {
  title: 'Leistungen für Veranstaltungen mit klarem Ablauf',
  copy: 'Mietshop, Full-Service und Werkstatt: Wir liefern passende Technik und klare Zuständigkeiten.',
  cards: [
    {
      title: 'Mietshop',
      description:
        'Licht-, Ton- und Bühnentechnik mit transparenten Positionen und passender Beratung.',
      highlights: ['Licht und Ton', 'Bühne und Rigging', 'DJ- und Event-Equipment'],
    },
    {
      title: 'Technik-Service',
      description:
        'Planung, Aufbau, Betrieb und Abbau aus einer Hand – deutschlandweit verfügbar, Schwerpunkt Berlin/Brandenburg.',
      highlights: ['Technikplanung', 'Aufbau nach festen Timings', 'Betrieb vor Ort'],
    },
    {
      title: 'Werkstatt',
      description:
        'Reparatur, Wartung und Sicherheitsprüfung für verlässliche Systeme im laufenden Einsatz.',
      highlights: ['Reparatur', 'Wartung', 'Sicherheitsprüfungen'],
    },
  ],
};

export const HOME_PROCESS_FALLBACK: HomeProcessContent = {
  title: 'So läuft die Zusammenarbeit',
  copy: 'Ein klarer Ablauf sorgt für Planungssicherheit am Veranstaltungstag.',
  steps: [
    {
      title: 'Anfrage und Zielklärung',
      description: 'Sie nennen Anlass, Termin, Ort und Ziel. Wir klären Anforderungen und Prioritäten.',
    },
    {
      title: 'Konzept und Angebot',
      description: 'Sie erhalten ein passendes Setup mit Leistungsumfang, Zeitplan und transparentem Angebot.',
    },
    {
      title: 'Aufbau und Betrieb',
      description:
        'Wir liefern, bauen nach festen Timings auf und begleiten den Betrieb pünktlich zum Einlass.',
    },
    {
      title: 'Abbau und Abschluss',
      description: 'Nach Veranstaltungsende übernehmen wir den Abbau und halten offene Punkte sauber nach.',
    },
  ],
};

export const HOME_FAQ_FALLBACK: HomeFaqContent = {
  title: 'Häufige Fragen',
  copy: 'Kurz und konkret: Antworten zu Ablauf, Region, Kapazitäten und Timing.',
};

export const HOME_CTA_FALLBACK: HomeCtaContent = {
  primaryLabel: 'In 2 Minuten anfragen →',
  secondaryLabel: 'Mietshop öffnen',
  responsePromise: 'Antwort in der Regel innerhalb von 24 Stunden.',
  contactTitle: 'Kontakt und Angebot',
  contactCopy:
    'Sie erhalten ein klares Angebot für Miete oder Full-Service. Deutschlandweit verfügbar, Schwerpunkt Berlin/Brandenburg.',
};

function fixCommonMojibake(input: string): string {
  const shouldFix =
    input.includes('\u00C3') ||
    input.includes('\u00C2') ||
    input.includes('\u00E2\u20AC\u201C') ||
    input.includes('\u00E2\u20AC');
  if (!shouldFix) {
    return input;
  }

  const replacements: Array<[string, string]> = [
    ['\u00C3\u00BC', 'ü'],
    ['\u00C3\u009C', 'Ü'],
    ['\u00C3\u00B6', 'ö'],
    ['\u00C3\u0096', 'Ö'],
    ['\u00C3\u00A4', 'ä'],
    ['\u00C3\u0084', 'Ä'],
    ['\u00C3\u009F', 'ß'],
    ['\u00E2\u20AC\u201C', '–'],
    ['\u00E2\u20AC\u201D', '—'],
    ['\u00E2\u20AC\u0153', '“'],
    ['\u00E2\u20AC\u009D', '”'],
    ['\u00C2 ', ' '],
  ];

  let fixed = input;
  for (const [pattern, replacement] of replacements) {
    fixed = fixed.split(pattern).join(replacement);
  }

  if (fixed !== input && import.meta.env.DEV) {
    console.warn('[content] mojibake fixed:', input, '=>', fixed);
  }

  return fixed;
}

function readString(value: unknown, fallback: string): string {
  const source = typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  return fixCommonMojibake(source);
}

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => (typeof item === 'string' ? fixCommonMojibake(item.trim()) : ''))
    .filter((item) => item.length > 0);

  return normalized.length > 0 ? normalized : fallback;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeHomeHeroContent(value: unknown, fallback: HomeHeroContent = HOME_HERO_FALLBACK): HomeHeroContent {
  if (!isObject(value)) {
    return fallback;
  }

  return {
    badge: readString(value.badge, fallback.badge),
    headline: readString(value.headline, fallback.headline),
    highlightedText: readString(value.highlightedText, fallback.highlightedText),
    subheadline: readString(value.subheadline, fallback.subheadline),
  };
}

export function normalizeHomeProofContent(value: unknown, fallback: HomeProofContent = HOME_PROOF_FALLBACK): HomeProofContent {
  if (!isObject(value)) {
    return fallback;
  }

  const rawItems = Array.isArray(value.items) ? value.items : [];
  const items = fallback.items.map((fallbackItem, index) => {
    const candidate = rawItems[index];
    if (!isObject(candidate)) {
      return fallbackItem;
    }

    return {
      label: readString(candidate.label, fallbackItem.label),
      value: readString(candidate.value, fallbackItem.value),
    };
  });

  return {
    items,
    microline: readString(value.microline, fallback.microline ?? ''),
  };
}

export function normalizeHomeServicesContent(
  value: unknown,
  fallback: HomeServicesContent = HOME_SERVICES_FALLBACK
): HomeServicesContent {
  if (!isObject(value)) {
    return fallback;
  }

  const rawCards = Array.isArray(value.cards) ? value.cards : [];
  const cards = fallback.cards.map((fallbackCard, index) => {
    const candidate = rawCards[index];
    if (!isObject(candidate)) {
      return fallbackCard;
    }

    return {
      title: readString(candidate.title, fallbackCard.title),
      description: readString(candidate.description, fallbackCard.description),
      highlights: readStringArray(candidate.highlights, fallbackCard.highlights),
    };
  });

  return {
    title: readString(value.title, fallback.title),
    copy: readString(value.copy, fallback.copy),
    cards,
  };
}

export function normalizeHomeProcessContent(
  value: unknown,
  fallback: HomeProcessContent = HOME_PROCESS_FALLBACK
): HomeProcessContent {
  if (!isObject(value)) {
    return fallback;
  }

  const rawSteps = Array.isArray(value.steps) ? value.steps : [];
  const steps = fallback.steps.map((fallbackStep, index) => {
    const candidate = rawSteps[index];
    if (!isObject(candidate)) {
      return fallbackStep;
    }

    return {
      title: readString(candidate.title, fallbackStep.title),
      description: readString(candidate.description, fallbackStep.description),
    };
  });

  return {
    title: readString(value.title, fallback.title),
    copy: readString(value.copy, fallback.copy),
    steps,
  };
}

export function normalizeHomeFaqContent(value: unknown, fallback: HomeFaqContent = HOME_FAQ_FALLBACK): HomeFaqContent {
  if (!isObject(value)) {
    return fallback;
  }

  return {
    title: readString(value.title, fallback.title),
    copy: readString(value.copy, fallback.copy),
  };
}

export function normalizeHomeCtaContent(value: unknown, fallback: HomeCtaContent = HOME_CTA_FALLBACK): HomeCtaContent {
  if (!isObject(value)) {
    return fallback;
  }

  return {
    primaryLabel: readString(value.primaryLabel, fallback.primaryLabel),
    secondaryLabel: readString(value.secondaryLabel, fallback.secondaryLabel),
    responsePromise: readString(value.responsePromise, fallback.responsePromise),
    contactTitle: readString(value.contactTitle, fallback.contactTitle),
    contactCopy: readString(value.contactCopy, fallback.contactCopy),
  };
}
