// agent-9-monitoring.js
// Agent 9 – Monitoring: SEO / performance + language‑discovery

const { logObservation } = require('../lib/db-utils');
const { getActiveLanguages, addLanguage } = require('../config/language-profiles');

/**
 * Get “traffic data” (pseudo‑API call; plug in your real GSC / GA / logs later)
 */
const fetchTrafficData = async () => {
  // In practice, you’d:
  //  - call Google Search Console API
  //  - or your own analytics DB
  // This is just a mock return shape
  return [
    { page: '/en/restream/page-1', lang: 'en', clicks: 120, impressions: 450 },
    { page: '/es/restream/page-1', lang: 'es', clicks: 80, impressions: 320 },
    { page: '/en/restream/page-2', lang: 'en', clicks: 60, impressions: 200 },
    { page: '/de/restream/page-2', lang: 'de', clicks: 40, impressions: 180 },
    { page: '/en/restream/page-3', lang: 'en', clicks: 10, impressions: 80 }, // low‑traffic
    { page: '/newlang/restream/page-1', lang: 'newlang', clicks: 250, impressions: 1200 } // new language
  ];
};

/**
 * Detect low‑performing / broken pages
 */
const detectLowPerformance = (pages) => {
  const observations = [];

  pages.forEach(page => {
    const clicks = page.clicks || 0;
    const impressions = page.impressions || 0;

    if (clicks === 0 && impressions > 100) {
      observations.push({
        page_url: page.page,
        type: 'zero_clicks',
        clicks,
        impressions,
        agent: 'agent-9-monitoring',
        action: 'review_meta_or_rewrite'
      });
    } else if (clicks > 0 && impressions > 0 && clicks / impressions < 0.02) {
      observations.push({
        page_url: page.page,
        type: 'low_ctr',
        clicks,
        impressions,
        ctr: clicks / impressions,
        agent: 'agent-9-monitoring',
        action: 'improve_title_meta_or_cta'
      });
    }
  });

  return observations;
};

/**
 * Auto‑discover new languages from traffic data
 */
const discoverNewLanguages = (trafficData) => {
  const observations = [];

  const knownLangCodes = getActiveLanguages().map(l => l.code);
  const langCounts = {};

  trafficData.forEach(row => {
    const lang = row.lang || 'en';
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  Object.keys(langCounts).forEach(langCode => {
    if (!knownLangCodes.includes(langCode)) {
      const langName = langCode === 'newlang' ? 'New Language' : langCode.toUpperCase();

      addLanguage(langCode, langName, 30); // auto‑add with medium‑low priority

      observations.push({
        type: 'language_discovery',
        lang: langCode,
        page_count: langCounts[lang],
        agent: 'agent-9-monitoring',
        action: 'added_to_auto_translate'
      });
    }
  });

  return observations;
};

/**
 * Main monitoring function
 */
const trackPerformance = async (pages) => {
  const observations = [];

  pages = pages || [];

  // 1. Detect low‑performing pages
  const lowPerf = detectLowPerformance(pages);
  observations.push(...lowPerf);

  // 2. Auto‑discover new languages from traffic
  const langData = await fetchTrafficData();
  const langObs = discoverNewLanguages(langData);
  observations.push(...langObs);

  // 3. Snapshot overall health
  observations.push({
    type: 'monitoring_snapshot',
    total_pages: pages.length,
    low_ctr_pages: lowPerf.filter(o => o.type === 'low_ctr').length,
    zero_click_pages: lowPerf.filter(o => o.type === 'zero_clicks').length,
    new_languages_detected: langObs.length,
    agent: 'agent-9-monitoring',
    timestamp: new Date().toISOString()
  });

  return observations;
};

module.exports = { trackPerformance, detectLowPerformance, discoverNewLanguages };
