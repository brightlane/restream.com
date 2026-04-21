// agents/agent-3-outline.js
// Agent 3 – Outline generator (minimal stub)

const generateOutline = (topic, strategy) => {
  const title = topic.title || 'How to Use Restream';
  const primary = topic.primary_keyword || 'Restream';
  const secondary = (topic.secondary_keywords || []).map(k => k.name || k);

  return {
    title,
    primaryKeyword: primary,
    secondaryKeywords: secondary,
    sections: [
      { heading: 'Introduction', depth: 1 },
      { heading: 'What is Restream?', depth: 2 },
      { heading: 'Why use Restream?', depth: 2 },
      { heading: 'How to get started', depth: 2 },
      { heading: 'Best practices', depth: 2 },
      { heading: 'Conclusion', depth: 1 }
    ],
    slug: (title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'default').replace(/^-+|-+$/g, '')
  };
};

module.exports = { generateOutline };
