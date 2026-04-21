// Inside agent-8-technical-seo.js (add this to your existing file)

/**
 * Build hreflang tags for all language variants of a page
 */
const buildHreflangTags = (strategy, allLangs) => {
  const { slug, lang: currentLang } = strategy;

  const tags = allLangs.map(lang => {
    const href = `/${lang.code}/restream/${slug}`;

    return `<link rel="alternate" hreflang="${lang.code}" href="https://yourdomain.com${href}" />`;
  });

  // Add x-default if English is default
  const enLang = allLangs.find(l => l.code === 'en');
  if (enLang) {
    const enHref = `/${enLang.code}/restream/${slug}`;
    tags.push(
      `<link rel="alternate" hreflang="x-default" href="https://yourdomain.com${enHref}" />`
    );
  }

  return tags.join('\n');
};

/**
 * Build <html lang="..."> and <head> with hreflang
 */
const buildHeadWithHreflang = (strategy, allLangs) => {
  const { lang = 'en', title, metaDescription } = strategy;

  const titleSafe = title.slice(0, 60).trim();
  const metaDesc = metaDescription.slice(0, 160).trim();

  const hreflangTags = buildHreflangTags(strategy, allLangs);

  return `<head>
  <meta charset="utf-8">
  <title>${titleSafe}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="https://yourdomain.com${strategy.url}" />
  ${hreflangTags}
</head>`;
};
