// orchestrator.js
// 10‑AI‑Team‑Brain orchestrator: runs agents 1–10 on a keyword batch

const path = require('path');
const fs = require('fs');

// 1. Central DB / memory utilities
const {
  getKeywords,
  appendKeywords,
  saveArticle,
  logObservation,
  getLatestStrategy,
  getRankedPages
} = require('./lib/db-utils');

// 2. Global rules and prompt builder
const { buildFullPrompt } = require('./lib/agents-prompt-builder');

// 3. Restream affiliate validator (for never‑forgetting links)
const { loadRestreamAffiliates, validateAffiliateLinks } = require('./lib/affiliates-validator');

// 4. Run the full pipeline on a keyword batch
const runPipeline = async (keywordBatch) => {
  console.log(`🚀 Running 10‑AI‑Team‑Brain pipeline on ${keywordBatch.length} keywords`);

  // 1. Read current strategy
  const strategy = getLatestStrategy();
  console.log(`📚 Using strategy version: ${strategy.version}`);

  // 2. Load Restream affiliate config (for CTAs and validation)
  const restreamAffiliates = loadRestreamAffiliates();

  // 3. Agent 1 – Keyword Research Agent
  console.log("1️⃣ Agent 1 – Keyword Research");
  const { generateKeywords } = require('./agent-1-keyword-research');
  const enrichedKeywords = generateKeywords(keywordBatch, strategy);

  // 4. Agent 2 – Topic‑Strategy Agent
  console.log("2️⃣ Agent 2 – Topic‑Strategy");
  const { generateTopicClusters } = require('./agent-2-topic-strategy');
  const clusters = generateTopicClusters(enrichedKeywords, strategy);

  // 5. Agent 3 – Outline Agent
  console.log("3️⃣ Agent 3 – Outline");
  const { generateOutline } = require('./agent-3-outline');
  const outlines = clusters.map(cluster => generateOutline(cluster, strategy));

  // 6. Agent 4 – Writer Agent
  console.log("4️⃣ Agent 4 – Writer");
  const { generateArticle } = require('./agent-4-writer');
  const articles = outlines.map(outline => generateArticle(outline, strategy));

  // 7. Agent 5 – Readability Agent
  console.log("5️⃣ Agent 5 – Readability");
  const { improveReadability } = require('./agent-5-readability');
  const readableArticles = articles.map(article => improveReadability(article, strategy));

  // 8. Agent 6 – Editor Agent
  console.log("6️⃣ Agent 6 – Editor");
  const { editArticle } = require('./agent-6-editor');
  const editedArticles = readableArticles.map(article => editArticle(article, strategy));

  // 9. Agent 7 – Fact‑Check / Data‑Freshness Agent
  console.log("7️⃣ Agent 7 – Fact‑Check / Data‑Freshness");
  const { factCheckArticle } = require('./agent-7-fact-check');
  const factCheckedResults = await Promise.all(
    editedArticles.map(article =>
      factCheckArticle(article.body, strategy.productData)
    )
  );

  // 10. Agent 8 – Technical SEO Agent
  console.log("8️⃣ Agent 8 – Technical SEO");
  const { createSEOPage } = require('./agent-8-technical-seo');
  const seopages = editedArticles.map(article =>
    createSEOPage(article.body, strategy)
  );

  // 11. Agent 9 – Monitoring Agent (tracking / observations)
  console.log("9️⃣ Agent 9 – Monitoring / Performance");
  const { trackPerformance } = require('./agent-9-monitoring');
  const monitoringData = trackPerformance(await getRankedPages());
  monitoringData.forEach(obs => logObservation(obs));

  // 12. Agent 10 – Policy / Compliance Agent
  console.log("🔟 Agent 10 – Policy / Compliance");
  const { auditPolicy } = require('./agent-10-policy');
  const policyResults = editedArticles.map(article => auditPolicy(article.body, strategy));

  // 13. Validate Restream affiliate links on all pages
  console.log("🔍 Validating Restream affiliate links...");
  let badPages = 0;
  editedArticles.forEach((article, i) => {
    const pageSlug = article.slug || `page-${i}`;
    const { valid, issues } = validateAffiliateLinks(article.body, strategy);
    if (!valid) {
      badPages++;
      logObservation({
        page_url: `/en/restream/${pageSlug}`,
        type: "affiliate_link_issue",
        status: "needs_rewrite",
        action: "auto_rewrite",
        issues,
        agent: "affiliates-validator"
      });
    }
  });

  // 14. Save final articles to DB / file system
  console.log("💾 Saving articles to database...");
  editedArticles.forEach(article => {
    saveArticle(article);
  });

  console.log(`✅ 10‑AI‑team‑brain run finished.`);
  console.log(`   - Articles created: ${editedArticles.length}`);
  console.log(`   - Affiliate‑link issues detected: ${badPages}`);
};

// 15. Run orchestrator with a keyword batch
const run = async () => {
  // Get all keywords (from db-utils)
  const allKeywords = getKeywords();
  const batchSize = 100; // tweak as needed
  const batch = allKeywords.slice(0, batchSize);

  console.log(`📥 Using keyword batch of ${batch.length} items`);

  if (batch.length === 0) {
    console.log("No keywords available — nothing to process.");
    return;
  }

  await runPipeline(batch);
};

// 16. Make this file executable via Node
module.exports = { runPipeline, run };

// Run directly if this is the entry point (e.g., node orchestrator.js)
if (require.main === module) {
  run();
}
