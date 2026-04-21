// lib/i18n-router.js
// i18n router helper for URLs + hreflang

const { getActiveLanguages } = require('../config/language-profiles');

/**
 * Build URL for a given language and slug
 */
const getUrlForLang = (langCode, slug, domain = 'https://yourdomain.com') => {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${domain}/${langCode}/restream/${safeSlug}`;
};

/**
 * Build hreflang <link> tags for all language variants of a page
 */
const buildHreflangTags = (slug, allLangs, domain = 'https://yourdomain.com') => {
  const tags = allLangs.map(lang => {
    const href = getUrlForLang(lang.code, slug, domain);

    return `<link rel="alternate" hreflang="${lang.code}" href="${href}" />`;
  });

  // Add x-default pointing to English
  const enLang = allLangs.find(l => l.code === 'en');
  if (enLang) {
    const enHref = getUrlForLang(enLang.code, slug, domain);
    tags.push(
      `<link rel="alternate" hreflang="x-default" href="${enHref}" />`
    );
  }

  return tags.join('\n');
};

/**
 * Build full HTML <head> with hreflang for a page
 */
const buildHeadWithHreflang = (slug, allLangs, domain = 'https://yourdomain.com') => {
  const hreflangs = buildHreflangTags(slug, allLangs, domain);

  return `<head>
  <meta charset="utf-8">
  <title>Your Page Title | Restream</title>
  <meta name="description" content="Learn how to use Restream for multi‑platform live streaming." />
  ${hreflangs}
</head>`;
};

module.exports = {
  getUrlForLang,
  buildHreflangTags,
  buildHeadWithHreflang,
  getActiveLanguages
};
