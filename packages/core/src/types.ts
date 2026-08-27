export type AdapterName = 'agents' | 'claude' | 'copilot' | 'gemini' | 'cursor';

export type WorkKind = 'feature' | 'fix' | 'refactor' | 'docs' | 'chore';

export type WorktreeMode = 'required' | 'preferred' | 'off';

export type GitActionPolicy = 'allow' | 'ask' | 'forbid';

export type Severity = 'info' | 'warning' | 'error';

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  path?: string;
}

export interface RepositoryDetection {
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  monorepo: boolean;
}

export interface CodeMementoConfig {
  version: 1;
  canonicalInstructions: string;
  docs: {
    root: string;
    product: string;
    architecture: string;
    adr: string;
    protocol: string;
    features: string;
    plans: string;
    quality: string;
    runbooks: string;
    changes: string;
    references: string;
    generated: string;
  };
  agents: Record<AdapterName, boolean>;
  changes: {
    required: string[];
  };
  features: {
    required: string[];
  };
  plans: {
    requiredHeadings: string[];
  };
  development: {
    git: {
      remote: string;
      baseBranch: string;
      protectedBranches: string[];
      fetchBeforeStart: boolean;
      branch: {
        required: boolean;
        patterns: Record<WorkKind, string>;
      };
      worktree: {
        mode: WorktreeMode;
        root: string;
      };
      actions: {
        commit: GitActionPolicy;
        push: GitActionPolicy;
        merge: GitActionPolicy;
        deleteBranch: GitActionPolicy;
      };
    };
    finish: {
      commands: string[];
      completePlan: boolean;
    };
  };
  governance: {
    missingStructure: 'off' | 'warn' | 'error';
    brokenLinks: 'off' | 'warn' | 'error';
    missingChangeDocs: 'off' | 'warn' | 'error';
    missingFeatureDocs: 'off' | 'warn' | 'error';
    staleAdapters: 'off' | 'warn' | 'error';
    activePlanShape: 'off' | 'warn' | 'error';
    completedPlanInActive: 'off' | 'warn' | 'error';
    retiredPaths: 'off' | 'warn' | 'error';
    gitWorkflow: 'off' | 'warn' | 'error';
  };
  retiredPaths: string[];
}

export interface InitResult {
  created: string[];
  updated: string[];
  preserved: string[];
  detection: RepositoryDetection;
  adoptedExisting: boolean;
}

export interface SyncResult {
  updated: string[];
  unchanged: string[];
}

export interface ChangeResult {
  name: string;
  path: string;
  files: string[];
}

export interface GitWorkspaceInfo {
  repository: boolean;
  branch?: string;
  dirty: boolean;
  linkedWorktree: boolean;
  topLevel?: string;
}

export interface DevelopmentStartResult {
  kind: WorkKind;
  name: string;
  branch: string;
  baseRef: string;
  worktree: string;
  plan: string;
  feature?: string;
}

export interface DevelopmentFinishResult {
  branch: string;
  plan?: string;
  commands: string[];
  checksPassed: boolean;
}

export interface DoctorResult {
  diagnostics: Diagnostic[];
  score: number;
}

export interface InspectionResult {
  initialized: boolean;
  detection: RepositoryDetection;
  instructionFiles: string[];
  documentationPaths: string[];
  verificationFiles: string[];
  signals: {
    canonicalAgentMap: boolean;
    docsIndex: boolean;
    productKnowledge: boolean;
    architectureKnowledge: boolean;
    decisions: boolean;
    features: boolean;
    executionPlans: boolean;
    runbooks: boolean;
    quality: boolean;
    generatedDocs: boolean;
    docsVerification: boolean;
  };
  score: number;
  maturity: 'minimal' | 'structured' | 'mature';
  recommendations: string[];
}

export interface RepositoryStatus {
  features: string[];
  activePlans: string[];
  completedPlans: string[];
  activeChanges: string[];
  completedChanges: string[];
  health: DoctorResult;
}
