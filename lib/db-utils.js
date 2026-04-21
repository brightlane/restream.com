// lib/db-utils.js
// Central database / observations utilities for your 10‑AI pipeline

// In practice, you'd wire this to Postgres, MySQL, or a file‑based store.
// This is a minimal in‑memory / JSON‑based simulation you can adapt later.

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data'); // e.g., ./data/

const ensureDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Generic read from JSON file
const readJSON = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const dataRaw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(dataRaw);
};

// Generic write to JSON file
const writeJSON = (filename, data) => {
  ensureDir();
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// 1. Keywords / keyword batches
const getKeywords = () => {
  return readJSON('keywords.json');
};

const appendKeywords = (newBatch) => {
  const existing = getKeywords();
  const merged = [...existing, ...newBatch];
  writeJSON('keywords.json', merged);
};

// 2. Articles / pages
const getArticles = () => {
  return readJSON('articles.json');
};

const saveArticle = (article) => {
  const articles = getArticles();
  articles.push(article);
  writeJSON('articles.json', articles);
};

// 3. Observations (Monitoring + Policy)
const getObservations = () => {
  return readJSON('observations.json');
};

const logObservation = (observation) => {
  const observations = getObservations();
  observation.timestamp = new Date().toISOString();
  observations.push(observation);
  writeJSON('observations.json', observations);
};

// 4. Pages that need rewrite
const getPagesNeedingRewrite = () => {
  const observations = getObservations();
  const pages = observations.filter(
    obs =>
      obs.action === "auto_rewrite" &&
      obs.status === "needs_rewrite"
  );

  return pages;
};

// 5. Estrategy.json access
const getLatestStrategy = () => {
  const strategyPath = path.join(__dirname, '..', 'strategy.json');
  const data = fs.readFileSync(strategyPath, 'utf8');
  return JSON.parse(data);
};

// 6. Recent “Ranked” / Live pages (for Monitoring / AI‑search)
const getRankedPages = () => {
  const articles = getArticles();
  return articles.filter(article => article.is_live === true);
};

module.exports = {
  getKeywords,
  appendKeywords,
  getArticles,
  saveArticle,
  getObservations,
  logObservation,
  getPagesNeedingRewrite,
  getLatestStrategy,
  getRankedPages
};
