export function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const shouldHandleSpaNavigation = (event: MouseEvent, anchor: HTMLAnchorElement): boolean => {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  if (anchor.target && anchor.target.toLowerCase() !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (!['http:', 'https:'].includes(url.protocol)) return false;
  if (url.origin !== window.location.origin) return false;

  const currentPathWithQuery = `${window.location.pathname}${window.location.search}`;
  const targetPathWithQuery = `${url.pathname}${url.search}`;

  if (url.hash && targetPathWithQuery === currentPathWithQuery) {
    return false;
  }

  const requiresAdminAuth = url.pathname.startsWith('/admin') && url.pathname !== '/admin/login';
  if (requiresAdminAuth && !localStorage.getItem('supabase.auth.token')) {
    return false;
  }

  return true;
};

if (typeof window !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (!shouldHandleSpaNavigation(event, anchor)) return;

    const url = new URL(anchor.href, window.location.href);
    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  });
}
