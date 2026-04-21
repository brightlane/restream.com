// agent-5-readability.js
// Agent 5 – Readability + Google‑friendly word‑count enforcement

const { logObservation } = require('../lib/db-utils');

/**
 * Count words in a string
 */
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(t => t.length > 0).length;
};

/**
 * Check if article meets minimum word count
 */
const ensureMinWords = (article, strategy) => {
  const minWords = strategy.pageType === 'pillar' ? 3000 : 1800;
  const wordCount = countWords(article.body);

  if (wordCount < minWords) {
    logObservation({
      page_url: `/en/restream/${article.slug}`,
      type: 'word_count_too_low',
      required: minWords,
      actual: wordCount,
      agent: 'agent-5-readability',
      action: 'auto_expand',
      page_type: strategy.pageType
    });

    // In practice, you’d call an “expand” function here
    // e.g., article.body = expandContent(article.body, strategy, minWords);
    // For now, mark it so repair‑orchestrator or agent‑4 can handle it
  }

  return wordCount;
};

/**
 * Improve readability: structure, clarity, bullets, H2/H3
 */
const improveReadability = (article, strategy) => {
  ensureMinWords(article, strategy);

  let body = article.body;

  // 1. Normalize whitespace
  body = body.replace(/\n{3,}/g, '\n\n').trim();

  // 2. Ensure H2/H3 for common questions
  const commonH2Patterns = [
    'How to use Restream',
    'Why use Restream?',
    'Restream vs [Platform]',
    'Best practices for streaming',
    'Step‑by‑step guide',
    'Troubleshooting tips'
  ];

  commonH2Patterns.forEach(phrase => {
    const regex = new RegExp(`^\\s*${phrase}\\s*$`, 'i');
    body = body.replace(
      regex,
      `## ${phrase}`
    );
  });

  // 3. Convert long paragraphs into bullets when natural
  // This is a simple example; you can tune with an LLM call
  const bulletPhrases = [
    'key benefit',
    'main reason',
    'advantage',
    'step',
    'tip'
  ];

  bulletPhrases.forEach(phrase => {
    const pattern = new RegExp(`(\\d+\\.\\s+${phrase}.*?)(?=\\n\\d+|\\n{2}|$)`, 'gi');
    body = body.replace(pattern, (match) => {
      const lines = match.split('\n');
      const list = lines.map(line => `- ${line.trim()}`);
      return list.join('\n');
    });
  });

  // 4. Add bullet takeaways at the end if missing
  const footerCheck = /##? Key takeaways|##? Summary|##? What you learned/i;

  if (!footerCheck.test(body)) {
    body += '\n\n## Key takeaways\n\n- Restream lets you go live on multiple platforms at once.\n- You can follow and respond to chats in real time.\n- Restream supports multi‑bitrate streaming and adaptive streaming.\n';
  }

  return {
    ...article,
    body,
    wordCount: countWords(body)
  };
};

module.exports = { improveReadability, countWords };
