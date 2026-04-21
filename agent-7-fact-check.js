// agent-7-fact-check.js
// Agent 7 – Fact‑check + data‑freshness enforcement

const { logObservation } = require('../lib/db-utils');

/**
 * Simple fuzzy string match for fact‑checking phrases
 */
const containsPhrase = (text, phrase) => {
  return text.toLowerCase().includes(phrase.toLowerCase());
};

/**
 * Check for Restream‑specific facts against product data
 */
const checkRestreamFacts = (body, productData) => {
  const issues = [];
  const bodyLower = body.toLowerCase();

  // 1. Pricing / plan claims
  if (productData.plans) {
    const planNames = productData.plans.map(p => p.name);

    planNames.forEach(name => {
      if (!bodyLower.includes(name.toLowerCase())) {
        issues.push({
          type: 'plan_mention_missing',
          value: name,
          description: `Plan name "${name}" appears in product data but not in article body.`
        });
      }
    });

    // Check for outdated pricing
    productData.plans.forEach(plan => {
      if (plan.max_price && bodyLower.includes(plan.name)) {
        const pricePattern = new RegExp(`\\$?\\d+\\.?\\d*.*${plan.name}`, 'i');
        if (!pricePattern.test(body)) {
          issues.push({
            type: 'plan_price_missing',
            value: plan.name,
            description: `Price for plan "${plan.name}" not clearly stated or missing.`
          });
        }
      }
    });
  }

  // 2. Feature existence
  if (productData.features) {
    const featureNames = productData.features.map(f => f.name);

    featureNames.forEach(name => {
      if (!bodyLower.includes(name.toLowerCase())) {
        issues.push({
          type: 'feature_mention_missing',
          value: name,
          description: `Feature "${name}" exists in product data but not mentioned in article.`
        });
      }
    });

    // Look for "fake" features (hallucinated, not in productData)
    const hallucinatedFeatures = [
      'feature not listed',
      'capability not listed',
      'feature only in beta'
    ]; // in practice, you’d compare against a canonical list

    hallucinatedFeatures.forEach(fakeName => {
      if (bodyLower.includes(fakeName)) {
        issues.push({
          type: 'hallucinated_feature',
          value: fakeName,
          description: `Article mentions "${fakeName}", which is not in the product data.`
        });
      }
    });
  }

  // 3. Platform integrations
  if (productData.platforms) {
    const platformNames = productData.platforms;

    platformNames.forEach(name => {
      if (!bodyLower.includes(name.toLowerCase())) {
        issues.push({
          type: 'platform_integrations_missing',
          value: name,
          description: `Integration with "${name}" exists but is not mentioned in article.`
        });
      }
    });
  }

  // 4. Fake stats / “recent studies”
  const fakeStatPatterns = /recent study.*showed|research.*shows|it has been proven|studies indicate|it is widely believed/i;

  if (fakeStatPatterns.test(body) && !productData.citations) {
    issues.push({
      type: 'unsubstantiated_claim',
      value: 'fake or vague study',
      description: `Article uses "recent study"‑style claims without a real citation in product data.`
    });
  }

  return {
    valid: issues.length === 
