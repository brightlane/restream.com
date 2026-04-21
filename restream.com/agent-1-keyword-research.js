// agent-1-keyword-research.js
// Keyword Research Agent for Restream (multi-engine, multi-surface)

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
You are the **Keyword Research Agent** for this Restream affiliate campaign.

Your job:
1. Take a list of keywords (JSON) from a keyword list (CSV or JSON).
2. For each keyword, assign:
   - "keyword": the original keyword.
   - "volume": an estimated or given monthly volume.
   - "intent": "info" / "commercial" / "compare"
   - "restream_type": "studio" or "multi"
   - "campaign_id": "restream-studio" or "restream-multi"
   - "language": e.g., "en"
   - "country": e.g., "US"
3. Return a JSON array of:

   [
     {
       "keyword": "studio streaming setup",
       "volume": 1200,
       "intent": "commercial",
       "restream_type": "studio",
       "campaign_id": "restream-studio",
       "language": "en",
       "country": "US"
     },
     ...
   ]

Rules:
- If the keyword is about "studio streaming", "professional setup", "branding overlays", set restream_type = "studio".
- If the keyword is about "multistream", "Twitch and YouTube at once", "multi-platform streaming", set restream_type = "multi".
- Do not assign a campaign_id that doesn't match the restream_type meaning.
- Skip or flag any keyword that is clearly about non-Restream tools (e.g., Streamlabs, Twitch Studio).
- If you cannot determine intent clearly, mark intent = "info"; we will refine later.
`;

/**
 * Enrich raw keyword rows with Restream intent, type, and campaign_id.
 *
 * Input:  keywordList = [
 *           { keyword: "studio streaming setup", volume: 1200, language: "en", country: "US" },
 *           ...
 *         ]
 * Output: [
 *           { keyword, volume, intent, restream_type, campaign_id, language, country }
 *         ]
 */
const generateKeywords = (keywordList) => {
  return keywordList.map(row => {
    const lower = row.keyword.toLowerCase();

    // 1. Detect restream_type
    let restream_type = "multi";
    let campaign_id = "restream-multi";

    if (
      lower.includes("studio") ||
      lower.includes("branding") ||
      lower.includes("professional") ||
      lower.includes("stream deck") ||
      lower.includes("overlays") ||
      lower.includes("studio setup") ||
      lower.includes("studio style") ||
      lower.includes("studio quality")
    ) {
      restream_type = "studio";
      campaign_id = "restream-studio";
    }

    // 2. Detect intent (simple heuristic; you can refine)
    let intent = "info";
    if (
      lower.includes("best") ||
      lower.includes("review") ||
      lower.includes("vs") ||
      lower.includes("buy") ||
      lower.includes("sign up") ||
      lower.includes("discount") ||
      lower.includes("price") ||
      lower.includes("offer")
    ) {
      intent = "commercial";
    }

    // 3. Optionally: detect "compare" intent
    if (
      lower.includes("vs") ||
      lower.includes("compared") ||
      lower.includes("comparison") ||
      lower.includes("alternative") ||
      lower.includes("better than")
    ) {
      intent = "compare";
    }

    return {
      keyword: row.keyword,
      volume: row.volume || 0,
      intent,
      restream_type,
      campaign_id,
      language: row.language || "en",
      country: row.country || "US"
    };
  });
};

module.exports = { generateKeywords, globalSEOHeader, rolePrompt };
