import { spawnSync } from 'node:child_process';
import path from 'node:path';

const projectRoot = process.cwd();

const REQUIRED_FORBIDDEN_OPERATIONS = [
  'production_write',
  'production_promotion',
  'api_forecast_update',
  'api_hormuz_update',
  'api_hormuz_news_update',
  'db_write',
  'db_migration',
  'worker_runtime',
  'scheduler_runtime',
  'external_api_integration',
  'package_change',
  'ci_change',
  'github_automation',
  'file_writing_automation',
  'ai_job_execution',
  'external_publish',
  'automated_trading',
  'investment_advice',
  'navigation_guidance',
  'military_guidance',
];

const TASKCARD_DRAFT_REQUIRED_FORBIDDEN_OPERATIONS = [
  'production_write',
  'api_forecast_update',
  'api_hormuz_update',
  'db_migration',
  'worker_runtime',
  'scheduler_runtime',
  'external_api_integration',
  'external_publish',
  'automated_trading',
  'navigation_guidance',
  'military_guidance',
];

const RESTRICTED_OUTPUT_PATTERNS = [
  {
    name: 'secret-like value',
    pattern: /\b(?:api[_-]?key|token|secret|password|credential|oauth[_-]?token)\s*[:=]/i,
  },
  {
    name: 'OpenAI key-like value',
    pattern: /\bsk-[A-Za-z0-9_-]{12,}\b/,
  },
  {
    name: 'environment file reference',
    pattern: /(^|[\\/\s'"`])\.env(?:\.[A-Za-z0-9_-]+)?($|[\\/\s'"`:])/i,
  },
  {
    name: 'Windows local path',
    pattern: /\b[A-Za-z]:[\\/][^\r\n'"`<>|]+/,
  },
  {
    name: 'UNC path',
    pattern: /\\\\[^\\/\s]+[\\/][^\\/\s]+/,
  },
  {
    name: 'POSIX local path',
    pattern: /(^|[\s'"`])\/(?:Users|home|tmp|var|etc|mnt|Volumes)\/[^\s'"`]+/,
  },
  {
    name: 'private network detail',
    pattern: /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})\b/,
  },
  {
    name: 'production log detail',
    pattern: /\bproduction\s+logs?\b/i,
  },
  {
    name: 'real operational data detail',
    pattern: /\breal\s+operational\s+data\b/i,
  },
];

const COMMANDS = [
  {
    id: 'inspection_report',
    args: ['scripts/codex-app-server-runtime-report.mjs'],
    checks: [
      ['validation.passed', true],
      ['human_approval_required', true],
      ['production_state', false],
      ['next_allowed_action', 'human_review_only'],
      ['safety_boundary.proposal_only', true],
      ['safety_boundary.non_production', true],
      ['safety_boundary.disabled_by_default', true],
      ['safety_boundary.local_only', true],
      ['safety_boundary.protected_core_connected', false],
      ['safety_boundary.api_connection_enabled', false],
      ['safety_boundary.db_connection_enabled', false],
      ['safety_boundary.worker_runtime_enabled', false],
      ['safety_boundary.scheduler_runtime_enabled', false],
      ['safety_boundary.external_api_integration_enabled', false],
      ['safety_boundary.package_change_allowed', false],
      ['safety_boundary.ci_change_allowed', false],
      ['safety_boundary.automation_enabled', false],
      ['safety_boundary.production_promotion_allowed', false],
    ],
    forbiddenOperationsPath: 'forbidden_operations',
  },
  {
    id: 'operator_summary',
    args: ['scripts/codex-app-server-runtime-report.mjs', '--summary'],
    checks: [
      ['status', 'safe_for_human_review'],
      ['validation_passed', true],
      ['next_allowed_action', 'human_review_only'],
      ['safety_boundary_summary.proposal_only', true],
      ['safety_boundary_summary.non_production', true],
      ['safety_boundary_summary.disabled_by_default', true],
      ['safety_boundary_summary.local_only', true],
      ['safety_boundary_summary.human_approval_required', true],
      ['forbidden_surface_summary.api', 'forbidden'],
      ['forbidden_surface_summary.db', 'forbidden'],
      ['forbidden_surface_summary.worker', 'forbidden'],
      ['forbidden_surface_summary.scheduler', 'forbidden'],
      ['forbidden_surface_summary.external_integration', 'forbidden'],
      ['forbidden_surface_summary.package_or_ci', 'forbidden'],
      ['forbidden_surface_summary.automation', 'forbidden'],
      ['forbidden_surface_summary.ai_job_execution', 'forbidden'],
      ['forbidden_surface_summary.production_promotion', 'forbidden'],
    ],
  },
  {
    id: 'taskcard_draft',
    args: ['scripts/codex-app-server-runtime-report.mjs', '--taskcard'],
    checks: [
      ['proposal_only', true],
      ['is_production_state', false],
      ['required_human_approval', true],
      ['allowed_next_step', 'human_review_only'],
    ],
    forbiddenOperationsPath: 'forbidden_next_steps',
    requiredForbiddenOperations: TASKCARD_DRAFT_REQUIRED_FORBIDDEN_OPERATIONS,
  },
  {
    id: 'taskcard_qa_draft',
    args: ['scripts/codex-app-server-runtime-report.mjs', '--taskcard-qa'],
    checks: [
      ['proposal_only', true],
      ['is_production_state', false],
      ['required_human_approval', true],
      ['required_next_action', 'human_review_only'],
    ],
    forbiddenOperationsPath: 'forbidden_next_steps',
  },
  {
    id: 'handoff_draft',
    args: ['scripts/codex-app-server-runtime-report.mjs', '--handoff'],
    checks: [
      ['human_approval_required', true],
      ['required_next_action', 'human_review_only'],
      ['allowed_next_step', 'human_review_only'],
    ],
    forbiddenOperationsPath: 'forbidden_next_steps',
  },
  {
    id: 'review_packet',
    args: ['scripts/codex-app-server-runtime-report.mjs', '--packet'],
    checks: [
      ['overall_status', 'ready_for_human_review'],
      ['required_next_action', 'human_review_only'],
      ['allowed_next_step', 'human_review_only'],
      ['human_approval_required', true],
      ['proposal_only', true],
      ['is_production_state', false],
      ['stdout_only', true],
    ],
    forbiddenOperationsPath: 'forbidden_operations',
  },
  {
    id: 'write_dry_run',
    args: ['scripts/codex-app-server-runtime-write-dry-run.mjs'],
    checks: [
      ['status', 'dry_run_passed'],
      ['wrote_anything', false],
      ['required_next_action', 'human_review_only'],
      ['validation.passed', true],
    ],
  },
  {
    id: 'write_approval_request',
    args: ['scripts/codex-app-server-runtime-write-approval-request.mjs'],
    checks: [
      ['status', 'pending_human_approval'],
      ['decision', 'not_decided'],
      ['approval_record.approved', false],
      ['approval_record.approved_by', null],
      ['approval_record.approval_scope', 'none'],
      ['wrote_anything', false],
      ['required_next_action', 'human_review_only'],
      ['allowed_next_step', 'human_review_only'],
    ],
    forbiddenOperationsPath: 'forbidden_operations',
  },
  {
    id: 'write_approval_decision_validator',
    args: ['scripts/codex-app-server-runtime-write-approval-decision-validator.mjs'],
    checks: [
      ['status', 'needs_human_decision'],
      ['decision', 'not_decided'],
      ['decision_accepted', false],
      ['approval_valid_for_future_write', false],
      ['write_authorized_by_this_pr', false],
      ['wrote_anything', false],
      ['required_next_action', 'human_review_only'],
      ['allowed_next_step', 'human_review_only'],
    ],
    forbiddenOperationsPath: 'forbidden_operations',
  },
  {
    id: 'write_plan',
    args: ['scripts/codex-app-server-runtime-write-plan.mjs'],
    allowedValues: {
      plan_status: ['needs_human_decision', 'blocked'],
    },
    checks: [
      ['source_decision', 'not_decided'],
      ['source_decision_accepted', false],
      ['source_approval_valid_for_future_write', false],
      ['write_authorized_by_this_pr', false],
      ['wrote_anything', false],
      ['write_executor_present', false],
      ['executed_write_count', 0],
      ['required_human_approval', true],
    ],
    forbiddenOperationsPath: 'forbidden_operations',
  },
  {
    id: 'write_apply_preflight',
    args: ['scripts/codex-app-server-runtime-write-apply-preflight.mjs'],
    allowedValues: {
      preflight_status: ['needs_human_decision', 'blocked'],
    },
    checks: [
      ['source_decision', 'not_decided'],
      ['source_decision_accepted', false],
      ['source_approval_valid_for_future_write', false],
      ['write_authorized_by_this_pr', false],
      ['apply_authorized_by_this_pr', false],
      ['wrote_anything', false],
      ['write_executor_present', false],
      ['apply_executor_present', false],
      ['executed_write_count', 0],
      ['required_human_approval', true],
    ],
    forbiddenOperationsPath: 'forbidden_operations',
  },
  {
    id: 'write_executor_contract',
    args: ['scripts/codex-app-server-runtime-write-executor-contract.mjs'],
    allowedValues: {
      contract_status: ['needs_human_decision', 'blocked'],
    },
    checks: [
      ['source_decision', 'not_decided'],
      ['source_decision_accepted', false],
      ['source_approval_valid_for_future_write', false],
      ['write_authorized_by_this_pr', false],
      ['apply_authorized_by_this_pr', false],
      ['executor_implemented_by_this_pr', false],
      ['wrote_anything', false],
      ['write_executor_present', false],
      ['apply_executor_present', false],
      ['executed_write_count', 0],
      ['required_human_approval', true],
    ],
    forbiddenOperationsPath: 'forbidden_operations',
  },
];

function sanitize(message) {
  const projectRootUrlPath = projectRoot.replaceAll(path.sep, '/');

  return String(message)
    .replaceAll(projectRoot, '<project-root>')
    .replaceAll(projectRootUrlPath, '<project-root>')
    .replace(/\b[A-Za-z]:[\\/][^\r\n'"`<>|]+/g, '<local-path>')
    .replace(/\\\\[^\\/\s]+[\\/][^\\/\s]+/g, '<network-path>')
    .replace(/(^|[\s'"`])\/(?:Users|home|tmp|var|etc|mnt|Volumes)\/[^\s'"`]+/g, '$1<local-path>')
    .replace(/\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})\b/g, '<private-network>');
}

function assertSafeOutput(output) {
  for (const { name, pattern } of RESTRICTED_OUTPUT_PATTERNS) {
    if (pattern.test(output)) {
      throw new Error(`Local MVP review chain output contains restricted content: ${name}.`);
    }
  }
}

function readPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }

    return undefined;
  }, value);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}.`);
  }
}

function assertAllowed(actual, expectedValues, label) {
  if (!expectedValues.includes(actual)) {
    throw new Error(`${label} expected one of ${JSON.stringify(expectedValues)} but got ${JSON.stringify(actual)}.`);
  }
}

function assertIncludesAll(actual, expectedValues, label) {
  if (!Array.isArray(actual)) {
    throw new Error(`${label} expected an array.`);
  }

  const missing = expectedValues.filter((value) => !actual.includes(value));
  if (missing.length > 0) {
    throw new Error(`${label} missing required values: ${missing.join(', ')}.`);
  }
}

function runCommand(command) {
  const result = spawnSync(process.execPath, command.args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  const stdout = sanitize(result.stdout || '');
  const stderr = sanitize(result.stderr || '');

  if (result.status !== 0) {
    return {
      id: command.id,
      status: 'failed',
      exit_code: result.status,
      error: 'command_exit_nonzero',
      stderr_excerpt: stderr.trim().slice(0, 500),
    };
  }

  if (stderr.trim().length > 0) {
    return {
      id: command.id,
      status: 'failed',
      exit_code: result.status,
      error: 'stderr_not_empty',
      stderr_excerpt: stderr.trim().slice(0, 500),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return {
      id: command.id,
      status: 'failed',
      exit_code: result.status,
      error: 'stdout_not_json',
      stdout_excerpt: stdout.trim().slice(0, 500),
    };
  }

  try {
    for (const [dottedPath, expectedValue] of command.checks ?? []) {
      assertEqual(
        readPath(parsed, dottedPath),
        expectedValue,
        `${command.id}.${dottedPath}`,
      );
    }

    for (const [dottedPath, expectedValues] of Object.entries(command.allowedValues ?? {})) {
      assertAllowed(
        readPath(parsed, dottedPath),
        expectedValues,
        `${command.id}.${dottedPath}`,
      );
    }

    if (command.forbiddenOperationsPath) {
      assertIncludesAll(
        readPath(parsed, command.forbiddenOperationsPath),
        command.requiredForbiddenOperations ?? REQUIRED_FORBIDDEN_OPERATIONS,
        `${command.id}.${command.forbiddenOperationsPath}`,
      );
    }
  } catch (error) {
    return {
      id: command.id,
      status: 'failed',
      exit_code: result.status,
      error: 'boundary_check_failed',
      detail: sanitize(error.message),
    };
  }

  return {
    id: command.id,
    status: 'passed',
    exit_code: result.status,
    observed_status:
      parsed.overall_status
      ?? parsed.status
      ?? parsed.plan_status
      ?? parsed.preflight_status
      ?? parsed.contract_status
      ?? parsed.current_status
      ?? parsed.recommendation
      ?? 'passed',
  };
}

try {
  const commandResults = COMMANDS.map(runCommand);
  const failedCommands = commandResults.filter((result) => result.status !== 'passed');
  const output = {
    chain_id: 'codex_app_server_runtime_local_mvp_review_chain_v0',
    generated_at: new Date().toISOString(),
    chain_status: failedCommands.length === 0 ? 'passed' : 'failed',
    stdout_only: true,
    wrote_anything: false,
    required_next_action: 'human_review_only',
    allowed_next_step: 'human_review_only',
    proposal_only: true,
    is_production_state: false,
    protected_core_connected: false,
    api_connection_enabled: false,
    db_connection_enabled: false,
    worker_runtime_enabled: false,
    scheduler_runtime_enabled: false,
    external_api_integration_enabled: false,
    package_change_allowed: false,
    ci_change_allowed: false,
    github_automation_enabled: false,
    file_writing_automation_enabled: false,
    production_promotion_allowed: false,
    commands: commandResults,
    required_forbidden_operations_checked: REQUIRED_FORBIDDEN_OPERATIONS,
    notes: [
      'This script aggregates existing stdout-only review commands.',
      'It does not persist Task Board records or HANDOFF files.',
      'It does not add or authorize write-capable executor behavior.',
      'It does not connect to APIs, DB, workers, schedulers, external services, packages, CI, deployment, or production promotion.',
    ],
  };
  const outputText = JSON.stringify(output, null, 2);

  assertSafeOutput(outputText);
  console.log(outputText);

  if (failedCommands.length > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  const outputText = JSON.stringify({
    chain_id: 'codex_app_server_runtime_local_mvp_review_chain_v0',
    chain_status: 'failed',
    stdout_only: true,
    wrote_anything: false,
    required_next_action: 'human_review_only',
    allowed_next_step: 'human_review_only',
    error: sanitize(error.message || error),
  }, null, 2);

  console.log(outputText);
  process.exitCode = 1;
}
