// affiliates-validator.js
// Validates that every Restream‑related page includes a valid Restream affiliate link

const path = require('path');
const fs = require('fs');

// Path to your Restream affiliates config
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'restream-affiliates.json');

/**
 * Read the Restream affiliate config (restream_affiliates.json)
 *
 * Output: config object with campaigns array
 */
const loadRestreamAffiliates = () => {
  const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(configRaw);
};

/**
 * Build a list of valid affiliate URLs from config
 *
 * Input:  config = restream_affiliates.json object
 * Output: array of URLs (e.g., ["https://try.restream.io/studio-PalmariniServices", ...])
 */
const getAffiliateUrls = (config) => {
  return config.campaigns.map(campaign => campaign.url);
};

/**
 * Check if the given HTML contains at least one valid Restream affiliate link.
 *
 * Input:  html (string), configPath (optional override)
 * Output: {
 *           valid: boolean,
 *           issues: [] or [{ type, explanation }]
 *         }
 */
const validateAffiliateLinks = (html, configPath = CONFIG_PATH) => {
  // 1. Load config
  const config = loadRestreamAffiliates();

  // 2. Extract valid URLs from config
  const validUrls = getAffiliateUrls(config);

  // 3. Check if any valid URL appears in the HTML
  const hasAffiliateLink = validUrls.some(url => html.includes(url));

  if (!hasAffiliateLink) {
    return {
      valid: false,
      issues: [
        {
          type: "missing_affiliate_link",
          explanation: `No valid Restream affiliate link (from config) found in this page.`
        }
      ]
    };
  }

  return {
    valid: true,
    issues: []
  };
};

module.exports = { validateAffiliateLinks, loadRestreamAffiliates, getAffiliateUrls };

// If you run this directly for testing:
if (require.main === module) {
  const exampleHtml = `
    <p>Start streaming with Restream at
      <a href="https://try.restream.io/studio-PalmariniServices" rel="sponsored">
        Restream Studio
      </a>.
    </p>
  `;

  const result = validateAffiliateLinks(exampleHtml);
  console.log("\n🔍 Affiliate validation test result:");
  console.log("- Valid:", result.valid);
  console.log("- Issues:", result.issues);
}
