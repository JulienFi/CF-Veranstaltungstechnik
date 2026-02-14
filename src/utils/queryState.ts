export interface ShopQueryState {
  q?: string;
  cat?: string;
  tags?: string[];
}

interface UpdateQueryOptions {
  replace?: boolean;
}

function normalizeString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function normalizeTags(tags: string[] | undefined): string[] | undefined {
  if (!tags || tags.length === 0) {
    return undefined;
  }

  const unique = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
  return unique.length > 0 ? unique : undefined;
}

export function parseQuery(search = window.location.search): ShopQueryState {
  const params = new URLSearchParams(search);
  const q = normalizeString(params.get('q') ?? undefined);
  const cat = normalizeString(params.get('cat') ?? undefined);
  const tagsRaw = normalizeString(params.get('tags') ?? undefined);
  const tags = tagsRaw ? normalizeTags(tagsRaw.split(',')) : undefined;

  return { q, cat, tags };
}

export function updateQuery(partial: Partial<ShopQueryState>, options: UpdateQueryOptions = {}) {
  const replace = options.replace !== false;
  const url = new URL(window.location.href);
  const current = parseQuery(url.search);
  const next: ShopQueryState = {
    q: partial.q !== undefined ? partial.q : current.q,
    cat: partial.cat !== undefined ? partial.cat : current.cat,
    tags: partial.tags !== undefined ? partial.tags : current.tags,
  };

  const normalizedQ = normalizeString(next.q);
  const normalizedCat = normalizeString(next.cat);
  const normalizedTags = normalizeTags(next.tags);

  const params = new URLSearchParams(url.search);

  if (normalizedQ) {
    params.set('q', normalizedQ);
  } else {
    params.delete('q');
  }

  if (normalizedCat) {
    params.set('cat', normalizedCat);
  } else {
    params.delete('cat');
  }

  if (normalizedTags && normalizedTags.length > 0) {
    params.set('tags', normalizedTags.join(','));
  } else {
    params.delete('tags');
  }

  const nextQuery = params.toString();
  const nextUrl = `${url.pathname}${nextQuery ? `?${nextQuery}` : ''}${url.hash}`;

  if (replace) {
    window.history.replaceState({}, '', nextUrl);
  } else {
    window.history.pushState({}, '', nextUrl);
  }
}
