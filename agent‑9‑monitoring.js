// agent-9-monitoring.js
// Monitoring / Feedback Agent for Restream (multi-engine, multi-surface)

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
You are the **Monitoring / Feedback Agent** for this Restream affiliate campaign.

Your job:
1. Take an array of page performance data (from Google, Bing, AI-search, etc.) and:
   - Log each page's engine type, URL, CTR, and time‑on‑page.
   - Mark each page as "underperforming", "performing", or "ok".
   - Suggest an action (e.g., rewrite, double‑down, or monitor).
2. Return a JSON array of observations:

   [
     {
       "engine_type": "Google",
       "page_url": "https://example.com/en/restream/studio-page",
       "ctr": 0.02,
       "time_on_page": 1.2,
       "status": "underperforming",
       "suggested_action": "Rewrite for better CTR and engagement."
     },
     ...
   ]

Rules:
- Underperforming: high traffic but low CTR OR low time‑on‑page.
- Performing: high CTR AND high time‑on‑page.
- OK: moderate CTR/time‑on‑page; no immediate action.
- If you cannot determine the status confidently, mark status = "ok".
`;

/**
 * Analyze page performance data and log observations.
 *
 * Input:  pageData = [
 *           {
 *             page_url: "https://example.com/...",
 *             ctr: 0.02,
 *             time_on_page: 1.2,
 *             search_engine: "Google"
 *           },
 *           ...
 *         ]
 * Output: [
 *           {
 *             engine_type: "Google",
 *             page_url: "...",
 *             ctr: 0.02,
 *             time_on_page: 1.2,
 *             status: "underperforming" | "performing" | "ok",
 *             suggested_action: "Rewrite..." | "Double‑down..." | "Monitor..."
 *           }
 *         ]
 */
const trackPerformance = (pageData) => {
  const observations = [];
  const underperformCTRTarget = 0.05;
  const underperformTimeTarget = 1.5;
  const performCTRTarget = 0.1;
  const performTimeTarget = 2;

  pageData.forEach(row => {
    const {
      page_url = "unknown",
      ctr = 0,
      time_on_page = 0,
      search_engine = "Google"  // default
    } = row;

    let status = "ok";
    let suggested_action = "Monitor further.";

    // 1. Underperforming pages (high traffic, low CTR or low time)
    if (ctr < underperformCTRTarget || time_on_page < underperformTimeTarget) {
      status = "underperforming";
      suggested_action = "Rewrite for better CTR and engagement (better headline, clearer CTA, more scannable structure).";
    }

    // 2. Performing pages (high CTR + high time)
    if (ctr >= performCTRTarget && time_on_page >= performTimeTarget) {
      status = "performing";
      suggested_action = "Double‑down: expand this page, add more tables/comparisons, and keep it at the top of your pipeline.";
    }

    observations.push({
      engine_type: search_engine,
      page_url,
      ctr,
      time_on_page,
      status,
      suggested_action
    });
  });

  return observations;
};

module.exports = { trackPerformance, globalSEOHeader, rolePrompt };
