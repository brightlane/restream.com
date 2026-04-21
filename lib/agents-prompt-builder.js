// lib/agents-prompt-builder.js
// Builds full prompts for all 10 agents:
//   globalRules + rolePrompt

const path = require('path');
const fs = require('fs');

// Import the global rules (all 10 AIs must follow)
const { globalRulesPrompt } = require('./global-rules');

// Map: agentName → prompt file name (expects txt in prompts/)
const agentPromptMap = {
  'agent-1-keyword-research': 'agent-1-keyword-research.prompt.txt',
  'agent-2-topic-strategy': 'agent-2-topic-strategy.prompt.txt',
  'agent-3-outline': 'agent-3-outline.prompt.txt',
  'agent-4-writer': 'agent-4-writer.prompt.txt',
  'agent-5-readability': 'agent-5-readability.prompt.txt',
  'agent-6-editor': 'agent-6-editor.prompt.txt',
  'agent-7-fact-check': 'agent-7-fact-check.prompt.txt',
  'agent-8-technical-seo': 'agent-8-technical-seo.prompt.txt',
  'agent-9-monitoring': 'agent-9-monitoring.prompt.txt',
  'agent-10-policy': 'agent-10-policy.prompt.txt'
};

// Path to your prompts/ folder (e.g., restream.com/prompts/)
const promptsDir = path.join(__dirname, '..', 'prompts');

/**
 * Read an agent’s role‑specific prompt file (plain text)
 *
 * Input:  agentKey (e.g., 'agent-1-keyword-research')
 * Output: rolePrompt (string)
 */
const readRolePrompt = (agentKey) => {
  const fileName = agentPromptMap[agentKey];
  if (!fileName) {
    throw new Error(`No prompt file defined for agent key: ${agentKey}`);
  }

  const filePath = path.join(promptsDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8').trim();
};

/**
 * Build the full prompt for an agent:
 *   globalRulesPrompt + rolePrompt
 *
 * Input:  agentKey (e.g., 'agent-1-keyword-research')
 * Output: fullPrompt (string)
 */
const buildFullPrompt = (agentKey) => {
  const rolePrompt = readRolePrompt(agentKey);

  // Clean up extra newlines; keep structure clean
  const normalizedRolePrompt = rolePrompt
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `${globalRulesPrompt}\n\n${normalizedRolePrompt}`;
};

module.exports = { buildFullPrompt, agentPromptMap, readRolePrompt };
