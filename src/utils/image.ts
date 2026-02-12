export type ImageEntityType = 'product' | 'project' | 'team';
export type ImageType = ImageEntityType;

const IMAGE_DIRECTORY_BY_TYPE: Record<ImageEntityType, string> = {
  product: '/images/products',
  project: '/images/projects',
  team: '/images/team',
};

const PLACEHOLDER_BY_TYPE: Record<ImageEntityType, string> = {
  product: '/images/products/placeholder.png',
  project: '/images/projects/placeholder.png',
  team: '/images/team/placeholder.png',
};

/**
 * Bildkonvention:
 * - product: /images/products/<slug>.jpg
 * - project: /images/projects/<slug>.jpg
 * - team:    /images/team/<slug>.jpg
 *
 * Workflow:
 * 1) Datei im passenden public/images/<type>-Ordner mit Slug-Namen ablegen.
 * 2) image_url leer lassen oder einen expliziten relativen Pfad setzen.
 * 3) Absolute http/https-URLs bleiben fuer Legacy-Supabase-Assets kompatibel.
 */
export function buildSlugImagePath(
  type: ImageEntityType,
  slug: string | null | undefined
): string | null {
  const normalizedSlug = slugify(slug);
  if (!normalizedSlug) return null;

  return `${IMAGE_DIRECTORY_BY_TYPE[type]}/${normalizedSlug}.jpg`;
}

export function resolveImageUrl(
  imageUrl: string | null | undefined,
  type: ImageEntityType,
  slug?: string | null
): string {
  const trimmedUrl = imageUrl?.trim();

  if (trimmedUrl) {
    if (
      trimmedUrl.startsWith('http://') ||
      trimmedUrl.startsWith('https://') ||
      trimmedUrl.startsWith('data:') ||
      trimmedUrl.startsWith('blob:')
    ) {
      return trimmedUrl;
    }

    if (trimmedUrl.startsWith('/')) {
      return trimmedUrl;
    }

    return `/${trimmedUrl}`;
  }

  return buildSlugImagePath(type, slug) ?? PLACEHOLDER_BY_TYPE[type];
}

function slugify(value: string | null | undefined): string {
  if (!value) return '';

  return value
    .trim()
    .toLowerCase()
    .replace(/\u00df/g, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
