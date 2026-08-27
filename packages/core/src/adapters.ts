import path from 'node:path';
import type { AdapterName, CodeMementoConfig, RepositoryDetection } from './types.js';
import { agentsContent } from './templates.js';

export interface Adapter {
  name: AdapterName;
  path: string;
  content(config: CodeMementoConfig, detection: RepositoryDetection): string;
}

export const BUILTIN_ADAPTERS: Adapter[] = [
  {
    name: 'agents',
    path: 'AGENTS.md',
    content: (config, detection) => agentsContent(config, detection),
  },
  {
    name: 'claude',
    path: 'CLAUDE.md',
    content: (config) => `# CodeMemento\n\n@${config.canonicalInstructions}\n\nThe imported file is the canonical repository instruction map. Keep durable project knowledge in the repository documentation referenced there instead of duplicating it here.`,
  },
  {
    name: 'copilot',
    path: path.join('.github', 'copilot-instructions.md'),
    content: (config) => `# CodeMemento\n\nUse \`${config.canonicalInstructions}\` as the canonical repository instruction map. Read the relevant documents it references before making non-trivial changes. Preserve and update durable repository knowledge when behavior changes.`,
  },
  {
    name: 'gemini',
    path: 'GEMINI.md',
    content: (config) => `# CodeMemento\n\nUse \`${config.canonicalInstructions}\` as the canonical repository instruction map. Read relevant project documentation before changing code and keep durable docs synchronized with implemented behavior.`,
  },
  {
    name: 'cursor',
    path: path.join('.cursor', 'rules', 'codememento.mdc'),
    content: (config) => `---\ndescription: CodeMemento repository knowledge workflow\nalwaysApply: true\n---\n\nUse \`${config.canonicalInstructions}\` as the canonical repository instruction map. Read relevant documentation before non-trivial changes and update durable docs when behavior changes.`,
  },
];
