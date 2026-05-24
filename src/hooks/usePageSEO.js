import { useEffect } from 'react';

/**
 * Hook untuk update meta tags secara dinamis per halaman
 * Berguna untuk SPA yang tidak pakai SSR
 */
export const usePageSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
} = {}) => {
  useEffect(() => {
    const siteName = 'RN Donat';
    const defaultDesc = 'Donat premium di Payakumbuh. 5 varian rasa, 1 kotak isi 6 donat hanya Rp 15.000.';
    const defaultImage = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&h=630&fit=crop';
    const defaultUrl = 'https://rn-donat-shop.web.app';

    const finalTitle = title ? `${title} — ${siteName}` : `${siteName} — Donat Premium Payakumbuh`;
    const finalDesc = description || defaultDesc;
    const finalImage = image || defaultImage;
    const finalUrl = url || defaultUrl;

    // Title
    document.title = finalTitle;

    // Helper update/create meta
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', finalDesc);
    setMeta('meta[property="og:title"]', 'content', finalTitle);
    setMeta('meta[property="og:description"]', 'content', finalDesc);
    setMeta('meta[property="og:image"]', 'content', finalImage);
    setMeta('meta[property="og:url"]', 'content', finalUrl);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[name="twitter:title"]', 'content', finalTitle);
    setMeta('meta[name="twitter:description"]', 'content', finalDesc);
    setMeta('meta[name="twitter:image"]', 'content', finalImage);
  }, [title, description, image, url, type]);
};
