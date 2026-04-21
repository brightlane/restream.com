// agent-10-policy.js
// Agent 10 – Policy / Compliance: brand, affiliate, and legal guardrails

const { logObservation } = require('../lib/db-utils');

/**
 * Simple phrase‑based policy‑check helper
 */
const containsPhrase = (text, phrase) => {
  return text.toLowerCase().includes(phrase.toLowerCase());
};

/**
 * Enforce Restream‑affiliate and monetization rules
 */
const enforceAffiliateRules = (body, strategy) => {
  const issues = [];

  const affiliateLinkRegex =
    /\[Restream Affiliate Link\]|\[restream\.io\]|\[your affiliate link\]/i;

  if (!affiliateLinkRegex.test(body)) {
    issues.push({
      type: 'affiliate_link_missing',
      description:
        'Article does not contain a Restream affiliate link placeholder or live link.'
    });
  }

  // No fake “only for X days” countdowns
  const fakeCountdownRegex =
    /only .* days left|sale ends .* hours|limited time offer .* ends .* hours/i;

  if (fakeCountdownRegex.test(body)) {
    issues.push({
      type: 'fake_countdown_language',
      description:
        'Article uses fake limited‑time countdown language against policy.'
    });
  }

  return { valid: issues.length === 0, issues };
};

/**
 * Enforce truthfulness / no hallucinated stats
 */
const enforceTruthfulness = (body, strategy) => {
  const issues = [];

  const statRegex = /recent study.*showed|research.*shows|studies indicate|it is widely believed|data from|according to \w+.*report/i;

  if (statRegex.test(body) && !strategy.citations) {
    issues.push({
      type: 'unsubstantiated_stat',
      description:
        'Article uses vague “recent study”‑style claims without a citation in strategy.'
    });
  }

  // Fake round‑number stats
  const fakeRoundStatsRegex =
    /(\d{3,}\s+)|\d{4,}/g; // 100+ users, 1,000+ features, etc.

  const matches = body.match(fakeRoundStatsRegex) || [];

  if (matches.length > 5 && !strategy.statData) {
    issues.push({
      type: 'excessive_round_number_stats',
      description:
        'Article uses many round‑number stats without real data backing.'
    });
  }

  return { valid: issues.length === 0, issues };
};

/**
 * Enforce brand‑safety (no deceptive claims, no slurs)
 */
const enforceBrandSafety = (body, strategy) => {
  const issues = [];

  const toxicPatterns = [
    'hate', 'racist', 'sexist', 'n word', 'slur', 'attack', 'harass', 'stupid', 'idiots'
  ];

  toxicPatterns.forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    if (regex.test(body)) {
      issues.push({
        type: 'toxic_language',
        value: pattern,
        description: `Article contains toxic or offensive term: "${pattern}".`
      });
    }
  });

  // No fake “guaranteed top ranking” SEO promises
  const SEODeceptionRegex =
    /guarantee.*rank #1|guaranteed #1 rankings|top spot guaranteed|top of Google/i;

  if (SEODeceptionRegex.test(body)) {
    issues.push({
      type: 'seo_deception',
      description:
        'Article makes deceptive “guaranteed top ranking” SEO claims against policy.'
    });
  }

  return { valid: issues.length === 0, issues };
};

/**
 * Main policy‑audit function
 */
const auditPolicy = (articleBody, strategy) => {
  const allIssues = [];

  // 1. Affiliate + monetization
  const affiliate = enforceAffiliateRules(articleBody, strategy);
  allIssues.push(...affiliate.issues);

  // 2. Truthfulness / stats
  const truth = enforceTruthfulness(articleBody, strategy);
