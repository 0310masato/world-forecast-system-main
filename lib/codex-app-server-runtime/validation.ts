import { assertNoRestrictedContent } from '../memory/validation';
import {
  CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUTS,
  CODEX_APP_SERVER_RUNTIME_MVP_EXECUTION_MODES,
  CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS,
  CODEX_APP_SERVER_RUNTIME_MVP_REQUIRED_SAFETY_LABELS,
  CODEX_APP_SERVER_RUNTIME_MVP_RUNTIME_STATES,
  CODEX_APP_SERVER_RUNTIME_MVP_SCAFFOLD_VERSION,
  CODEX_APP_SERVER_RUNTIME_MVP_SCOPES,
  type CodexAppServerRuntimeMvpValidationIssue,
  type CodexAppServerRuntimeMvpValidationResult,
} from './types';

type UnknownRecord = Record<string, unknown>;

const CODEX_APP_SERVER_RUNTIME_MVP_SCOPE_SET = new Set<string>(
  CODEX_APP_SERVER_RUNTIME_MVP_SCOPES,
);
const CODEX_APP_SERVER_RUNTIME_MVP_RUNTIME_STATE_SET = new Set<string>(
  CODEX_APP_SERVER_RUNTIME_MVP_RUNTIME_STATES,
);
const CODEX_APP_SERVER_RUNTIME_MVP_EXECUTION_MODE_SET = new Set<string>(
  CODEX_APP_SERVER_RUNTIME_MVP_EXECUTION_MODES,
);
const CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUT_SET = new Set<string>(
  CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUTS,
);
const CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATION_SET = new Set<string>(
  CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS,
);

const REQUIRED_FALSE_BOUNDARY_FLAGS = [
  ['protected_core_connected', 'protected_core_connection_disabled_required'],
  ['api_connection_enabled', 'api_connection_disabled_required'],
  ['db_connection_enabled', 'db_connection_disabled_required'],
  ['db_read_enabled', 'db_read_disabled_required'],
  ['db_write_enabled', 'db_write_disabled_required'],
  ['worker_runtime_enabled', 'worker_runtime_disabled_required'],
  ['scheduler_runtime_enabled', 'scheduler_runtime_disabled_required'],
  ['external_api_integration_enabled', 'external_api_integration_disabled_required'],
  ['package_change_allowed', 'package_change_disallowed_required'],
  ['ci_change_allowed', 'ci_change_disallowed_required'],
  ['automation_enabled', 'automation_disabled_required'],
  ['github_automation_enabled', 'github_automation_disabled_required'],
  ['file_writing_automation_enabled', 'file_writing_automation_disabled_required'],
  ['ai_job_execution_enabled', 'ai_job_execution_disabled_required'],
  ['production_promotion_allowed', 'production_promotion_disallowed_required'],
] as const;

