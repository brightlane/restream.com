// lib/robots-generator.js
// robots.txt generator that points to sitemap.xml

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'robots.txt');

// Customize these as needed
const ALLOWED_PATH_PREFIX = '/';
const SITEMAP_URL = 'https://yourdomain.com/sitemap.xml';

/**
 * Generate robots.txt content
 */
const generateRobotsTxt = () => {
  const content = `User-agent: *
Disallow:
Sitemap: ${SITEMAP_URL}

# Disallow sensitive areas (examples, add your own)
User-agent: *
Disallow: /admin/
Disallow: /private/
`;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');

  console.log(`✅ robots.txt saved to: ${OUTPUT_FILE}`);
  console.log(`   - Sitemap location: ${SITEMAP_URL}`);
};

module.exports = { generateRobotsTxt };
