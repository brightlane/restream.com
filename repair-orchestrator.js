// repair-orchestrator.js
// Self‑healing loop that finds bad pages and rewrites them with the 10‑AI‑team‑brain

const path = require('path');
const fs = require('fs');

// 1. DB / memory layer
const {
  getArticlesForRepair,
  markArticleAsRepaired,
  logObservation,
  getLatestStrategy
} = require('./lib/db-utils');

// 2. Global rules and prompt builder
const { buildFullPrompt } = require('./lib/agents-prompt-builder');

// 3. Restream affiliate validator
const { validateAffiliateLinks } = require('./lib/affiliates-validator');

// 4. Agent imports (same 10 as your main orchestrator)
const {
  generateOutline,
  generateArticle,
  improveReadability,
  editArticle,
  factCheckArticle,
  createSEOPage,
  trackPerformance,
  auditPolicy
} = require('./agent-3-outline');          // mock import; adjust to your actual agent paths
const agentDir = path.join(__dirname, 'agents');

// 5. Audit and repair a single article
const repairArticle = async (article) => {
  const strategy = getLatestStrategy();
  const pageUrl = `/en/restream/${article.slug}`;

  console.log(`🔧 Repairing: ${pageUrl}`);

  // 1. Audit minimum word count
  const words = article.body.trim().split(/\s+/).length;
  const minWords = 1800;
  if (words < minWords) {
    logObservation({
      page_url: pageUrl,
      type: "low_word_count",
      before: words,
      after: null,
      agent: "repair-orchestrator",
      action: "expand_content"
    });
  }

  // 2. Validate affiliate links
  const { valid, issues } = validateAffiliateLinks(article.body, strategy);
  if (!valid) {
    logObservation({
      page_url: pageUrl,
      type: "affiliate_link_issue",
      issues,
      agent: "repair-orchestrator",
      action: "auto_rewrite"
    });
  }

  // 3. If repair is needed, rerun the pipeline on this page
  if (words < minWords || !valid) {
    console.log(`🔄 Triggering rewrite for ${pageUrl}...`);

    // 3a. Re‑generate outline (use existing title / slug)
    const outline = generateOutline(
      {
        title: article.title,
        primary_keyword: article.primary_keyword,
        secondary_keywords: article.secondary_keywords,
        page_type: article.page_type
      },
      strategy
    );

    // 3b. Re‑generate article
    const generated = generateArticle(outline, strategy);

    // 3c. Improve readability
    const readable = improveReadability(generated, strategy);

    // 3d. Edit
    const edited = editArticle(readable, strategy);

    // 3e. Fact‑check
    const factChecked = await factCheckArticle(edited.body, strategy.productData);

    // 3f. Re‑create SEO page
    const seopage = createSEOPage(factChecked.body, strategy);

    // 3g. Re‑validate affiliate links after rewrite
    const { valid: newValid } = validateAffiliateLinks(seopage.body, strategy);

    // 3h. Log outcome
    const newWords = seopage.body.trim().split(/\s+/).length;
    logObservation({
      page_url: pageUrl,
      type: "repair_completed",
      old_word_count: words,
      new_word_count: newWords,
      affiliate_fixed: newValid !== valid,
      agent: "repair-orchestrator",
      action: "finalized"
    });

    // 3i. Save repaired article (replace original)
    markArticleAsRepaired({
      ...seopage,
      _id: article._id,   // keep original ID
      repaired_at: new Date().toISOString()
    });

    return seopage;
  }

  return null; // no repair needed
};

// 6. Run repair loop on a batch of pages
const runRepairLoop = async (repairBatch) => {
  console.log(`🔧 Running repair‑orchestrator on ${repairBatch.length} pages`);

  const repaired = [];
  const skipped = [];

  for (const article of repairBatch) {
    const result = await repairArticle(article);
    if (result) {
      repaired.push(result);
    } else {
      skipped.push(article.slug);
    }
  }

  console.log(`✅ Repair run finished.`);
  console.log(`   - Pages repaired: ${repaired.length}`);
  console.log(`   - Pages skipped (no issues): ${skipped.length}`);
};

// 7. Run repair orchestrator with a repair‑batch
const run = async () => {
  // 7a. Get articles that need repair (e.g., from db or feed file)
  const articlesForRepair = await getArticlesForRepair();

  if (articlesForRepair.length === 0) {
    console.log("No articles flagged for repair – nothing to do.");
    return;
  }

  console.log(`📥 Repair batch size: ${articlesForRepair.length} pages`);
  await runRepairLoop(articlesForRepair);
};

// 8. Make this file executable via Node
module.exports = { runRepairLoop, run };

// Run directly if this is the entry point (e.g., node repair-orchestrator.js)
if (require.main === module) {
  run();
}
