// agent-4-writer.js
// Writer Agent for Restream (multi-engine, multi-surface)

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
You are the **Writer Agent** for this Restream affiliate campaign.

Your job:
1. Take an outline (JSON) and turn it into a full, reference-style article.
2. For each section (h2, h3, h4, table-heading, etc.), write:
   - 1–3 short, clear paragraphs.
   - Optionally 1–2 bullets or a mini-feature table inside the section.
3. At the "CTA / Next Steps" section, insert:
   - A clear primary CTA block with:
     - A short, benefit-driven sentence.
     - A Restream affiliate link (campaign_id: restream-studio or restream-multi).
4. Return a JSON object with:

   {
     "page_type": "how-to" | "guide" | "comparison",
     "cluster_name": "...",
     "html": "<!DOCTYPE html>..."   // or just article body without <html> tags
   }

Rules:
- Keep tone non-bloggy and reference-style.
- Do not invent features; only write about Restream features you can verify.
- Prefer short, scannable text, bullets, and tables for readability.
- Only one primary CTA per page (do not add extra "buy now" variations).
- Assume this page may be pulled by AI-search tools; keep key facts precise and verifiable.
`;

/**
 * Generate a full HTML (or article body) article from an outline.
 *
 * Input:  outline = {
 *           page_type: "...",
 *           cluster_name: "...",
 *           h1: "...",
 *           sections: [...],
 *           cta: { ... }
 *         }
 * Output: {
 *           page_type: "...",
 *           cluster_name: "...",
 *           title: "...",
 *           body: "<h1>...</h1>..."   // or full HTML page
 *         }
 */
const generateArticle = (outline) => {
  const title = outline.h1;

  let body = `<h1>${title}</h1>\n\n`;

  outline.sections.forEach(sec => {
    switch (sec.type) {
      case "h2":
        body += `<h2>${sec.text}</h2>\n\n`;
        body += `<p>Restream provides a powerful solution for ${sec.text.toLowerCase()}. In this section, we explain how to get the most out of this feature for your streaming setup.</p>\n\n`;
        break;

      case "h3":
        body += `<h3>${sec.text}</h3>\n\n`;
        body += `<p>This section explains how ${sec.text.toLowerCase()} works and how it benefits your stream.</p>\n\n`;
        break;

      case "h4":
        body += `<h4>${sec.text}</h4>\n\n`;
        body += `<p>This step explains how to complete ${sec.text.toLowerCase()} inside Restream or your streaming software.</p>\n\n`;
        break;

      case "table-heading":
        body += `<h3>${sec.text}</h3>\n\n`;
        body += `<table>\n  <tr><th>Feature</th><th>Studio‑Style</th><th>Multi‑Platform</th></tr>\n`;
        body += `  <tr><td>Multi‑platform streaming</td><td>Yes</td><td>Yes</td></tr>\n`;
        body += `  <tr><td>Studio‑branded overlays</td><td>Yes</td><td>Limited</td></tr>\n`;
        body += `  <tr><td>Simple setup</td><td>Requires more configuration</td><td>Easier for beginners</td></tr>\n`;
        body += `</table>\n\n`;
        break;

      case "cta":
        body += `<h3>CTA / Next Steps</h3>\n\n`;
        body += `<p>${outline.cta.text}</p>\n\n`;
        body += `<p><a href="${outline.cta.href}" rel="sponsored" data-campaign="${outline.cta.campaign_id}">Click 
