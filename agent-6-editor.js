// agent-6-editor.js
// Agent 6 – Editor: final polish + tone + affiliate‑link enforcement

const { logObservation } = require('../lib/db-utils');
const { countWords } = require('./agent-5-readability'); // reuse from agent‑5

/**
 * Enforce minimum word count again (in case rewriting changed it)
 */
const enforceMinWords = (article, strategy) => {
  const minWords = strategy.pageType === 'pillar' ? 3000 : 1800;
  const wordCount = countWords(article.body);

  if (wordCount < minWords) {
    logObservation({
      page_url: `/en/restream/${article.slug}`,
      type: 'word_count_too_low_after_edit',
      required: minWords,
      actual: wordCount,
      agent: 'agent-6-editor',
      action: 'auto_expand',
      page_type: strategy.pageType
    });
  }

  return wordCount;
};

/**
 * Standardize Restream mentions and CTAs
 */
const standardizeBrandAndCTA = (body, strategy) => {
  const { restreamBranding } = strategy;

  // 1. Ensure consistent branding
  body = body
    .replace(/\bRestream\b/gi, 'Restream') // enforce capitalization
    .replace(/\bRestream\s+io\b/gi, 'Restream.io');

  // 2. Ensure at least one clear CTA
  const restreamCTA = `Try Restream free for 7 days using our affiliate link: [Restream Affiliate Link]`;

  const ctaRegex = /Try Restream.*7 days|Start streaming with Restream|Get Restream free for 7 days/i;

  if (!ctaRegex.test(body)) {
    // Append a CTA paragraph at a natural break (end of intro or before conclusion)
    const introEnd = body.indexOf('##');

    if (introEnd !== -1) {
      body =
        body.substring(0, introEnd) +
        `\n\n${restreamCTA}\n\n` +
        body.substring(introEnd);
    } else {
      body += `\n\n${restreamCTA}\n`;
    }
  }

  return body;
};

/**
 * Polish tone, clarity, and readability
 */
const polishToneAndStructure = (body) => {
  // 1. Trim extra whitespace
  body = body.trim().replace(/\n{3,}/g, '\n\n');

  // 2. Ensure clean H2/H3
  body = body.replace(/\n{1,2}##{1,2}\s+/g, '\n\n## ');

  // 3. Replace awkward “However, on the other hand”‑style over‑use
  body = body.replace(
    /\bHowever, on the other hand/gi,
    (match) => match.replace(/on the other hand,/i, '').trim()
  );

  // 4. Add “Restream‑specific” word where helpful
  body = body.replace(
    /\b(set up streaming|start streaming|begin streaming)/gi,
    'set up streaming with Restream'
  );

  // 5. Add numbered lists for step‑by‑step guides
  const numberedStepRegex =
    /(^(?:-|\*)\s+Step \d+.*?)(?=\n(?:-|\*)\s+Step \d+|\n{2})/gim;

  if (numberedStepRegex.test(body)) {
    const lines = body.split('\n');
    const newLines = lines.map((line) => {
      return line.replace(
        /^(\s*)(?:-|\*)\s+Step (\d+)/,
        (m, spaces, num) => `${spaces}${num}.`
      );
    });

    body = newLines.join('\n');
  }

  return body;
};

/**
 * Main editor function: apply polish, enforce CTAs, double‑check word count
 */
const editArticle = (article, strategy) => {
  let body = article.body;

  // 1. Enforce word count
  enforceMinWords(article, strategy);

  // 2. Standardize Restream mentions and CTA
  body = standardizeBrandAndCTA(body, strategy);

  // 3. Polish tone + structure
  body = polishToneAndStructure(body);

  // 4. Final word count
  const wordCount = countWords(body);

  return {
    ...article,
    body,
    edited_at: new Date().toISOString(),
    wordCount
  };
};

module.exports = { editArticle };
