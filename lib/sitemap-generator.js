// lib/sitemap-generator.js
// Multilingual sitemap generator for your 15‑language Restream site

const fs = require('fs');
const path = require('path');
const { getArticlesForSitemap } = require('./db-utils'); // your getter for saved articles
const { getActiveLanguages } = require('../config/language-profiles');
const { getUrlForLang } = require('./i18n-router');

const OUTPUT_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'sitemap.xml');

/**
 * Build <xhtml:link rel="alternate" hreflang="xx" href="..."/> for a page
 */
const buildHreflangXml = (slug, langs, domain = 'https://yourdomain.com') => {
  return langs
    .map(lang => {
      const href = getUrlForLang(lang.code, slug, domain);

      return `<xhtml:link rel="alternate" hreflang="${lang.code}" href="${href}"/>`;
    })
    .join('\n');
};

/**
 * Build one <url> block for a page in sitemap
 */
const buildUrlBlock = (article, langs, domain = 'https://yourdomain.com') => {
  const { slug, publishedAt } = article;
  const hreflangXml = buildHreflangXml(slug, langs, domain);

  return `<url>
  <loc>${getUrlForLang('en', slug, domain)}</loc>
  <lastmod>${new Date(publishedAt).toISOString().split('T')[0]}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
  ${hreflangXml}
</url>`;
};

/**
 * Generate full sitemap.xml for all articles and all languages
 */
const generateSitemap = async () => {
  const domain = 'https://yourdomain.com';
  const articles = await getArticlesForSitemap();

  const langs = getActiveLanguages();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const urls = articles
    .map(article => buildUrlBlock(article, langs, domain))
    .join('\n');

  const sitemapXml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  fs.writeFileSync(OUTPUT_FILE, sitemapXml, 'utf8');

  console.log(`✅ Multilingual sitemap saved to: ${OUTPUT_FILE}`);
  console.log(`   - Pages indexed: ${articles.length}`);
  console.log(`   - Languages: ${langs.length}`);
};

module.exports = { generateSitemap, buildUrlBlock, buildHreflangXml };
