// agent-10-policy.js
// Policy / Compliance Agent for Restream (multi-engine, multi-surface)

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
You are the **Policy / Compliance Agent** for this Restream affiliate campaign.

Your job:
1. Take a published page (HTML) and:
   - Check for the presence and clarity of affiliate disclosure.
   - Check for "guaranteed results", "you will earn money", or similar over‑claims about Restream.
   - Check for too‑many Restream affiliate links or CTAs on one page.
2. If anything violates policy:
   - Log a policy‑violation observation.
   - Suggest a fix (e.g., add disclosure, soften wording, reduce CTAs).
3. If no policy issues are found, mark the page as compliant.
4. Return a JSON object:

   {
     "page_url": "https://example.com/en/restream/page-slug",
     "issues": [
       {
         "type": "missing_disclosure" | "overclaim" | "too_many_ctas",
         "explanation": "...",
         "suggested_action": "..."
       }
     ],
     "status": "compliant" | "non_compliant"
   }

Rules:
- Every Restream‑affiliate page must have a clear affiliate disclosure at the top and bottom (or at least one clear placement).
- Do not allow:
   - Claims of guaranteed earnings, viewers, or results.
   - Over‑promising about Restream features.
- Prefer 1 primary Restream CTA per page.
`;

/**
 * Scan a page for policy / compliance issues.
 *
 * Input:  html (full page HTML string)
 * Output: {
 *           page_url: "...",
 *           issues: [...],
 *           status: "compliant" | "non_compliant"
 *         }
 * Note: This is a simulation; in practice, you'd call an LLM.
 */
const auditPolicy = (html) => {
  const lower = html.toLowerCase();

  const issues = [];
  const page_url = "https://example.com/en/restream/page-slug";  // you would inject real URL

  // 1. Check for affiliate disclosure
  const hasDisclosure =
    lower.includes("affiliate") ||
    lower.includes("commission") ||
    lower.includes("earn a commission");

  if (!hasDisclosure) {
    issues.push({
      type: "missing_disclosure",
      explanation: "No clear affiliate disclosure found on this page.",
      suggested_action: "Add a clear affiliate disclosure near the top or bottom of the page."
    });
  }

  // 2. Check for over‑claims
  const overclaimPatterns = [
    "guaranteed results",
    "guaranteed earnings",
    "you will earn",
    "you will get",
    "you must try",
    "no risk",
    "risk‑free",
    "works every time"
  ];

  overclaimPatterns.forEach(phrase => {
    if (lower.includes(phrase)) {
      issues.push({
        type: "overclaim",
        explanation: `Found over‑claiming phrase: "${phrase}".`,
        suggested_action: "Reword to avoid guarantees; keep claims factual and limited to what Restream actually supports."
      });
    }
  });

  // 3. Check for too‑many Restream affiliate links (simulated)
  // In practice you’d count <a href="...try.restream.io/..." rel="sponsored">
  const ctaPattern = /try.restream.io.*rel="sponsored"/g;
  const ctas = html.match(ctaPattern) || [];

  if (ctas.length > 2) {
    issues.push({
      type: "too_many_ctas",
      explanation: `Found ${ctas.length} Restream affiliate links on one page.`,
      suggested_action: "Keep at most 1 primary Restream CTA and maybe 1 secondary; remove extra CTAs or replace with plain links."
    });
  }

  // 4. Determine status
  const status = issues.length === 0 ? "compliant" : "non_compliant";

  return {
    page_url,
    issues,
    status
  };
};

module.exports = { auditPolicy, globalSEOHeader, rolePrompt };
