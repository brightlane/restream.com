// agent-8-technical-seo.js
// Technical SEO Agent for Restream (multi-engine, multi-surface)

const globalSEOHeader = `
You are part of a multi-engine, multi-surface affiliate-SEO campaign for Restream.

Your work must be optimized for all major search engines (Google, Bing, Yahoo, Yandex, Baidu, etc.) and AI-search surfaces (ChatGPT, Perplexity, Gemini, and other AI-search tools), not just Google and Bing.

To do this, you must:
- Keep content schema-ready (HowTo, Product, Review, FAQ, etc.).
- Assume pages will be translated and hreflang-tagged into multiple languages.
- Write in a clear, answer-focused, reference-style format so your text is easily indexable and citable across engines and AI-search.
- Avoid over-reliance on Google-only tricks; favor universal SEO best practices that work everywhere.
`;

const rolePrompt = `
You are the **Technical SEO Agent** for this Restream affiliate campaign.

Your job:
1. Take an article body (HTML) and enhance it with:
   - Schema.org markup (e.g., HowTo, Product, FAQ, Review) where appropriate.
   - hreflang links for multi-language support.
   - Mobile-friendly meta tags (viewport, robots, etc.).
2. Ensure the page is:
   - Fast-loading (minimize heavy scripts or images).
   - Mobile-friendly (responsive design).
   - Indexable by all major search engines.
3. Add structured data JSON‑LD where needed, such as:
   - HowTo schema for setup guides.
   - Product schema for feature pages.
   - FAQ schema for question‑and‑answer sections.
4. Return a complete HTML document (with <html>, <head>, <body>).

Rules:
- Keep the body content largely intact; only add SEO enhancements.
- Ensure all hreflang links point to the correct language variants.
- Prefer schema that works across engines (Google, Bing, Yandex, Baidu).
- Do not add unnecessary tracking scripts or heavy assets.
`;

/**
 * Enhance an article body with schema and SEO tags.
 *
 * Input:  body (HTML string), language (e.g., "en"), country (e.g., "US")
 * Output: full HTML document with SEO enhancements
 */
const createSEOPage = (body, language = "en", country = "US") => {
  // language variants (simplified here; you can add more)
  const langVariants = {
    en: "https://example.com/en/restream/your-page-slug/",
    es: "https://example.com/es/restream/your-page-slug/",
    fr: "https://example.com/fr/restream/your-page-slug/"
  };

  // HowTo schema example (you can refine)
  const schemaHowTo = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to set up Restream for studio streaming",
    "description": "Step-by-step guide to setting up Restream for studio-style streaming.",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Sign up for Restream Studio."
      },
      {
        "@type": "HowToStep",
        "text": "Set up your camera and lighting."
      },
      {
        "@type": "HowToStep",
        "text": "Add overlays and branding."
      }
    ]
  }
  </script>
  `;

  // Product schema example (you can refine)
  const schemaProduct = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Restream Studio",
    "description": "Professional streaming platform for studio-style setups.",
    "offers": {
      "@type": "Offer",
      "price": "10",
      "priceCurrency": "USD"
    }
  }
  </script>
  `;

  // FAQ schema example (you can refine)
  const schemaFAQ = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Restream?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Restream is a multistreaming platform that lets streamers broadcast to multiple platforms at once."
        }
      }
    ]
  }
  </script>
  `;

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="index, follow" />
  <meta name="description" content="Restream global SEO affiliate hub: studio-style and multi-platform streaming guides, comparisons, and setup tutorials." />

  <!-- hreflang for multi-language support -->
  ${Object.entries(langVariants)
    .map(
      ([lang, url]) =>
        `<link rel="alternate" hreflang="${lang}" href="${url}" />`
    )
    .join("\n")}<link rel="canonical" href="${langVariants[language]}" />

  <!-- Schema.org markup -->
  ${schemaHowTo}
  ${schemaProduct}
  ${schemaFAQ}

  <title>Restream Studio & Multi-Platform Streaming Guide</title>
</head>
<body>
  ${body}

  <footer>
    <p><strong>Disclosure:</strong> This page may include affiliate links; we may earn a commission if you sign up via our links.</p>
  </footer>
</body>
</html>
`.trim();
};

module.exports = { createSEOPage, globalSEOHeader, rolePrompt };
