// lib/db-utils.js
// Central DB / memory utilities for the 10‑AI‑team‑brain

// In memory (you would wire this to DB / file system later)
let keywords = [];
let articles = [];
let observations = [];
let strategy = {
  version: '1.0.0',
  productData: {},
  strategyData: {}
};

// 1. Keywords
const getKeywords = () => keywords;

const appendKeywords = (newKeywords) => {
  keywords = [...keywords, ...newKeywords];
};

// 2. Articles
const getArticlesForRepair = () => {
  // Example: return articles that need repair
  return articles.filter(article => {
    // In practice, base this on observations, word count, etc.
    return true; // temporary: all articles are candidates
  });
};

const markArticleAsRepaired = (article) => {
  const idx = articles.findIndex(a => a._id === article._id);
  if (idx !== -1) {
    articles[idx] = article;
  } else {
    articles.push(article);
  }
};

const saveArticle = (article) => {
  const idx = articles.findIndex(a => a._id === article._id);
  if (idx !== -1) {
    articles[idx] = article;
  } else {
    articles.push({
      ...article,
      _id: Date.now() + Math.random()
    });
  }
};

// 3. Observations
const logObservation = (observation) => {
  observations.push({
    ...observation,
    timestamp: new Date().toISOString()
  });
};

const getObservations = () => observations;

// 4. Strategy
const getLatestStrategy = () => {
  return strategy;
};

const setStrategy = (newStrategy) => {
  strategy = {
    ...strategy,
    ...newStrategy
  };
};

// 5. For this example, mock ranked pages
const getRankedPages = async () => {
  return articles.map(article => ({
    page: `/en/restream/${article.slug}`,
    lang: article.lang || 'en',
    clicks: Math.floor(Math.random() * 100),
    impressions: Math.floor(Math.random() * 500)
  }));
};

module.exports = {
  getKeywords,
  appendKeywords,
  saveArticle,
  logObservation,
  getLatestStrategy,
  getRankedPages,
  getArticlesForRepair,
  markArticleAsRepaired,
  getObservations,
  setStrategy
};
