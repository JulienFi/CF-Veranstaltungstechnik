import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

const DEFAULT_BASE_URL = 'https://www.cf-veranstaltungstechnik.berlin';

function normalizeBaseUrl(value) {
  return value.trim().replace(/\/+$/, '');
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getBaseUrl() {
  const fromEnv =
    process.env.SITE_URL || process.env.VITE_SITE_URL || process.env.SITEMAP_SITE_URL;
  if (fromEnv && fromEnv.trim() !== '') {
    return normalizeBaseUrl(fromEnv);
  }
  return DEFAULT_BASE_URL;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchSlugs(supabaseUrl, serviceKey, table, extraFilters = '') {
  const normalizedSupabaseUrl = normalizeBaseUrl(supabaseUrl);
  const endpoint = `${normalizedSupabaseUrl}/rest/v1/${table}?select=slug&slug=not.is.null${extraFilters}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${table} slugs (${response.status})`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => (typeof row?.slug === 'string' ? row.slug.trim() : ''))
    .filter(Boolean);
}

async function collectDynamicRoutes() {
  const supabaseUrl = process.env.SITEMAP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SITEMAP_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return [];
  }

  try {
    const [productSlugs, projectSlugs] = await Promise.all([
      fetchSlugs(supabaseUrl, serviceKey, 'products', '&is_active=eq.true'),
      fetchSlugs(supabaseUrl, serviceKey, 'projects', '&is_published=eq.true'),
    ]);

    const productRoutes = productSlugs.map((slug) => `/mietshop/${slug}`);
    const projectRoutes = projectSlugs.map((slug) => `/projekte/${slug}`);

    return [...productRoutes, ...projectRoutes];
  } catch (error) {
    console.warn('[sitemap] Dynamic slug fetch skipped:', error.message);
    return [];
  }
}

function renderUrlEntry(baseUrl, route, lastmod) {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return [
    '  <url>',
    `    <loc>${escapeXml(`${baseUrl}${normalizedRoute}`)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '  </url>',
  ].join('\n');
}

async function generateSitemap() {
  const baseUrl = getBaseUrl();
  const lastmod = todayIsoDate();
  const staticRoutes = [
    '/',
    '/mietshop',
    '/mietshop/anfrage',
    '/projekte',
    '/impressum',
    '/datenschutz',
  ];

  const dynamicRoutes = await collectDynamicRoutes();
  const routes = Array.from(new Set([...staticRoutes, ...dynamicRoutes]));
  const urlEntries = routes.map((route) => renderUrlEntry(baseUrl, route, lastmod)).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(sitemapPath, xml, 'utf8');
  console.log(`[sitemap] Generated ${routes.length} URLs at ${sitemapPath}`);
}

generateSitemap().catch((error) => {
  console.error('[sitemap] Generation failed:', error);
  process.exitCode = 1;
});
