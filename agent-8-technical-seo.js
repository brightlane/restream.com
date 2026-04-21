// agent-8-technical-seo.js
// Agent 8 – Technical SEO: auto‑build Title, Meta, URL, Internal Links, Schema

const { logObservation } = require('../lib/db-utils');

// 1. Title tag builder (50–60 chars)
const buildTitleTag = (title, primaryKeyword) => {
  const maxChars = 60;
  let tag = title;

  // If primaryKeyword is not in title, try to add it
  if (!tag.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    tag = `${primaryKeyword} | ${tag}`;
  }

  return tag.slice(0, maxChars).trim();
};

// 2. Meta description builder (140–160 chars)
const buildMetaDescription = (primaryKeyword, secondaryKeywords) => {
  const maxChars = 160;
  const kws = [primaryKeyword, ...(secondaryKeywords || [])]
    .map(k => (typeof k === 'string' ? k : k.name || ''))
    .join(', ')
    .slice(0, maxChars - 20);

  return `Learn how to use Restream for ${kws} and stream across multiple platforms from one dashboard. Try Restream free for 7 days.`.slice(
    0,
    maxChars
  );
};

// 3. Friendly URL builder
const buildFriendlyUrl = (slug, lang = 'en') => {
  // Normalize and slugify
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // E.g. `/en/restream/how-to-go-live-on-multiple-platforms`
  return `/${lang}/restream/${safeSlug}`;
};

// 4. Internal links block (3–8 internal links)
const buildInternalLinks = (strategy, pageLang = 'en') => {
  const clusterPages = strategy.clusterPages || [];

  const links = clusterPages
    .slice(0, 8)
    .map(p => ({
      text: p.title,
      href: p.url.startsWith('/') ? p.url : `/${pageLang}/restream/${p.slug}`
    }));

  if (links.length === 0) {
    return '';
  }

  const listItems = links
    .map(
      link =>
        `<li><a href="${link.href}" rel="nofollow">${link.text}</a></li>`
    )
    .join('\n');

  return `<aside class="related-links">
  <h2>Related</h2>
  <ul>
    ${listItems}
  </ul>
</aside>`;
};

// 5. Schema markup (Article or HowTo)
const buildSchemaMarkup = (strategy, body, pageLang = 'en') => {
  const itemType =
    strategy.howToSteps || strategy.pageType === 'howto' ? 'HowTo' : 'Article';

  const base = {
    '@context': 'https://schema.org',
    '@type': itemType,
    headline: strategy.title,
    description: strategy.metaDescription || '',
    url: `https://yourdomain.com${strategy.url}`,
    author: {
      '@type': 'Organization',
      name: 'Your Site'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Site',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourdomain.com/logo.png'
      }
    },
    datePublished: strategy.publishedAt,
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://yourdomain.com${strategy.url}`
    }
  };

  if (itemType === 'HowTo' && strategy.howToSteps) {
    base.step = strategy.howToSteps.map(step => ({
      '@type': 'HowToStep',
      text: step.text.replace(/"/g, '\\"'),
      name: step.title.replace(/"/g, '\\"')
    }));
    base.name = strategy.title;
  }

  return `<script type="application/ld+json">
${JSON.stringify(base, null, 2)}
</script>`;
};

// 6. Build full SEO page (title tag, meta, URL, body, internal links, schema)