const HIGH_RISK_OPERATION_RECOMMENDATION_PATTERNS = [
  {
    name: 'production deployment recommendation',
    pattern: /\bdeploy\b[\w\s-]{0,80}\bto\s+production\b/i,
  },
  {
    name: 'direct deployment recommendation',
    pattern: /\bdirect(?:ly)?\s+deploy\b/i,
  },
  {
    name: 'external publishing recommendation',
    pattern: /\b(?:publish\b[\w\s-]{0,80}\bexternally|external(?:ly)?\s+publish(?:ing)?)\b/i,
  },
  {
    name: 'automated trading recommendation',
    pattern: /\b(?:start|begin|enable|trigger|run|use\s+(?:this|proposal)?\s*for)\s+automated\s+trading\b/i,
  },
  {
    name: 'navigation guidance recommendation',
    pattern: /\b(?:use\s+(?:this|proposal)?\s*(?:for|as)\s+navigation(?:\s+guidance)?|navigation\s+guidance)\b/i,
  },
  {
    name: 'military guidance recommendation',
    pattern: /\bmilitary\s+(?:action|decision|guidance)\b/i,
  },
  {
    name: 'forecast API update recommendation',
    pattern: /\b(?:update|modify|change|patch|connect|write\s+to)\s+\/api\/forecast\b/i,
  },
  {
    name: 'Hormuz API update recommendation',
    pattern: /\b(?:update|modify|change|patch|connect|write\s+to)\s+\/api\/hormuz\b/i,
  },
  {
    name: 'database action recommendation',
    pattern: /\b(?:read|write|save|persist|update)\s+(?:to\s+|from\s+)?(?:the\s+)?(?:production\s+)?(?:database|DB)\b/i,
  },
  {
    name: 'database migration recommendation',
    pattern: /\b(?:run|create|add|apply)\s+(?:a\s+)?(?:database\s+)?migration\b/i,
  },
  {
    name: 'worker runtime recommendation',
    pattern: /\b(?:add|create|enable|run|start)\s+(?:a\s+)?worker\s+runtime\b/i,
  },
  {
    name: 'scheduler runtime recommendation',
    pattern: /\b(?:add|create|enable|run|start)\s+(?:a\s+)?scheduler\s+runtime\b/i,
  },
  {
    name: 'external API integration recommendation',
    pattern: /\b(?:add|create|enable|connect)\s+(?:an?\s+)?external\s+API\s+integration\b/i,
  },
  {
    name: 'production promotion recommendation',
    pattern: /\b(?:promote|apply|use)\b[\w\s-]{0,80}\bproduction\b/i,
  },
  {
    name: 'Japanese production application recommendation',
    pattern: /本番(?:へ|に)?反映/,
  },
  {
    name: 'Japanese external publishing recommendation',
    pattern: /外部公開/,
  },
  {
    name: 'Japanese automated trading recommendation',
    pattern: /自動取引/,
  },
  {
    name: 'Japanese navigation decision recommendation',
    pattern: /航法判断/,
  },
  {
    name: 'Japanese military decision recommendation',
    pattern: /軍事判断/,
  },
  {
    name: 'Japanese forecast API update recommendation',
    pattern: /\/api\/forecast\s*を\s*(?:変更|更新|修正|接続|改修|書き換え)/,
  },
  {
    name: 'Japanese Hormuz API update recommendation',
    pattern: /\/api\/hormuz\s*を\s*(?:変更|更新|修正|接続|改修|書き換え)/,
  },
  {
    name: 'Japanese database migration recommendation',
    pattern: /(?:DB|データベース)\s*(?:migration|マイグレーション|移行)/i,
  },
  {
    name: 'Japanese direct deployment recommendation',
    pattern: /(?:直接|直ちに)?デプロイ/,
  },
] as const;

function asRecord(value: unknown): UnknownRecord | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUnixSeconds(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function addIssue(
  issues: CodexAppServerRuntimeMvpValidationIssue[],
  params: Omit<CodexAppServerRuntimeMvpValidationIssue, 'severity'>,
): void {
  issues.push({
    ...params,
    severity: 'blocking',
  });
}

function getRestrictedContentIssue(value: unknown): string | null {
  try {
    assertNoRestrictedContent(value, 'codexAppServerRuntimeMvpScaffold');
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Codex App Server runtime MVP scaffold contains restricted content.';
  }
}

function getHighRiskOperationRecommendationIssue(
  value: unknown,
  path: string,
): { message: string; path: string } | null {
  if (typeof value !== 'string') {
    return null;
  }

  for (const { name, pattern } of HIGH_RISK_OPERATION_RECOMMENDATION_PATTERNS) {
    if (pattern.test(value)) {
      return {
        message: `${path} contains a high-risk operation recommendation: ${name}.`,
        path,
      };
    }
  }

  return null;
}

function validateStringArray(params: {
  scaffold: UnknownRecord;
  issues: CodexAppServerRuntimeMvpValidationIssue[];
  key: 'policy_refs' | 'safety_labels' | 'limitations' | 'review_notes';
}): void {
  const value = params.scaffold[params.key];

  if (!Array.isArray(value)) {
    addIssue(params.issues, {
      code: `${params.key}_invalid`,
      message: `${params.key} must be an array.`,
      path: params.key,
    });
    return;
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addIssue(params.issues, {
        code: `${params.key}_item_invalid`,
        message: `${params.key} items must be non-empty strings.`,
        path: `${params.key}[${index}]`,
      });
    }
  });
}

