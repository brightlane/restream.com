// lib/agents-prompt-builder.js
// Builds full prompts for all 10 agents:
//   globalRules + rolePrompt

const path = require('path');
const fs = require('fs');

const { globalRulesPrompt } = require('./global-rules');

// Map: agentName → promptFileName (without path)
const agentPromptMap = {
  'agent-1': 'agent-1-keyword-research.prompt.txt',
  'agent-2': 'agent-2-topic-strategy.prompt.txt',
  'agent-3': 'agent-3-outline.prompt.txt',
  'agent-4': 'agent-4-writer.prompt.txt',
  'agent-5': 'agent-5-readability.prompt.txt',
  'agent-6': 'agent-6-editor.prompt.txt',
  'agent-7': 'agent-7-fact-check.prompt.txt',
  'agent-8': 'agent-8-technical-seo.prompt.txt',
  'agent-9': 'agent-9-monitoring.prompt.txt',
  'agent-10': 'agent-10-policy.prompt.txt'
};

const promptsDir = path.join(__dirname, '..', 'prompts');

// Read an agent’s role‑prompt file (plain text)
const readRolePrompt = (agentName) => {
  const fileName = agentPromptMap[agentName];
  if (!fileName) {
    throw new Error(`No prompt file defined for agent ${agentName}`);
  }

  const filePath = path.join(promptsDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8').trim();
};

/**
 * Build the full prompt for an agent.
 *
 * Input:  agentName (e.g., 'agent-1')
 * Output: fullPrompt (globalRules + rolePrompt)
 */
const buildFullPrompt = (agentName) => {
  const rolePrompt = readRolePrompt(agentName);
  // Normalize line‑breaks and deduplicate extra whitespace
  const normalizedRolePrompt = rolePrompt
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `${globalRulesPrompt}\n\n${normalizedRolePrompt}`;
};

module.exports = { buildFullPrompt, agentPromptMap, readRolePrompt };
