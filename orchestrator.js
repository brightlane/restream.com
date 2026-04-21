// orchestrator.js
// Main 10‑AI‑Team‑Brain orchestrator; runs agents 1–10 in a loop

const path = require('path');
const fs = require('fs');

// 1. DB / Memory layer
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

// 3. Restream affiliate config
const { loadRestreamAffiliates, validateAffiliateLinks } = require('./lib/affiliates-validator');

// Paths to agents (you would wire your LLM calls here)
const agentDir = path.join(__dirname, 'agents');

// 4. Run the full pipeline on a keyword batch
const runPipeline = async (keywordBatch) => {
  console.log(`🚀 Running 10‑AI‑Team‑Brain pipeline on ${keywordBatch.length} keywords`);

  // 1. Read current strategy
  const strategy = getLatestStrategy();
  console.log(`📚 Using strategy version: ${strategy.version}`);

  // 2. Read Restream affiliates (for CTAs)
  const restreamAffiliates = loadRestreamAffiliates();

  // 3. Agent 1 – Keyword Research
  console.log("1️⃣ Running Agent 1 – Keyword Research");
  const { generateKeywords } = require('./agent-1-keyword-research');
  const enrichedKeywords = generateKeywords(keywordBatch, strategy);

  // 4. Agent 2 – Topic‑Strategy
  console.log("2️⃣ Running Agent 2 – Topic‑Strategy");
  const { generateTopicClusters } = require('./agent-2-topic-strategy');
  const clusters = generateTopicClusters(enrichedKeywords, strategy);

  // 5. Agent 3 – Outline
  console.log("3️⃣ Running Agent 3 – Outline");
  const { generateOutline } = require('./agent-3-outline');
  const outlines = clusters.map(cluster => generateOutline(cluster, strategy));

  // 6. Agent 4 – Writer
  console.log("4️⃣ Running Agent 4 – Writer");
  const { generateArticle } = require('./agent-4-writer');
  const articles = outlines.map(outline => generateArticle(outline, strategy));

  // 7. Agent 5 – Readability
  console.log("5️⃣ Running Agent 5 – Readability");
  const { improveReadability } = require('./agent-5-readability');
  const readableArticles = articles.map(article => improveReadability(article, strategy));

  // 8. Agent 6 – Editor
  console.log("6️⃣ Running Agent 6 – Editor");
  const { editArticle } = require('./agent-6-editor');
  const editedArticles = readableArticles.map(article => editArticle(article, strategy));

  // 9. Agent 7 – Fact‑Check / Data‑Freshness
  console.log("7️⃣ Running Agent 7 – Fact‑Check");
  const { factCheckArticle } = require('./agent-7-fact-check');
  const factCheckedResults = await Promise.all(
    editedArticles.map(article => factCheckArticle(article.body, strategy))
  );

  // 10. Agent 8 – Technical SEO
  console.log("8️⃣ Running Agent 8 – Technical SEO");
  const { createSEOPage } = require('./agent-8-technical-seo');
  const seopages = editedArticles.map(article =>
    createSEOPage(article.body, strategy)
  );

  // 11. Agent 9 – Monitoring (tracking / observations)
  console.log("9️⃣ Running Agent 9 – Monitoring (tracking)");
  const { trackPerformance } = require('./agent-9-monitoring');
  const monitoringData = trackPerformance(await getRankedPages());
  monitoringData.forEach(obs => logObservation(obs));

  // 12. Agent 10 – Policy / Compliance
  console.log("🔟 Running Agent 10 – Policy / Compliance");
  const { auditPolicy } = require('./agent-10-policy');
  const policyResults = editedArticles.map(article => auditPolicy(article.body, strategy));

  // 13. Validate Affiliate Links (extra safeguard)
  console.log("🔍 Validating affiliate links on all pages...");
  let badPages = 0;
  editedArticles.forEach((article, i) => {
    const pageSlug = article.slug || `page-${i}`;
    const { valid, issues } = validateAffiliateLinks(article.body);
    if (!valid) {
      badPages++;
      logObservation({
        page