function validateEnumArray(params: {
  scaffold: UnknownRecord;
  issues: CodexAppServerRuntimeMvpValidationIssue[];
  key: 'allowed_outputs' | 'forbidden_operations';
  allowedValues: Set<string>;
}): void {
  const value = params.scaffold[params.key];

  if (!Array.isArray(value)) {
    addIssue(params.issues, {
      code: `${params.key}_invalid`,
      message: `${params.key} must be an array.`,
      path: params.key,
    });
    return;
  }

  value.forEach((item, index) => {
    if (typeof item !== 'string' || !params.allowedValues.has(item)) {
      addIssue(params.issues, {
        code: `${params.key}_item_invalid`,
        message: `${params.key} contains an unsupported value.`,
        path: `${params.key}[${index}]`,
      });
    }
  });
}

function validateRepositoryRelativePolicyRefs(
  scaffold: UnknownRecord,
  issues: CodexAppServerRuntimeMvpValidationIssue[],
): void {
  if (!Array.isArray(scaffold.policy_refs)) {
    return;
  }

  scaffold.policy_refs.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      return;
    }

    const value = item.trim();
    if (
      value.startsWith('/')
      || value.startsWith('\\')
      || value.includes('\\')
      || value.includes('://')
      || value.split('/').includes('..')
    ) {
      addIssue(issues, {
        code: 'policy_ref_not_repository_relative',
        message: 'policy_refs must use sanitized repository-relative paths.',
        path: `policy_refs[${index}]`,
      });
    }
  });
}

function validateRequiredSafetyLabels(
  scaffold: UnknownRecord,
  issues: CodexAppServerRuntimeMvpValidationIssue[],
): void {
  if (!Array.isArray(scaffold.safety_labels)) {
    return;
  }

  for (const label of CODEX_APP_SERVER_RUNTIME_MVP_REQUIRED_SAFETY_LABELS) {
    if (!scaffold.safety_labels.includes(label)) {
      addIssue(issues, {
        code: 'safety_label_missing',
        message: `Codex App Server runtime MVP scaffold must include safety label: ${label}.`,
        path: 'safety_labels',
      });
    }
  }
}

function validateRequiredForbiddenOperations(
  scaffold: UnknownRecord,
  issues: CodexAppServerRuntimeMvpValidationIssue[],
): void {
  if (!Array.isArray(scaffold.forbidden_operations)) {
    return;
  }

  for (const operation of CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS) {
    if (!scaffold.forbidden_operations.includes(operation)) {
      addIssue(issues, {
        code: 'forbidden_operation_missing',
        message: `Codex App Server runtime MVP scaffold must forbid ${operation}.`,
        path: 'forbidden_operations',
      });
    }
  }
}

function validateNoHighRiskOperationRecommendations(
  scaffold: UnknownRecord,
  issues: CodexAppServerRuntimeMvpValidationIssue[],
): void {
  const candidates: Array<{ value: unknown; path: string }> = [];

  for (const key of ['limitations', 'review_notes'] as const) {
    if (Array.isArray(scaffold[key])) {
      scaffold[key].forEach((item, index) => {
        candidates.push({
          value: item,
          path: `${key}[${index}]`,
        });
      });
    }
  }

  for (const candidate of candidates) {
    const recommendationIssue = getHighRiskOperationRecommendationIssue(
      candidate.value,
      candidate.path,
    );
    if (recommendationIssue) {
      addIssue(issues, {
        code: 'high_risk_operation_recommendation',
        message: recommendationIssue.message,
        path: recommendationIssue.path,
      });
    }
  }
}

