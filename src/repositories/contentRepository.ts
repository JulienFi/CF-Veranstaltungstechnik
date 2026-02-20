import { supabase } from '../lib/supabase';
import type { Json } from '../lib/database.types';

let isSiteContentUnavailable = false;
const SITE_CONTENT_UNAVAILABLE_CACHE_KEY = 'cf:site_content_unavailable';

function readSiteContentUnavailableFromSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.sessionStorage.getItem(SITE_CONTENT_UNAVAILABLE_CACHE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSiteContentUnavailableToSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(SITE_CONTENT_UNAVAILABLE_CACHE_KEY, '1');
  } catch {
    // Ignore storage failures and continue with in-memory guard.
  }
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMissingSiteContentRelationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: string; message?: string; details?: string };
  const combinedMessage = `${candidate.message ?? ''} ${candidate.details ?? ''}`.toLowerCase();

  return (
    candidate.code === 'PGRST205' ||
    candidate.code === '42P01' ||
    combinedMessage.includes('relation') && combinedMessage.includes('site_content') ||
    combinedMessage.includes('schema cache') && combinedMessage.includes('site_content') ||
    combinedMessage.includes('does not exist') && combinedMessage.includes('site_content')
  );
}

export async function getContent<T extends Record<string, unknown>>(key: string): Promise<T | null> {
  if (isSiteContentUnavailable || readSiteContentUnavailableFromSession()) {
    isSiteContentUnavailable = true;
    return null;
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    // Stage-safe fallback: if CMS table is not yet migrated in this environment,
    // do not break storefront rendering and silently use hardcoded fallbacks.
    if (isMissingSiteContentRelationError(error)) {
      isSiteContentUnavailable = true;
      writeSiteContentUnavailableToSession();
      return null;
    }
    throw error;
  }

  if (!data || !isJsonObject(data.data)) {
    return null;
  }

  return data.data as T;
}

export async function upsertContent(key: string, data: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert(
      {
        key,
        data: data as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

  if (error) {
    throw error;
  }
}
