import { spawnSync } from 'node:child_process';
import path from 'node:path';

const projectRoot = process.cwd();
const chainCommand = [
  'scripts/codex-app-server-runtime-local-mvp-review-chain.mjs',
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
      throw new Error(`Local MVP review bundle output contains restricted content: ${name}.`);
    }
  }
}

function runChain() {
  const result = spawnSync(process.execPath, chainCommand, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const rawStdout = result.stdout || '';
  const rawStderr = result.stderr || '';
  const stdout = sanitize(rawStdout);
  const stderr = sanitize(rawStderr);

  try {
    assertSafeOutput(rawStdout);
    assertSafeOutput(rawStderr);
    assertSafeOutput(stdout);
    assertSafeOutput(stderr);
  } catch (error) {
    return {
      exit_code: result.status,
      stderr_empty: stderr.trim().length === 0,
      stderr_excerpt: stderr.trim().slice(0, 500),
      parsed_output: null,
      parse_error: null,
      restricted_content_error: 'restricted_content_detected',
      restricted_content_detail: sanitize(error.message || error),
    };
  }

  let parsedOutput = null;
  let parseError = null;
  try {
    parsedOutput = JSON.parse(stdout);
  } catch (error) {
    parseError = sanitize(error.message || error);
  }

  return {
    exit_code: result.status,
    stderr_empty: stderr.trim().length === 0,
    stderr_excerpt: stderr.trim().slice(0, 500),
    parsed_output: parsedOutput,
    parse_error: parseError,
    stdout_excerpt: parsedOutput ? undefined : stdout.trim().slice(0, 500),
  };
}

function getCommandSummary(chainOutput) {
  const commands = Array.isArray(chainOutput?.commands)
    ? chainOutput.commands
    : [];
  const failedCommands = commands.filter((command) => command.status !== 'passed');

  return {
    command_count: commands.length,
    passed_count: commands.filter((command) => command.status === 'passed').length,
    failed_count: failedCommands.length,
    failed_command_ids: failedCommands.map((command) => command.id),
    command_ids: commands.map((command) => command.id),
  };
}

function makeBundle(chainResult) {
  const chainOutput = chainResult.parsed_output;
  const commandSummary = getCommandSummary(chainOutput);
  const chainPassed =
    chainResult.exit_code === 0
    && chainResult.stderr_empty
    && chainOutput?.chain_status === 'passed'
    && commandSummary.failed_count === 0;

  return {
    bundle_id: 'codex_app_server_runtime_local_mvp_review_bundle_v0',
    generated_at: new Date().toISOString(),
    bundle_status: chainPassed
      ? 'ready_for_gpt_or_human_review'
      : 'blocked_by_local_mvp_review_chain',
    stdout_only: true,
    wrote_anything: false,
    required_next_action: 'human_review_only',
    allowed_next_step: 'human_review_only',
    proposal_only: true,
    is_production_state: false,
    source_chain: {
      command: `node ${chainCommand[0]}`,
      exit_code: chainResult.exit_code,
      stderr_empty: chainResult.stderr_empty,
      parse_error: chainResult.parse_error,
      restricted_content_error: chainResult.restricted_content_error ?? null,
      restricted_content_detail: chainResult.restricted_content_detail ?? null,
      chain_status: chainOutput?.chain_status ?? 'unavailable',
      command_summary: commandSummary,
      required_forbidden_operations_checked:
        chainOutput?.required_forbidden_operations_checked ?? [],
    },
    review_scope: {
      purpose: 'bundle local-confirmable MVP review evidence for GPT and human reviewers',
      target_milestones: [
        'PR #49 stdout-only write executor contract draft',
        'PR #51 Project Context Pack',
        'PR #52 post-merge local MVP readiness baseline',
        'PR #53 Project Context PR gates',
        'PR #54 local MVP review chain command',
        'PR #55 local MVP review chain runbook',
      ],
      source_documents: [
        'AGENTS.md',
        'docs/project/CONTEXT.md',
        'docs/project/DESIGN.md',
        'docs/project/SPEC.md',
        'docs/project/STATUS.md',
        'docs/CONTRACTS_INDEX.md',
        'docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md',
        'docs/CODEX_APP_SERVER_RUNTIME_LOCAL_MVP_REVIEW_CHAIN.md',
        '.github/pull_request_template.md',
      ],
    },
    safety_boundary_summary: {
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
      task_board_write_enabled: false,
      handoff_file_creation_enabled: false,
      write_executor_present: false,
      apply_executor_present: false,
      production_promotion_allowed: false,
    },
    gpt_review_packet: {
      summary:
        'Review the local MVP readiness bundle as review evidence only. Confirm the stdout-only chain stays proposal-only, non-production, and human-review-only.',
      focus: [
        'Scope matches the local-confirmable MVP review goal.',
        'The bundle and source chain do not imply permission to write, apply, merge, deploy, release, publish, or promote.',
        'The source chain reports all covered command IDs as passed.',
        'Protected forecast core, API, DB, worker, scheduler, package, CI, automation, and production promotion surfaces remain disabled or forbidden.',
        'No restricted content is present in stdout review material.',
      ],
      accept_conditions: [
        'bundle_status is ready_for_gpt_or_human_review',
        'source_chain.chain_status is passed',
        'source_chain.command_summary.failed_count is 0',
        'stdout_only is true',
        'wrote_anything is false',
        'required_next_action and allowed_next_step are human_review_only',
        'proposal_only is true',
        'is_production_state is false',
      ],
      reject_conditions: [
        'Any command in the source chain fails.',
        'Any output implies write, apply, persistence, automation, runtime enablement, or production promotion.',
        'Any protected or restricted content appears in review output.',
        'The next step is broader than human review.',
      ],
      next_safe_options_after_review: [
        'Keep improving read-only/stdout-only review helpers.',
        'Ask a human to explicitly scope a separate future write-capable executor PR with tests and rollback criteria.',
        'Stop if future work needs protected forecast core, API, DB, package, CI, runtime, worker, scheduler, or production promotion changes.',
      ],
    },
    non_goals: [
      'No Task Board persistence.',
      'No HANDOFF file creation.',
      'No write or apply executor implementation.',
      'No API or DB connection.',
      'No worker or scheduler runtime.',
      'No package or CI change.',
      'No GitHub automation.',
      'No file-writing automation.',
      'No deployment, release, external publishing, or production promotion.',
    ],
    chain_error_detail: chainPassed
      ? null
      : {
        restricted_content_error: chainResult.restricted_content_error ?? null,
        restricted_content_detail: chainResult.restricted_content_detail ?? null,
        stderr_excerpt: chainResult.stderr_excerpt,
        stdout_excerpt: chainResult.stdout_excerpt,
      },
  };
}

try {
  const chainResult = runChain();
  const bundle = makeBundle(chainResult);
  const output = JSON.stringify(bundle, null, 2);

  assertSafeOutput(output);
  console.log(output);

  if (bundle.bundle_status !== 'ready_for_gpt_or_human_review') {
    process.exitCode = 1;
  }
} catch (error) {
  const output = JSON.stringify({
    bundle_id: 'codex_app_server_runtime_local_mvp_review_bundle_v0',
    bundle_status: 'blocked_by_bundle_error',
    stdout_only: true,
    wrote_anything: false,
    required_next_action: 'human_review_only',
    allowed_next_step: 'human_review_only',
    error: sanitize(error.message || error),
  }, null, 2);

  console.log(output);
  process.exitCode = 1;
}