export function validateCodexAppServerRuntimeMvpScaffold(
  scaffold: unknown,
): CodexAppServerRuntimeMvpValidationResult {
  const issues: CodexAppServerRuntimeMvpValidationIssue[] = [];
  const scaffoldRecord = asRecord(scaffold);

  if (!scaffoldRecord) {
    addIssue(issues, {
      code: 'scaffold_invalid',
      message: 'Codex App Server runtime MVP scaffold must be an object.',
    });
    return { passed: false, issues };
  }

  if (!isNonEmptyString(scaffoldRecord.scaffold_id)) {
    addIssue(issues, {
      code: 'scaffold_id_missing',
      message: 'scaffold_id must be a non-empty string.',
      path: 'scaffold_id',
    });
  }

  if (scaffoldRecord.scaffold_version !== CODEX_APP_SERVER_RUNTIME_MVP_SCAFFOLD_VERSION) {
    addIssue(issues, {
      code: 'scaffold_version_invalid',
      message: `scaffold_version must be ${CODEX_APP_SERVER_RUNTIME_MVP_SCAFFOLD_VERSION}.`,
      path: 'scaffold_version',
    });
  }

  if (
    typeof scaffoldRecord.scope !== 'string'
    || !CODEX_APP_SERVER_RUNTIME_MVP_SCOPE_SET.has(scaffoldRecord.scope)
  ) {
    addIssue(issues, {
      code: 'scope_invalid',
      message: `scope must be one of: ${CODEX_APP_SERVER_RUNTIME_MVP_SCOPES.join(', ')}.`,
      path: 'scope',
    });
  }

  if (!isUnixSeconds(scaffoldRecord.created_at)) {
    addIssue(issues, {
      code: 'created_at_invalid',
      message: 'created_at must be a non-negative integer Unix timestamp in seconds.',
      path: 'created_at',
    });
  }

  if (
    typeof scaffoldRecord.runtime_state !== 'string'
    || !CODEX_APP_SERVER_RUNTIME_MVP_RUNTIME_STATE_SET.has(scaffoldRecord.runtime_state)
  ) {
    addIssue(issues, {
      code: 'runtime_state_disabled_required',
      message: 'runtime_state must remain disabled.',
      path: 'runtime_state',
    });
  }

  if (
    typeof scaffoldRecord.execution_mode !== 'string'
    || !CODEX_APP_SERVER_RUNTIME_MVP_EXECUTION_MODE_SET.has(scaffoldRecord.execution_mode)
  ) {
    addIssue(issues, {
      code: 'execution_mode_local_only_required',
      message: 'execution_mode must remain local_only.',
      path: 'execution_mode',
    });
  }

  if (scaffoldRecord.proposal_only !== true) {
    addIssue(issues, {
      code: 'proposal_only_required',
      message: 'Codex App Server runtime MVP scaffold must remain proposal_only.',
      path: 'proposal_only',
    });
  }

  if (scaffoldRecord.is_production_state !== false) {
    addIssue(issues, {
      code: 'non_production_state_required',
      message: 'Codex App Server runtime MVP scaffold must not be production state.',
      path: 'is_production_state',
    });
  }

  if (scaffoldRecord.required_human_approval !== true) {
    addIssue(issues, {
      code: 'required_human_approval_required',
      message: 'Codex App Server runtime MVP scaffold must require human approval.',
      path: 'required_human_approval',
    });
  }

  if (scaffoldRecord.disabled_by_default !== true) {
    addIssue(issues, {
      code: 'disabled_by_default_required',
      message: 'Codex App Server runtime MVP scaffold must be disabled by default.',
      path: 'disabled_by_default',
    });
  }

  if (scaffoldRecord.local_only !== true) {
    addIssue(issues, {
      code: 'local_only_required',
      message: 'Codex App Server runtime MVP scaffold must remain local-only.',
      path: 'local_only',
    });
  }

  for (const [fieldName, code] of REQUIRED_FALSE_BOUNDARY_FLAGS) {
    if (scaffoldRecord[fieldName] !== false) {
      addIssue(issues, {
        code,
        message: `${fieldName} must remain false.`,
        path: fieldName,
      });
    }
  }

  validateStringArray({ scaffold: scaffoldRecord, issues, key: 'policy_refs' });
  validateStringArray({ scaffold: scaffoldRecord, issues, key: 'safety_labels' });
  validateStringArray({ scaffold: scaffoldRecord, issues, key: 'limitations' });
  validateStringArray({ scaffold: scaffoldRecord, issues, key: 'review_notes' });
  validateEnumArray({
    scaffold: scaffoldRecord,
    issues,
    key: 'allowed_outputs',
    allowedValues: CODEX_APP_SERVER_RUNTIME_MVP_ALLOWED_OUTPUT_SET,
  });
  validateEnumArray({
    scaffold: scaffoldRecord,
    issues,
    key: 'forbidden_operations',
    allowedValues: CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATION_SET,
  });
  validateRepositoryRelativePolicyRefs(scaffoldRecord, issues);
  validateRequiredSafetyLabels(scaffoldRecord, issues);
  validateRequiredForbiddenOperations(scaffoldRecord, issues);
  validateNoHighRiskOperationRecommendations(scaffoldRecord, issues);

  const restrictedContentIssue = getRestrictedContentIssue(scaffoldRecord);
  if (restrictedContentIssue) {
    addIssue(issues, {
      code: 'restricted_content_detected',
      message: restrictedContentIssue,
    });
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}
