// lib/affiliates-validator.js
// Restream affiliate validator (stub / minimal for now)

const loadRestreamAffiliates = () => {
  // In practice, this would read from config/restream-affiliates.json
  return {
    affiliates: [
      {
        url: 'https://restream.io/a/your-affiliate-id',
        regex: /restream\.io\/a\/\w+/
      }
    ]
  };
};

const validateAffiliateLinks = (body, strategy) => {
  const issues = [];

  // Example: check if Restream affiliate link is present
  const affiliateRegex = /restream\.io\/a\/\w+/;
  const hasAffiliateLink = affiliateRegex.test(body);

  if (!hasAffiliateLink) {
    issues.push({
      type: 'missing_affiliate_link',
      description: 'Restream affiliate link not found in article body.'
    });
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

module.exports = { loadRestreamAffiliates, validateAffiliateLinks };
