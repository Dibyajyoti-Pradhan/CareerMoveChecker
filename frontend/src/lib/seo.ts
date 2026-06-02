import { useEffect } from 'react';

interface SeoOpts {
  title: string;
  description?: string;
  canonical?: string;
}

function getOrCreate(selector: string, tag: string, attrs: Record<string, string>): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  return el;
}

export function useSeo({ title, description, canonical }: SeoOpts) {
  useEffect(() => {
    document.title = title;

    if (description) {
      const meta = getOrCreate('meta[name="description"]', 'meta', { name: 'description' });
      meta.setAttribute('content', description);
    }

    if (canonical) {
      const link = getOrCreate('link[rel="canonical"]', 'link', { rel: 'canonical' });
      link.setAttribute('href', canonical);
    }

    // OG tags
    const ogTitle = getOrCreate('meta[property="og:title"]', 'meta', { property: 'og:title' });
    ogTitle.setAttribute('content', title);

    if (description) {
      const ogDesc = getOrCreate('meta[property="og:description"]', 'meta', { property: 'og:description' });
      ogDesc.setAttribute('content', description);
    }

    if (canonical) {
      const ogUrl = getOrCreate('meta[property="og:url"]', 'meta', { property: 'og:url' });
      ogUrl.setAttribute('content', canonical);
    }

    // Twitter tags
    const twTitle = getOrCreate('meta[name="twitter:title"]', 'meta', { name: 'twitter:title' });
    twTitle.setAttribute('content', title);

    if (description) {
      const twDesc = getOrCreate('meta[name="twitter:description"]', 'meta', { name: 'twitter:description' });
      twDesc.setAttribute('content', description);
    }

    // No teardown: the next page's useSeo call will overwrite.
  }, [title, description, canonical]);
}
