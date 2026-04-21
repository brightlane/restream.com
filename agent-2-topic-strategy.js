// agent-2-topic-strategy.js
// Topic-Strategy Agent for Restream (multi-engine, multi-surface)

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
You are the **Topic-Strategy Agent** for this Restream affiliate campaign.

Your job:
1. Take a list of keywords (JSON) and cluster them into **topic clusters**.
2. For each cluster, define:
   - "cluster_name": short, clear topic (e.g., "studio-streaming-setup", "multi-platform-tools", "restream-vs-other-streaming-tools").
   - "restream_type": "studio" or "multi".
   - "campaign_id": "restream-studio" or "restream-multi".
   - "page_type": "guide", "review", "comparison", "how-to", "tool-calculator", "FAQ".
   - "priority": "high", "medium", "low" (based on estimated traffic + intent).
3. Return a JSON array of topic clusters:

   [
     {
       "cluster_name": "studio-streaming-setup",
       "keywords": ["studio streaming setup", "professional stream setup with overlays", "branding overlays for streams"],
       "restream_type": "studio",
       "campaign_id": "restream-studio",
       "page_type": "how-to",
       "priority": "high"
     },
     {
       "cluster_name": "multi-platform-streaming",
       "keywords": ["multistream to Twitch and YouTube", "stream to 8 platforms at once"],
       "restream_type": "multi",
       "campaign_id": "restream-multi",
       "page_type": "guide",
       "priority": "high"
     },
     ...
   ]

Rules:
- Group keywords by intent and topic; keep clusters focused (do not merge "studio" and "multi" into one cluster).
- If a cluster has mostly commercial or compare intents, mark priority = "high".
- If a cluster has mostly informational intent, mark priority = "medium" or "low".
- Do not assign a cluster to a campaign_id that doesn't match the restream_type.
- If unsure, keep the cluster as-is but flag it with "priority": "low" for later review.
`;

/**
 * Takes keyword data and returns topic clusters.
 *
 * Input: array of keyword rows
 * Output: array of topic clusters (cluster_name, keywords, restream_type, campaign_id, page_type, priority)
 */
const generateTopicClusters = (keywords) => {
  // 1. Group by restream_type
  const groups = {
    studio: [],
    multi: []
  };

  keywords.forEach(kw => {
    if (kw.restream_type === "studio") {
      groups.studio.push(kw.keyword);
    } else {
      groups.multi.push(kw.keyword);
    }
  });

  // 2. Build clusters (you can refine clustering logic here)
  const clusters = [];

  // Studio clusters
  if (groups.studio.length > 0) {
    clusters.push({
      cluster_name: "studio-streaming-setup",
      keywords: groups.studio.filter(k => k.includes("studio") || k.includes("setup") || k.includes("overlays")),
      restream_type: "studio",
      campaign_id: "restream-studio",
      page_type: "how-to",
      priority: "high"
    });

    clusters.push({
      cluster_name: "studio-streaming-branding",
      keywords: groups.studio.filter(k => k.includes("branding") || k.includes("logo")),
      restream_type: "studio",
      campaign_id: "restream-studio",
      page_type: "guide",
      priority: "medium"
    });
  }

  // Multi clusters
  if (groups.multi.length > 0) {
    clusters.push({
      cluster_name: "multi-platform-streaming-tools",
      keywords: groups.multi.filter(k => k.includes("multi") || k.includes("multistream")),
      restream_type: "multi",
      campaign_id: "restream-multi",
      page_type: "guide",
      priority: "high"
    });

    clusters.push({
      cluster_name: "restream-vs-other-tools",
      keywords: groups.multi.filter(k => k.includes("vs") || k.includes("compare")),
      restream_type: "multi",
      campaign_id: "restream-multi",
      page_type: "comparison",
      priority: "high"
    });
  }

  // 3. Add a fallback “unclear” category (you can refine later)
  clusters.push({
    cluster_name: "miscellaneous-info",
    keywords: keywords
      .filter(k => !clusters.some(c => c.keywords.includes(k.keyword)))
      .map(k => 
