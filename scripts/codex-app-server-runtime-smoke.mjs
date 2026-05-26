import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const buildDir = path.join(
  projectRoot,
  'node_modules',
  '.cache',
  'world-forecast-codex-app-server-runtime-smoke',
);
const originalConsoleLog = console.log.bind(console);
const REQUIRED_PACKET_FORBIDDEN_OPERATIONS = [
  'create_pr',
  'merge_pr',
  'direct_deploy',
  'production_write',
  'production_promotion',
  'api_forecast_update',
  'api_hormuz_update',
  'api_hormuz_news_update',
  'api_route_creation',
  'db_read',
  'db_write',
  'db_migration',
  'worker_runtime',
  'scheduler_runtime',
  'external_api_integration',
  'package_change',
  'ci_change',
  'github_automation',
  'file_writing_automation',
  'handoff_file_creation',
  'task_board_write',
  'ai_job_execution',
  'external_publish',
  'automated_trading',
  'investment_advice',
  'navigation_guidance',
  'military_guidance',
];

function sanitize(message) {
  const buildDirUrlPath = buildDir.replaceAll(path.sep, '/');
  const projectRootUrlPath = projectRoot.replaceAll(path.sep, '/');

  return String(message)
    .replaceAll(buildDir, '<build-dir>')
    .replaceAll(buildDirUrlPath, '<build-dir>')
    .replaceAll(projectRoot, '<project-root>')
    .replaceAll(projectRootUrlPath, '<project-root>')
    .replace(/[A-Z]:\\[^\r\n'"`]+/g, '<local-path>')
    .replace(/[A-Z]:\/[^\r\n'"`<>|]+/g, '<local-path>')
    .replace(/(^|[\s'"`])\/(?:tmp|home|Users)\/[^\r\n'"`<>|]+/g, '$1<local-path>');
}

function log(message) {
  originalConsoleLog(`[codex-app-server-runtime-smoke] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasIssue(result, code) {
  return result.issues.some((issue) => issue.code === code);
}

function expectRejected(label, validateCodexAppServerRuntimeMvpScaffold, scaffold, code) {
  const validation = validateCodexAppServerRuntimeMvpScaffold(scaffold);

  assert(!validation.passed, `${label} must not pass runtime scaffold validation.`);
  assert(hasIssue(validation, code), `${label} did not report ${code}.`);
  log(`Rejected ${label}.`);
}

function makeLocalPathLikeValue() {
  const drive = String.fromCharCode(90);
  const separator = String.fromCharCode(92);
  return `${drive}:${separator}redacted${separator}runtime.txt`;
}

function makeNasPathLikeValue() {
  const drive = String.fromCharCode(65);
  const separator = String.fromCharCode(47);
  return `${drive}:${separator}AI-System${separator}redacted`;
}

function makePrivateNetworkIpLikeValue() {
  return [172, 16, 0, 1].join('.');
}

function makeSecretLikeValue() {
  return `${['api', 'key'].join('_')}=REDACTED`;
}

function makeEnvFileReference() {
  return ['.env', 'local'].join('.');
}

function makePosixTmpPathLikeValue() {
  return ['', 'tmp', 'example', 'file.ts'].join('/');
}

function makePosixHomePathLikeValue() {
  return ['', 'home', 'example', 'file.ts'].join('/');
}

function makePosixUsersPathLikeValue() {
  return ['', 'Users', 'example', 'file.ts'].join('/');
}

function makeSlashStyleDrivePathLikeValue(driveLetter) {
  return `${driveLetter}:${String.fromCharCode(47)}tmp${String.fromCharCode(47)}example${String.fromCharCode(47)}file.ts`;
}

function makeUncPathLikeValue() {
  const separator = String.fromCharCode(92);
  return `${separator}${separator}server${separator}share${separator}review-packet.json`;
}

function assertSafeReportOutput(output) {
  const restrictedPatterns = [
    /\b[A-Z]:\\[^\r\n'"`]+/,
    /\b[A-Z]:\/[^\r\n'"`<>|]+/,
    /\\\\[^\\/\s]+[\\/][^\\/\s]+/,
    /(^|[\s'"`])\/(?:tmp|home|Users)\/[^\r\n'"`<>|]+/,
    /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})\b/,
    /\b(?:api[_-]?key|token|secret|password|credential|oauth[_-]?token)\s*[:=]/i,
    /\bsk-[A-Za-z0-9_-]{12,}\b/,
    /(^|[\\/\s'"`])\.env(?:\.[A-Za-z0-9_-]+)?($|[\\/\s'"`:])/i,
    /\bproduction\s+logs?\b/i,
    /\breal\s+operational\s+data\b/i,
  ];

  assert(!output.includes(projectRoot), 'Report output leaked the project root.');
  assert(!output.includes(buildDir), 'Report output leaked the smoke build directory.');

  for (const pattern of restrictedPatterns) {
    assert(!pattern.test(output), 'Report output leaked restricted content.');
  }
}

function assertPacketForbidsRequiredOperations(packet, label) {
  for (const operation of REQUIRED_PACKET_FORBIDDEN_OPERATIONS) {
    assert(
      packet.forbidden_operations.includes(operation),
      `${label} must forbid ${operation}.`,
    );
  }
}

function assertSanitizesRawPath(rawPath) {
  const sanitized = sanitize(rawPath);

  assert(!sanitized.includes(rawPath), 'sanitize leaked a raw local path.');
  assert(
    sanitized.includes('<local-path>'),
    'sanitize did not mark a raw local path as <local-path>.',
  );
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function compileCodexAppServerRuntimeHelpers() {
  const tscPath = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!(await pathExists(tscPath))) {
    throw new Error(
      'Missing local TypeScript compiler. Run npm ci before node scripts/codex-app-server-runtime-smoke.mjs.',
    );
  }

  await fs.rm(buildDir, { recursive: true, force: true });
  await fs.mkdir(buildDir, { recursive: true });

  const result = spawnSync(process.execPath, [
    tscPath,
    '--target',
    'ES2020',
    '--module',
    'commonjs',
    '--moduleResolution',
    'node',
    '--esModuleInterop',
    '--skipLibCheck',
    '--strict',
    '--outDir',
    buildDir,
    '--rootDir',
    projectRoot,
    'lib/memory/types.ts',
    'lib/memory/validation.ts',
    'lib/codex-app-server-runtime/types.ts',
    'lib/codex-app-server-runtime/validation.ts',
    'lib/codex-app-server-runtime/scaffold.ts',
    'lib/codex-app-server-runtime/report.ts',
    'lib/codex-app-server-runtime/write-dry-run.ts',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error([
      'TypeScript Codex App Server runtime scaffold compilation failed.',
      sanitize(result.stdout),
      sanitize(result.stderr),
    ].filter(Boolean).join('\n'));
  }
}

async function main() {
  assertSanitizesRawPath(makePosixTmpPathLikeValue());
  assertSanitizesRawPath(makePosixHomePathLikeValue());
  assertSanitizesRawPath(makePosixUsersPathLikeValue());
  assertSanitizesRawPath(makeSlashStyleDrivePathLikeValue('C'));
  assertSanitizesRawPath(makeSlashStyleDrivePathLikeValue('Z'));
  assertSanitizesRawPath(makeLocalPathLikeValue());
  log('Accepted local path sanitization checks.');

  await compileCodexAppServerRuntimeHelpers();

  const {
    CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS,
    CODEX_APP_SERVER_RUNTIME_MVP_REQUIRED_SAFETY_LABELS,
  } = require(path.join(buildDir, 'lib', 'codex-app-server-runtime', 'types.js'));
  const {
    makeCodexAppServerRuntimeMvpScaffold,
    makeCodexAppServerRuntimeMvpBoundary,
  } = require(path.join(buildDir, 'lib', 'codex-app-server-runtime', 'scaffold.js'));
  const {
    makeCodexAppServerRuntimeMvpHandoffDraft,
    makeCodexAppServerRuntimeMvpInspectionReport,
    makeCodexAppServerRuntimeMvpOperatorSummary,
    makeCodexAppServerRuntimeMvpReviewPacket,
    makeCodexAppServerRuntimeMvpTaskCardDraft,
    makeCodexAppServerRuntimeMvpTaskCardQaDraft,
  } = require(path.join(buildDir, 'lib', 'codex-app-server-runtime', 'report.js'));
  const {
    validateCodexAppServerRuntimeMvpScaffold,
  } = require(path.join(buildDir, 'lib', 'codex-app-server-runtime', 'validation.js'));
  const {
    makeTaskBoardHandoffWriteDryRunRequest,
    runTaskBoardHandoffWriteDryRun,
    validateTaskBoardHandoffWriteDryRunRequest,
  } = require(path.join(buildDir, 'lib', 'codex-app-server-runtime', 'write-dry-run.js'));

  const boundary = makeCodexAppServerRuntimeMvpBoundary();
  assert(boundary.proposal_only === true, 'Boundary must be proposal-only.');
  assert(boundary.is_production_state === false, 'Boundary must not be production state.');
  assert(boundary.required_human_approval === true, 'Boundary must require human approval.');
  assert(boundary.disabled_by_default === true, 'Boundary must be disabled by default.');
  assert(boundary.local_only === true, 'Boundary must be local-only.');
  assert(boundary.api_connection_enabled === false, 'Boundary must not enable API connection.');
  assert(boundary.db_connection_enabled === false, 'Boundary must not enable DB connection.');
  assert(boundary.worker_runtime_enabled === false, 'Boundary must not enable worker runtime.');
  assert(boundary.scheduler_runtime_enabled === false, 'Boundary must not enable scheduler runtime.');
  assert(
    boundary.external_api_integration_enabled === false,
    'Boundary must not enable external API integration.',
  );
  assert(boundary.package_change_allowed === false, 'Boundary must not allow package changes.');
  assert(boundary.ci_change_allowed === false, 'Boundary must not allow CI changes.');
  assert(boundary.automation_enabled === false, 'Boundary must not enable automation.');
  assert(
    boundary.production_promotion_allowed === false,
    'Boundary must not allow production promotion.',
  );

  const scaffold = makeCodexAppServerRuntimeMvpScaffold({
    createdAt: 1_800_000_000,
  });
  const validation = validateCodexAppServerRuntimeMvpScaffold(scaffold);

  assert(validation.passed === true, 'Valid runtime scaffold must pass validation.');
  assert(validation.issues.length === 0, 'Valid runtime scaffold must have no issues.');
  assert(scaffold.runtime_state === 'disabled', 'Scaffold must be disabled.');
  assert(scaffold.execution_mode === 'local_only', 'Scaffold must be local-only.');
  assert(scaffold.proposal_only === true, 'Scaffold must be proposal-only.');
  assert(scaffold.is_production_state === false, 'Scaffold must be non-production.');
  assert(scaffold.required_human_approval === true, 'Scaffold must require human approval.');

  const report = makeCodexAppServerRuntimeMvpInspectionReport(scaffold, {
    generatedAt: 1_800_000_000,
  });
  assert(
    report.title === 'Codex App Server Runtime MVP Scaffold Read-only Local Inspection Report',
    'Report title must identify the read-only local inspection report.',
  );
  assert(report.generated_at === '2027-01-15T08:00:00.000Z', 'Report timestamp must be ISO formatted.');
  assert(report.scaffold_id === scaffold.scaffold_id, 'Report must expose the scaffold id.');
  assert(report.scaffold_version === scaffold.scaffold_version, 'Report must expose scaffold version.');
  assert(report.runtime_state === 'disabled', 'Report must show disabled runtime_state.');
  assert(report.execution_mode === 'local_only', 'Report must show local_only execution_mode.');
  assert(report.safety_boundary.proposal_only === true, 'Report must show proposal-only boundary.');
  assert(report.safety_boundary.non_production === true, 'Report must show non-production boundary.');
  assert(
    report.safety_boundary.disabled_by_default === true,
    'Report must show disabled-by-default boundary.',
  );
  assert(report.safety_boundary.local_only === true, 'Report must show local-only boundary.');
  assert(
    report.safety_boundary.human_approval_required === true,
    'Report must show human approval boundary.',
  );
  assert(report.validation.passed === true, 'Report validation must pass for the scaffold.');
  assert(report.validation.issues.length === 0, 'Report validation issues must be empty.');
  assert(report.human_approval_required === true, 'Report must require human approval.');
  assert(report.production_state === false, 'Report must not be production state.');
  assert(
    report.next_allowed_action === 'human_review_only',
    'Report next allowed action must remain human_review_only.',
  );
  assertSafeReportOutput(JSON.stringify(report));
  log('Accepted read-only local inspection report helper.');

  const summary = makeCodexAppServerRuntimeMvpOperatorSummary(report);
  assert(
    summary.title === 'Codex App Server Runtime MVP Operator Summary',
    'Summary title must identify the operator summary.',
  );
  assert(summary.generated_at === report.generated_at, 'Summary must reuse the report timestamp.');
  assert(summary.scaffold_id === scaffold.scaffold_id, 'Summary must expose the scaffold id.');
  assert(summary.status === 'safe_for_human_review', 'Valid summary must be safe_for_human_review.');
  assert(summary.runtime_state === 'disabled', 'Summary must show disabled runtime_state.');
  assert(summary.execution_mode === 'local_only', 'Summary must show local_only execution_mode.');
  assert(summary.validation_passed === true, 'Summary validation_passed must be true.');
  assert(
    summary.safety_boundary_summary.proposal_only === true,
    'Summary must preserve proposal-only boundary.',
  );
  assert(
    summary.forbidden_surface_summary.api === 'forbidden',
    'Summary must keep API surface forbidden.',
  );
  assert(
    summary.forbidden_surface_summary.production_promotion === 'forbidden',
    'Summary must keep production promotion forbidden.',
  );
  assert(
    summary.next_allowed_action === 'human_review_only',
    'Summary next allowed action must remain human_review_only.',
  );
  assertSafeReportOutput(JSON.stringify(summary));
  log('Accepted operator summary helper.');

  const taskCardDraft = makeCodexAppServerRuntimeMvpTaskCardDraft(summary);
  assert(
    taskCardDraft.task_id === 'codex-app-server-runtime-mvp-taskcard-draft-codex-app-server-runtime-mvp-scaffold-v0',
    'TaskCard draft must derive a deterministic task_id from the summary scaffold id.',
  );
  assert(
    taskCardDraft.title === 'Review Codex App Server Runtime MVP operator summary TaskCard draft',
    'TaskCard draft title must identify the operator review draft.',
  );
  assert(
    taskCardDraft.source.type === 'codex_app_server_runtime_mvp_operator_summary_v0',
    'TaskCard draft source must identify the operator summary.',
  );
  assert(
    taskCardDraft.source.scaffold_id === summary.scaffold_id,
    'TaskCard draft source must retain the sanitized scaffold id.',
  );
  assert(
    taskCardDraft.status === 'waiting_for_human_approval',
    'Valid TaskCard draft status must wait for human approval.',
  );
  assert(
    taskCardDraft.autonomy_level === 'A1_draft_only',
    'TaskCard draft autonomy must remain A1 draft-only.',
  );
  assert(taskCardDraft.proposal_only === true, 'TaskCard draft must be proposal-only.');
  assert(taskCardDraft.is_production_state === false, 'TaskCard draft must not be production state.');
  assert(
    taskCardDraft.required_human_approval === true,
    'TaskCard draft must require human approval.',
  );
  assert(
    taskCardDraft.allowed_next_step === 'human_review_only',
    'TaskCard draft allowed next step must remain human_review_only.',
  );
  assert(
    taskCardDraft.forbidden_next_steps.includes('production_write'),
    'TaskCard draft must forbid production writes.',
  );
  assert(
    taskCardDraft.forbidden_next_steps.includes('create_pr'),
    'TaskCard draft must not authorize PR creation.',
  );
  assert(
    taskCardDraft.acceptance_criteria.some((criterion) => criterion.includes('stdout-only')),
    'TaskCard draft acceptance criteria must preserve stdout-only output.',
  );
  assert(
    taskCardDraft.risks.length > 0,
    'TaskCard draft must include reviewable risks.',
  );
  assert(
    taskCardDraft.references.includes('docs/TASK_BOARD_HANDOFF.md'),
    'TaskCard draft must cite the Task Board / Handoff contract.',
  );
  assertSafeReportOutput(JSON.stringify(taskCardDraft));
  log('Accepted stdout-only TaskCard draft helper.');

  const taskCardQaDraft = makeCodexAppServerRuntimeMvpTaskCardQaDraft(taskCardDraft, {
    checkedAt: 1_800_000_000,
  });
  assert(
    taskCardQaDraft.qa_report_id === 'codex-app-server-runtime-mvp-taskcard-qa-codex-app-server-runtime-mvp-taskcard-draft-codex-app-server-runtime-mvp-scaffold-v0',
    'TaskCard QA draft must derive a deterministic qa_report_id from the reviewed task id.',
  );
  assert(
    taskCardQaDraft.reviewed_task_id === taskCardDraft.task_id,
    'TaskCard QA draft must identify the reviewed task id.',
  );
  assert(
    taskCardQaDraft.reviewed_output_type === 'codex_app_server_runtime_mvp_taskcard_draft_v0',
    'TaskCard QA draft must identify the reviewed output type.',
  );
  assert(
    taskCardQaDraft.reviewer_role === 'qa_reviewer',
    'TaskCard QA draft reviewer role must be qa_reviewer.',
  );
  assert(
    taskCardQaDraft.recommendation === 'approve_for_human_review',
    'Valid TaskCard QA draft must approve for human review.',
  );
  assert(taskCardQaDraft.proposal_only === true, 'TaskCard QA draft must be proposal-only.');
  assert(
    taskCardQaDraft.is_production_state === false,
    'TaskCard QA draft must not be production state.',
  );
  assert(
    taskCardQaDraft.required_human_approval === true,
    'TaskCard QA draft must require human approval.',
  );
  assert(
    taskCardQaDraft.checked_at === '2027-01-15T08:00:00.000Z',
    'TaskCard QA draft timestamp must be ISO formatted.',
  );
  assert(
    taskCardQaDraft.checks.scope_boundary_check.result === 'pass',
    'TaskCard QA draft scope boundary check must pass.',
  );
  assert(
    taskCardQaDraft.checks.status_allowed_next_step_check.result === 'pass',
    'TaskCard QA draft status and allowed-next-step check must pass.',
  );
  assert(
    taskCardQaDraft.checks.autonomy_level_check.result === 'pass',
    'TaskCard QA draft autonomy check must pass.',
  );
  assert(
    taskCardQaDraft.checks.protected_surface_check.result === 'pass',
    'TaskCard QA draft protected surface check must pass.',
  );
  assert(
    taskCardQaDraft.checks.forbidden_next_steps_check.result === 'pass',
    'TaskCard QA draft forbidden next steps check must pass.',
  );
  assert(
    taskCardQaDraft.checks.restricted_content_check.result === 'pass',
    'TaskCard QA draft restricted content check must pass.',
  );
  assert(
    taskCardQaDraft.checks.stdout_only_check.result === 'pass',
    'TaskCard QA draft stdout-only check must pass.',
  );
  assert(
    taskCardQaDraft.issues.length === 0,
    'Valid TaskCard QA draft must have no issues.',
  );
  assert(
    taskCardQaDraft.required_next_action === 'human_review_only',
    'TaskCard QA draft next action must remain human_review_only.',
  );
  assert(
    taskCardQaDraft.forbidden_next_steps.includes('create_pr'),
    'TaskCard QA draft must not authorize PR creation.',
  );
  assert(
    taskCardQaDraft.forbidden_next_steps.includes('merge_pr'),
    'TaskCard QA draft must not authorize PR merge.',
  );
  assert(
    taskCardQaDraft.forbidden_next_steps.includes('direct_deploy'),
    'TaskCard QA draft must not authorize deploy.',
  );
  assert(
    taskCardQaDraft.forbidden_next_steps.includes('db_write'),
    'TaskCard QA draft must not authorize DB writes.',
  );
  assert(
    taskCardQaDraft.forbidden_next_steps.includes('worker_runtime'),
    'TaskCard QA draft must not authorize worker runtime.',
  );
  assert(
    taskCardQaDraft.forbidden_next_steps.includes('scheduler_runtime'),
    'TaskCard QA draft must not authorize scheduler runtime.',
  );
  assert(
    taskCardQaDraft.references.includes('docs/templates/TASK_BOARD_QA_REPORT_TEMPLATE.md'),
    'TaskCard QA draft must cite the Task Board QA template.',
  );
  assertSafeReportOutput(JSON.stringify(taskCardQaDraft));
  log('Accepted stdout-only TaskCard QA draft helper.');

  const handoffDraft = makeCodexAppServerRuntimeMvpHandoffDraft(
    taskCardDraft,
    taskCardQaDraft,
  );
  assert(
    handoffDraft.handoff_id === 'codex-app-server-runtime-mvp-handoff-codex-app-server-runtime-mvp-taskcard-draft-codex-app-server-runtime-mvp-scaffold-v0',
    'HANDOFF draft must derive a deterministic handoff_id from the reviewed task id.',
  );
  assert(handoffDraft.handoff_version === 1, 'HANDOFF draft version must be 1.');
  assert(
    handoffDraft.source_role === 'codex_app_server_runtime_reporter',
    'HANDOFF draft source role must identify the runtime reporter.',
  );
  assert(
    handoffDraft.target_role === 'human_owner',
    'HANDOFF draft target role must be human_owner.',
  );
  assert(
    handoffDraft.task_id === taskCardDraft.task_id,
    'HANDOFF draft must reference the TaskCard draft task id.',
  );
  assert(
    handoffDraft.current_status === 'waiting_for_human_approval',
    'Valid TaskCard QA draft must yield waiting_for_human_approval handoff status.',
  );
  assert(
    handoffDraft.required_next_action === 'human_review_only',
    'HANDOFF draft required next action must remain human_review_only.',
  );
  assert(
    handoffDraft.allowed_next_step === 'human_review_only',
    'HANDOFF draft allowed next step must remain human_review_only.',
  );
  assert(
    handoffDraft.human_approval_required === true,
    'HANDOFF draft must require human approval.',
  );
  assert(
    handoffDraft.outputs_produced.includes('stdout-only HANDOFF draft JSON'),
    'HANDOFF draft must identify stdout-only JSON output.',
  );
  assert(
    handoffDraft.outputs_produced.includes('no HANDOFF file created'),
    'HANDOFF draft must state that no HANDOFF file is created.',
  );
  assert(
    handoffDraft.outputs_produced.includes('no Task Board write performed'),
    'HANDOFF draft must state that no Task Board write is performed.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('create_pr'),
    'HANDOFF draft must not authorize PR creation.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('merge_pr'),
    'HANDOFF draft must not authorize PR merge.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('direct_deploy'),
    'HANDOFF draft must not authorize deploy.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('production_write'),
    'HANDOFF draft must not authorize production writes.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('api_forecast_update'),
    'HANDOFF draft must not authorize forecast API updates.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('api_hormuz_update'),
    'HANDOFF draft must not authorize Hormuz API updates.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('db_write'),
    'HANDOFF draft must not authorize DB writes.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('worker_runtime'),
    'HANDOFF draft must not authorize worker runtime.',
  );
  assert(
    handoffDraft.forbidden_next_steps.includes('scheduler_runtime'),
    'HANDOFF draft must not authorize scheduler runtime.',
  );
  assert(
    handoffDraft.references.includes('docs/templates/HANDOFF_TEMPLATE.md'),
    'HANDOFF draft must cite the Handoff template.',
  );
  assertSafeReportOutput(JSON.stringify(handoffDraft));
  log('Accepted stdout-only HANDOFF draft helper.');

  const reviewPacket = makeCodexAppServerRuntimeMvpReviewPacket(scaffold, {
    generatedAt: 1_800_000_000,
  });
  const reviewPacketOutput = JSON.stringify(reviewPacket);
  assert(
    reviewPacket.packet_id === 'codex-app-server-runtime-mvp-review-packet-v0',
    'Review packet must use the expected packet_id.',
  );
  assert(reviewPacket.packet_version === 1, 'Review packet version must be 1.');
  assert(
    reviewPacket.title === 'Codex App Server Runtime MVP Review Packet',
    'Review packet title must identify the bundled review packet.',
  );
  assert(
    reviewPacket.generated_at === '2027-01-15T08:00:00.000Z',
    'Review packet timestamp must be ISO formatted.',
  );
  assert(
    reviewPacket.overall_status === 'ready_for_human_review',
    'Valid review packet must be ready_for_human_review.',
  );
  assert(
    reviewPacket.required_next_action === 'human_review_only',
    'Review packet required next action must remain human_review_only.',
  );
  assert(
    reviewPacket.allowed_next_step === 'human_review_only',
    'Review packet allowed next step must remain human_review_only.',
  );
  assert(
    reviewPacket.human_approval_required === true,
    'Review packet must require human approval.',
  );
  assert(reviewPacket.proposal_only === true, 'Review packet must be proposal-only.');
  assert(
    reviewPacket.is_production_state === false,
    'Review packet must not be production state.',
  );
  assert(reviewPacket.stdout_only === true, 'Review packet must be stdout-only.');
  assert(reviewPacket.report, 'Review packet must include report.');
  assert(reviewPacket.summary, 'Review packet must include summary.');
  assert(reviewPacket.taskcard, 'Review packet must include taskcard.');
  assert(reviewPacket.taskcard_qa, 'Review packet must include taskcard_qa.');
  assert(reviewPacket.handoff, 'Review packet must include handoff.');
  assert(
    reviewPacket.handoff.current_status === 'waiting_for_human_approval',
    'Valid review packet handoff must wait for human approval.',
  );
  assertPacketForbidsRequiredOperations(reviewPacket, 'Review packet');
  assert(
    reviewPacket.references.includes('scripts/codex-app-server-runtime-report.mjs'),
    'Review packet must cite the report script.',
  );
  assertSafeReportOutput(reviewPacketOutput);
  log('Accepted stdout-only review packet helper.');

  const dryRunRequest = makeTaskBoardHandoffWriteDryRunRequest({
    sourcePacket: reviewPacket,
  });
  const dryRunValidation =
    validateTaskBoardHandoffWriteDryRunRequest(dryRunRequest);
  assert(
    dryRunValidation.passed === true,
    'Valid write dry-run request must pass validation.',
  );
  assert(
    dryRunValidation.issues.length === 0,
    'Valid write dry-run request must have no validation issues.',
  );
  const dryRunResult = runTaskBoardHandoffWriteDryRun(dryRunRequest);
  const dryRunResultOutput = JSON.stringify(dryRunResult);
  assert(
    dryRunResult.status === 'dry_run_passed',
    'Valid write dry-run result must pass.',
  );
  assert(
    dryRunResult.wrote_anything === false,
    'Write dry-run result must never write anything.',
  );
  assert(
    dryRunResult.validation.passed === true,
    'Write dry-run result validation must pass.',
  );
  assert(
    dryRunResult.required_next_action === 'human_review_only',
    'Write dry-run result next action must remain human_review_only.',
  );
  assert(
    dryRunResult.rollback_plan.some((entry) => (
      entry.includes('No rollback required') && entry.includes('wrote nothing')
    )),
    'Write dry-run rollback plan must say no rollback is required because nothing was written.',
  );
  assert(
    dryRunResult.audit_log_entry,
    'Write dry-run result must include a conceptual audit log entry.',
  );
  assert(
    dryRunResult.audit_log_entry.wrote_anything === false,
    'Write dry-run audit log entry must record wrote_anything false.',
  );
  assert(
    dryRunResult.target_kind === 'repository_artifact',
    'Write dry-run target kind must be repository_artifact.',
  );
  assert(
    dryRunResult.target_path_or_target_id === 'docs/generated/codex-app-server-runtime/review-packet.sample.json',
    'Write dry-run target must be the approved repository-relative example target.',
  );
  assert(
    !dryRunResult.target_path_or_target_id.startsWith('/')
      && !dryRunResult.target_path_or_target_id.includes('\\')
      && !dryRunResult.target_path_or_target_id.includes('..'),
    'Write dry-run target must remain repository-relative.',
  );
  assertSafeReportOutput(dryRunResultOutput);
  log('Accepted Task Board / HANDOFF write dry-run validation helper.');

  const nonJsonBigIntRequest = {
    ...dryRunRequest,
    source_packet: {
      ...reviewPacket,
      non_json_fixture: BigInt(1),
    },
    source_packet_sha256: 'sha256-placeholder-for-invalid-packet',
  };
  const nonJsonBigIntResult =
    runTaskBoardHandoffWriteDryRun(nonJsonBigIntRequest);
  const nonJsonBigIntOutput = JSON.stringify(nonJsonBigIntResult);
  assert(
    nonJsonBigIntResult.status === 'blocked',
    'BigInt source_packet dry run must be blocked.',
  );
  assert(
    nonJsonBigIntResult.wrote_anything === false,
    'BigInt source_packet dry run must not write anything.',
  );
  assert(
    hasIssue(nonJsonBigIntResult.validation, 'E_PACKET_INVALID'),
    'BigInt source_packet dry run must report E_PACKET_INVALID.',
  );
  assert(
    nonJsonBigIntResult.validation.issues.some((issue) => (
      issue.message === 'source_packet must be JSON serializable for hash validation.'
    )),
    'BigInt source_packet dry run must report a fixed hash validation message.',
  );
  assert(
    nonJsonBigIntResult.required_next_action === 'human_review_only',
    'BigInt source_packet dry run must stop at human_review_only.',
  );
  assert(
    !nonJsonBigIntOutput.includes('TypeError')
      && !nonJsonBigIntOutput.includes('Do not know how to serialize'),
    'BigInt source_packet dry run must not leak a raw serialization error.',
  );
  assertSafeReportOutput(nonJsonBigIntOutput);
  log('Accepted BigInt source_packet dry-run blocking.');

  const circularPacket = { ...reviewPacket };
  circularPacket.self = circularPacket;
  const circularPacketRequest = {
    ...dryRunRequest,
    source_packet: circularPacket,
    source_packet_sha256: 'sha256-placeholder-for-circular-packet',
  };
  const circularPacketResult =
    runTaskBoardHandoffWriteDryRun(circularPacketRequest);
  const circularPacketOutput = JSON.stringify(circularPacketResult);
  assert(
    circularPacketResult.status === 'blocked',
    'Circular source_packet dry run must be blocked.',
  );
  assert(
    circularPacketResult.wrote_anything === false,
    'Circular source_packet dry run must not write anything.',
  );
  assert(
    hasIssue(circularPacketResult.validation, 'E_PACKET_INVALID'),
    'Circular source_packet dry run must report E_PACKET_INVALID.',
  );
  assert(
    circularPacketResult.validation.issues.some((issue) => (
      issue.message === 'source_packet must be JSON serializable for hash validation.'
    )),
    'Circular source_packet dry run must report a fixed hash validation message.',
  );
  assert(
    circularPacketResult.required_next_action === 'human_review_only',
    'Circular source_packet dry run must stop at human_review_only.',
  );
  assert(
    !circularPacketOutput.includes('TypeError')
      && !circularPacketOutput.includes('Converting circular structure'),
    'Circular source_packet dry run must not leak a raw serialization error.',
  );
  assertSafeReportOutput(circularPacketOutput);
  log('Accepted circular source_packet dry-run blocking.');

  const invalidWriteModeRequest = cloneValue(dryRunRequest);
  invalidWriteModeRequest.write_mode = 'write_after_human_approval';
  invalidWriteModeRequest.dry_run = false;
  const invalidWriteModeResult =
    runTaskBoardHandoffWriteDryRun(invalidWriteModeRequest);
  assert(
    invalidWriteModeResult.status === 'blocked',
    'Write-capable mode must be blocked in PR #44.',
  );
  assert(
    invalidWriteModeResult.wrote_anything === false,
    'Blocked write-capable mode must not write anything.',
  );
  assert(
    hasIssue(invalidWriteModeResult.validation, 'E_FORBIDDEN_OPERATION'),
    'Write-capable mode must report E_FORBIDDEN_OPERATION.',
  );
  assert(
    invalidWriteModeResult.required_next_action === 'human_review_only',
    'Blocked write-capable mode must stop at human_review_only.',
  );
  assertSafeReportOutput(JSON.stringify(invalidWriteModeResult));
  log('Accepted blocked write-capable dry-run mode.');

  const missingIdempotencyRequest = cloneValue(dryRunRequest);
  delete missingIdempotencyRequest.idempotency_key;
  const missingIdempotencyResult =
    runTaskBoardHandoffWriteDryRun(missingIdempotencyRequest);
  assert(
    missingIdempotencyResult.status === 'blocked',
    'Missing idempotency key must be blocked.',
  );
  assert(
    hasIssue(missingIdempotencyResult.validation, 'E_IDEMPOTENCY_MISSING'),
    'Missing idempotency key must report E_IDEMPOTENCY_MISSING.',
  );
  assert(
    missingIdempotencyResult.wrote_anything === false,
    'Missing idempotency key must not write anything.',
  );
  assertSafeReportOutput(JSON.stringify(missingIdempotencyResult));
  log('Accepted missing idempotency dry-run blocking.');

  const forbiddenTargets = [
    ['', 'tmp', 'review-packet.json'].join('/'),
    ['', 'home', 'user', 'review-packet.json'].join('/'),
    ['', 'Users', 'user', 'review-packet.json'].join('/'),
    makeSlashStyleDrivePathLikeValue('C').replace('example/file.ts', 'review-packet.json'),
    `${String.fromCharCode(67)}:${String.fromCharCode(92)}tmp${String.fromCharCode(92)}review-packet.json`,
    `${String.fromCharCode(65)}:${String.fromCharCode(47)}AI-System${String.fromCharCode(47)}review-packet.json`,
    makeUncPathLikeValue(),
    'http://example.com/review-packet.json',
    'https://example.com/review-packet.json',
  ];

  for (const [index, forbiddenTarget] of forbiddenTargets.entries()) {
    const forbiddenTargetRequest = cloneValue(dryRunRequest);
    forbiddenTargetRequest.target_path_or_target_id = forbiddenTarget;
    const forbiddenTargetResult =
      runTaskBoardHandoffWriteDryRun(forbiddenTargetRequest);
    const forbiddenTargetOutput = JSON.stringify(forbiddenTargetResult);

    assert(
      forbiddenTargetResult.status === 'blocked',
      `Forbidden dry-run target ${index} must be blocked.`,
    );
    assert(
      hasIssue(forbiddenTargetResult.validation, 'E_TARGET_NOT_ALLOWED'),
      `Forbidden dry-run target ${index} must report E_TARGET_NOT_ALLOWED.`,
    );
    assert(
      forbiddenTargetResult.wrote_anything === false,
      `Forbidden dry-run target ${index} must not write anything.`,
    );
    assert(
      !forbiddenTargetOutput.includes(forbiddenTarget),
      `Forbidden dry-run target ${index} leaked the raw target.`,
    );
    assertSafeReportOutput(forbiddenTargetOutput);
  }
  log('Accepted forbidden dry-run target blocking.');

  const restrictedOwnerRequest = cloneValue(dryRunRequest);
  const restrictedOwnerFixture = makeSecretLikeValue();
  restrictedOwnerRequest.human_owner = restrictedOwnerFixture;
  const restrictedOwnerResult =
    runTaskBoardHandoffWriteDryRun(restrictedOwnerRequest);
  const restrictedOwnerOutput = JSON.stringify(restrictedOwnerResult);
  assert(
    restrictedOwnerResult.status === 'blocked',
    'Restricted dry-run owner content must be blocked.',
  );
  assert(
    hasIssue(restrictedOwnerResult.validation, 'E_RESTRICTED_CONTENT'),
    'Restricted dry-run owner content must report E_RESTRICTED_CONTENT.',
  );
  assert(
    !restrictedOwnerOutput.includes(restrictedOwnerFixture),
    'Restricted dry-run owner output leaked the raw fixture.',
  );
  assert(
    restrictedOwnerResult.wrote_anything === false,
    'Restricted dry-run owner content must not write anything.',
  );
  assertSafeReportOutput(restrictedOwnerOutput);
  log('Accepted restricted dry-run content blocking.');

  const revisionTaskCardQaDraft = cloneValue(taskCardQaDraft);
  revisionTaskCardQaDraft.recommendation = 'revise_task_card';
  revisionTaskCardQaDraft.checks.stdout_only_check.result = 'revise';
  revisionTaskCardQaDraft.checks.stdout_only_check.notes =
    'Synthetic revision fixture for HANDOFF status coverage.';
  revisionTaskCardQaDraft.issues.push({
    code: 'synthetic_revision_required',
    severity: 'revision_required',
    message: 'Synthetic revision fixture requires TaskCard wording review.',
  });
  const revisionHandoffDraft = makeCodexAppServerRuntimeMvpHandoffDraft(
    taskCardDraft,
    revisionTaskCardQaDraft,
  );
  const revisionHandoffDraftOutput = JSON.stringify(revisionHandoffDraft);
  assert(
    revisionHandoffDraft.current_status === 'needs_revision',
    'revise_task_card QA recommendation must yield needs_revision handoff status.',
  );
  assert(
    revisionHandoffDraft.required_next_action === 'human_review_only',
    'Revision HANDOFF draft next action must remain human_review_only.',
  );
  assert(
    revisionHandoffDraft.allowed_next_step === 'human_review_only',
    'Revision HANDOFF draft allowed next step must remain human_review_only.',
  );
  assert(
    revisionHandoffDraft.blockers.includes('none'),
    'Revision HANDOFF draft must not treat revise_task_card as a blocker.',
  );
  assert(
    revisionHandoffDraft.key_findings.some((finding) => finding.includes('requires revision')),
    'Revision HANDOFF draft must record revision required in key findings.',
  );
  assert(
    revisionHandoffDraft.open_questions.some((question) => question.includes('non-blocking')),
    'Revision HANDOFF draft must route revision work through open questions.',
  );
  assert(
    revisionHandoffDraft.risks.some((risk) => risk.includes('requested revision')),
    'Revision HANDOFF draft must preserve revision risk.',
  );
  assert(
    revisionHandoffDraft.forbidden_next_steps.includes('create_pr'),
    'Revision HANDOFF draft must not authorize PR creation.',
  );
  assert(
    revisionHandoffDraft.forbidden_next_steps.includes('merge_pr'),
    'Revision HANDOFF draft must not authorize PR merge.',
  );
  assert(
    revisionHandoffDraft.forbidden_next_steps.includes('db_write'),
    'Revision HANDOFF draft must not authorize DB writes.',
  );
  assert(
    revisionHandoffDraft.forbidden_next_steps.includes('worker_runtime'),
    'Revision HANDOFF draft must not authorize worker runtime.',
  );
  assert(
    revisionHandoffDraft.forbidden_next_steps.includes('scheduler_runtime'),
    'Revision HANDOFF draft must not authorize scheduler runtime.',
  );
  assertSafeReportOutput(revisionHandoffDraftOutput);
  log('Accepted revise_task_card HANDOFF draft handling.');

  const revisionReviewPacket = makeCodexAppServerRuntimeMvpReviewPacket(scaffold, {
    generatedAt: 1_800_000_000,
    taskCardQaDraft: revisionTaskCardQaDraft,
  });
  const revisionReviewPacketOutput = JSON.stringify(revisionReviewPacket);
  assert(
    revisionReviewPacket.overall_status === 'needs_revision',
    'revise_task_card review packet must map to needs_revision.',
  );
  assert(
    revisionReviewPacket.required_next_action === 'human_review_only',
    'Revision review packet required next action must remain human_review_only.',
  );
  assert(
    revisionReviewPacket.allowed_next_step === 'human_review_only',
    'Revision review packet allowed next step must remain human_review_only.',
  );
  assert(
    revisionReviewPacket.proposal_only === true,
    'Revision review packet must remain proposal-only.',
  );
  assert(
    revisionReviewPacket.is_production_state === false,
    'Revision review packet must not be production state.',
  );
  assert(
    revisionReviewPacket.stdout_only === true,
    'Revision review packet must remain stdout-only.',
  );
  assert(
    revisionReviewPacket.handoff.current_status === 'needs_revision',
    'Revision review packet must carry a needs_revision HANDOFF draft.',
  );
  assertPacketForbidsRequiredOperations(revisionReviewPacket, 'Revision review packet');
  assertSafeReportOutput(revisionReviewPacketOutput);
  log('Accepted needs_revision review packet handling.');

  const mismatchedTaskCardQaDraft = cloneValue(taskCardQaDraft);
  const mismatchedReviewedTaskIdFixture = makeEnvFileReference();
  mismatchedTaskCardQaDraft.reviewed_task_id =
    `mismatched-task-${mismatchedReviewedTaskIdFixture}`;
  const mismatchedHandoffDraft = makeCodexAppServerRuntimeMvpHandoffDraft(
    taskCardDraft,
    mismatchedTaskCardQaDraft,
  );
  const mismatchedHandoffDraftOutput = JSON.stringify(mismatchedHandoffDraft);
  assert(
    mismatchedHandoffDraft.current_status === 'blocked',
    'Mismatched TaskCard/QA linkage must yield blocked handoff status.',
  );
  assert(
    mismatchedHandoffDraft.required_next_action === 'human_review_only',
    'Mismatched HANDOFF draft next action must remain human_review_only.',
  );
  assert(
    mismatchedHandoffDraft.allowed_next_step === 'human_review_only',
    'Mismatched HANDOFF draft allowed next step must remain human_review_only.',
  );
  assert(
    mismatchedHandoffDraft.blockers.some((blocker) => (
      blocker.includes('taskcard_qa_linkage_mismatch')
    )),
    'Mismatched HANDOFF draft must include a sanitized linkage blocker.',
  );
  assert(
    mismatchedHandoffDraft.task_id === taskCardDraft.task_id,
    'Mismatched HANDOFF draft must keep the TaskCard task_id as the handoff task_id.',
  );
  assert(
    !mismatchedHandoffDraftOutput.includes(mismatchedTaskCardQaDraft.reviewed_task_id),
    'Mismatched HANDOFF draft must not echo the mismatched reviewed_task_id.',
  );
  assert(
    !mismatchedHandoffDraftOutput.includes(mismatchedReviewedTaskIdFixture),
    'Mismatched HANDOFF draft leaked restricted linkage fixture content.',
  );
  assert(
    mismatchedHandoffDraft.forbidden_next_steps.includes('create_pr'),
    'Mismatched HANDOFF draft must not authorize PR creation.',
  );
  assert(
    mismatchedHandoffDraft.forbidden_next_steps.includes('merge_pr'),
    'Mismatched HANDOFF draft must not authorize PR merge.',
  );
  assert(
    mismatchedHandoffDraft.forbidden_next_steps.includes('db_write'),
    'Mismatched HANDOFF draft must not authorize DB writes.',
  );
  assert(
    mismatchedHandoffDraft.forbidden_next_steps.includes('worker_runtime'),
    'Mismatched HANDOFF draft must not authorize worker runtime.',
  );
  assert(
    mismatchedHandoffDraft.forbidden_next_steps.includes('scheduler_runtime'),
    'Mismatched HANDOFF draft must not authorize scheduler runtime.',
  );
  assert(
    mismatchedHandoffDraft.forbidden_next_steps.includes('production_promotion'),
    'Mismatched HANDOFF draft must not authorize production promotion.',
  );
  assertSafeReportOutput(mismatchedHandoffDraftOutput);
  log('Accepted mismatched TaskCard/QA HANDOFF draft blocking.');

  const restrictedTaskCardDraft = cloneValue(taskCardDraft);
  const restrictedTaskCardFixture = makeEnvFileReference();
  restrictedTaskCardDraft.risks.push(`Restricted content fixture ${restrictedTaskCardFixture}`);
  const restrictedTaskCardQaDraft =
    makeCodexAppServerRuntimeMvpTaskCardQaDraft(restrictedTaskCardDraft);
  const restrictedTaskCardQaDraftOutput = JSON.stringify(restrictedTaskCardQaDraft);
  assert(
    restrictedTaskCardQaDraft.recommendation === 'block',
    'Restricted TaskCard QA draft recommendation must be block.',
  );
  assert(
    restrictedTaskCardQaDraft.checks.restricted_content_check.result === 'block',
    'Restricted TaskCard QA draft restricted content check must block.',
  );
  assert(
    restrictedTaskCardQaDraft.issues.some((issue) => (
      issue.code === 'restricted_content_detected'
      && issue.message === 'Restricted content was detected in the reviewed TaskCard draft; details are withheld for safety.'
    )),
    'Restricted TaskCard QA draft must use a sanitized restricted-content issue message.',
  );
  assert(
    !restrictedTaskCardQaDraftOutput.includes(restrictedTaskCardFixture),
    'Restricted TaskCard QA draft leaked restricted fixture content.',
  );
  assertSafeReportOutput(restrictedTaskCardQaDraftOutput);
  log('Accepted restricted-content TaskCard QA draft withholding.');

  for (const label of CODEX_APP_SERVER_RUNTIME_MVP_REQUIRED_SAFETY_LABELS) {
    assert(scaffold.safety_labels.includes(label), `Scaffold missing safety label: ${label}.`);
  }

  for (const operation of CODEX_APP_SERVER_RUNTIME_MVP_FORBIDDEN_OPERATIONS) {
    assert(
      scaffold.forbidden_operations.includes(operation),
      `Scaffold missing forbidden operation: ${operation}.`,
    );
  }
  log('Accepted disabled proposal-only runtime scaffold.');

  const runtimeEnabled = cloneValue(scaffold);
  runtimeEnabled.runtime_state = 'enabled';
  expectRejected(
    'enabled runtime_state scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    runtimeEnabled,
    'runtime_state_disabled_required',
  );

  const proposalOnlyFalse = cloneValue(scaffold);
  proposalOnlyFalse.proposal_only = false;
  expectRejected(
    'proposal_only false scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    proposalOnlyFalse,
    'proposal_only_required',
  );

  const productionStateTrue = cloneValue(scaffold);
  productionStateTrue.is_production_state = true;
  expectRejected(
    'is_production_state true scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    productionStateTrue,
    'non_production_state_required',
  );

  const humanApprovalFalse = cloneValue(scaffold);
  humanApprovalFalse.required_human_approval = false;
  expectRejected(
    'required_human_approval false scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    humanApprovalFalse,
    'required_human_approval_required',
  );

  const disabledByDefaultFalse = cloneValue(scaffold);
  disabledByDefaultFalse.disabled_by_default = false;
  expectRejected(
    'disabled_by_default false scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    disabledByDefaultFalse,
    'disabled_by_default_required',
  );

  const localOnlyFalse = cloneValue(scaffold);
  localOnlyFalse.local_only = false;
  expectRejected(
    'local_only false scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    localOnlyFalse,
    'local_only_required',
  );

  const protectedCoreConnected = cloneValue(scaffold);
  protectedCoreConnected.protected_core_connected = true;
  expectRejected(
    'protected core connected scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    protectedCoreConnected,
    'protected_core_connection_disabled_required',
  );

  const unsafeBoundaryCases = [
    ['API connection scaffold', 'api_connection_enabled', 'api_connection_disabled_required'],
    ['DB connection scaffold', 'db_connection_enabled', 'db_connection_disabled_required'],
    ['DB read scaffold', 'db_read_enabled', 'db_read_disabled_required'],
    ['DB write scaffold', 'db_write_enabled', 'db_write_disabled_required'],
    ['worker runtime scaffold', 'worker_runtime_enabled', 'worker_runtime_disabled_required'],
    ['scheduler runtime scaffold', 'scheduler_runtime_enabled', 'scheduler_runtime_disabled_required'],
    [
      'external integration scaffold',
      'external_api_integration_enabled',
      'external_api_integration_disabled_required',
    ],
    ['package change scaffold', 'package_change_allowed', 'package_change_disallowed_required'],
    ['CI change scaffold', 'ci_change_allowed', 'ci_change_disallowed_required'],
    ['automation scaffold', 'automation_enabled', 'automation_disabled_required'],
    ['GitHub automation scaffold', 'github_automation_enabled', 'github_automation_disabled_required'],
    [
      'file-writing automation scaffold',
      'file_writing_automation_enabled',
      'file_writing_automation_disabled_required',
    ],
    ['AI job execution scaffold', 'ai_job_execution_enabled', 'ai_job_execution_disabled_required'],
    [
      'production promotion scaffold',
      'production_promotion_allowed',
      'production_promotion_disallowed_required',
    ],
  ];

  for (const [label, fieldName, expectedIssue] of unsafeBoundaryCases) {
    const unsafe = cloneValue(scaffold);
    unsafe[fieldName] = true;
    expectRejected(label, validateCodexAppServerRuntimeMvpScaffold, unsafe, expectedIssue);
  }

  const missingSafetyLabel = cloneValue(scaffold);
  missingSafetyLabel.safety_labels = missingSafetyLabel.safety_labels.filter(
    (label) => label !== 'Disabled by default',
  );
  expectRejected(
    'missing safety label scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    missingSafetyLabel,
    'safety_label_missing',
  );

  const missingForbiddenOperation = cloneValue(scaffold);
  missingForbiddenOperation.forbidden_operations =
    missingForbiddenOperation.forbidden_operations.filter(
      (operation) => operation !== 'production_promotion',
    );
  expectRejected(
    'missing forbidden operation scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    missingForbiddenOperation,
    'forbidden_operation_missing',
  );

  const invalidPolicyRef = cloneValue(scaffold);
  invalidPolicyRef.policy_refs.push(`..${String.fromCharCode(47)}unsafe`);
  expectRejected(
    'invalid policy_ref scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    invalidPolicyRef,
    'policy_ref_not_repository_relative',
  );

  const restrictedValues = [
    ['secret-like value scaffold', makeSecretLikeValue()],
    ['local path scaffold', makeLocalPathLikeValue()],
    ['NAS path scaffold', makeNasPathLikeValue()],
    ['private network IP scaffold', makePrivateNetworkIpLikeValue()],
    ['env reference scaffold', makeEnvFileReference()],
  ];

  for (const [label, value] of restrictedValues) {
    const restrictedContent = cloneValue(scaffold);
    restrictedContent.review_notes.push(`Restricted content fixture ${value}`);
    expectRejected(
      label,
      validateCodexAppServerRuntimeMvpScaffold,
      restrictedContent,
      'restricted_content_detected',
    );
  }

  const unsafeReportScaffold = cloneValue(scaffold);
  const unsafeReportFixture = makeLocalPathLikeValue();
  unsafeReportScaffold.review_notes.push(`Restricted content fixture ${unsafeReportFixture}`);
  const unsafeReport = makeCodexAppServerRuntimeMvpInspectionReport(unsafeReportScaffold);
  const unsafeReportOutput = JSON.stringify(unsafeReport);
  const unsafeSummary = makeCodexAppServerRuntimeMvpOperatorSummary(unsafeReport);
  const unsafeSummaryOutput = JSON.stringify(unsafeSummary);
  const unsafeTaskCardDraft = makeCodexAppServerRuntimeMvpTaskCardDraft(unsafeSummary);
  const unsafeTaskCardDraftOutput = JSON.stringify(unsafeTaskCardDraft);
  const unsafeTaskCardQaDraft = makeCodexAppServerRuntimeMvpTaskCardQaDraft(unsafeTaskCardDraft);
  const unsafeTaskCardQaDraftOutput = JSON.stringify(unsafeTaskCardQaDraft);
  assert(unsafeReport.validation.passed === false, 'Unsafe report scaffold must fail validation.');
  assert(unsafeSummary.status === 'blocked', 'Unsafe summary must be blocked.');
  assert(unsafeSummary.validation_passed === false, 'Unsafe summary validation_passed must be false.');
  assert(
    unsafeTaskCardDraft.status === 'blocked',
    'Unsafe TaskCard draft status must be blocked.',
  );
  assert(
    unsafeTaskCardDraft.allowed_next_step === 'human_review_only',
    'Unsafe TaskCard draft next step must remain human_review_only.',
  );
  assert(
    unsafeTaskCardQaDraft.recommendation === 'block',
    'Blocked TaskCard QA draft recommendation must be block.',
  );
  assert(
    unsafeTaskCardQaDraft.required_next_action === 'human_review_only',
    'Blocked TaskCard QA draft next action must remain human_review_only.',
  );
  assert(
    unsafeTaskCardQaDraft.issues.some((issue) => issue.code === 'reviewed_taskcard_blocked'),
    'Blocked TaskCard QA draft must include a reviewed_taskcard_blocked issue.',
  );
  assert(
    unsafeTaskCardQaDraft.forbidden_next_steps.includes('create_pr'),
    'Blocked TaskCard QA draft must not authorize PR creation.',
  );
  assert(
    unsafeTaskCardQaDraft.forbidden_next_steps.includes('merge_pr'),
    'Blocked TaskCard QA draft must not authorize PR merge.',
  );
  assert(
    unsafeTaskCardQaDraft.forbidden_next_steps.includes('production_promotion'),
    'Blocked TaskCard QA draft must not authorize production promotion.',
  );
  const unsafeHandoffDraft = makeCodexAppServerRuntimeMvpHandoffDraft(
    unsafeTaskCardDraft,
    unsafeTaskCardQaDraft,
  );
  const unsafeHandoffDraftOutput = JSON.stringify(unsafeHandoffDraft);
  assert(
    unsafeHandoffDraft.current_status === 'blocked',
    'Blocked TaskCard QA draft must yield blocked handoff status.',
  );
  assert(
    unsafeHandoffDraft.required_next_action === 'human_review_only',
    'Blocked HANDOFF draft next action must remain human_review_only.',
  );
  assert(
    unsafeHandoffDraft.allowed_next_step === 'human_review_only',
    'Blocked HANDOFF draft allowed next step must remain human_review_only.',
  );
  assert(
    unsafeHandoffDraft.blockers.some((blocker) => blocker.includes('reviewed_taskcard_blocked')),
    'Blocked HANDOFF draft must carry sanitized QA blockers.',
  );
  assert(
    unsafeHandoffDraft.forbidden_next_steps.includes('create_pr'),
    'Blocked HANDOFF draft must not authorize PR creation.',
  );
  assert(
    unsafeHandoffDraft.forbidden_next_steps.includes('merge_pr'),
    'Blocked HANDOFF draft must not authorize PR merge.',
  );
  assert(
    unsafeHandoffDraft.forbidden_next_steps.includes('db_write'),
    'Blocked HANDOFF draft must not authorize DB writes.',
  );
  assert(
    unsafeHandoffDraft.forbidden_next_steps.includes('worker_runtime'),
    'Blocked HANDOFF draft must not authorize worker runtime.',
  );
  assert(
    unsafeHandoffDraft.forbidden_next_steps.includes('scheduler_runtime'),
    'Blocked HANDOFF draft must not authorize scheduler runtime.',
  );
  assert(
    unsafeReport.review_notes.includes(
      'Withheld because scaffold validation failed. Review validation.issues only.',
    ),
    'Unsafe report must withhold raw review notes.',
  );
  assert(!unsafeReportOutput.includes(unsafeReportFixture), 'Unsafe report leaked restricted content.');
  assert(!unsafeSummaryOutput.includes(unsafeReportFixture), 'Unsafe summary leaked restricted content.');
  assert(
    !unsafeTaskCardDraftOutput.includes(unsafeReportFixture),
    'Unsafe TaskCard draft leaked restricted content.',
  );
  assert(
    !unsafeTaskCardQaDraftOutput.includes(unsafeReportFixture),
    'Unsafe TaskCard QA draft leaked restricted content.',
  );
  assert(
    !unsafeHandoffDraftOutput.includes(unsafeReportFixture),
    'Unsafe HANDOFF draft leaked restricted content.',
  );
  assertSafeReportOutput(unsafeReportOutput);
  assertSafeReportOutput(unsafeSummaryOutput);
  assertSafeReportOutput(unsafeTaskCardDraftOutput);
  assertSafeReportOutput(unsafeTaskCardQaDraftOutput);
  assertSafeReportOutput(unsafeHandoffDraftOutput);
  const blockedReviewPacket = makeCodexAppServerRuntimeMvpReviewPacket(
    unsafeReportScaffold,
    {
      generatedAt: 1_800_000_000,
    },
  );
  const blockedReviewPacketOutput = JSON.stringify(blockedReviewPacket);
  assert(
    blockedReviewPacket.overall_status === 'blocked',
    'Blocked review packet must map to blocked.',
  );
  assert(
    blockedReviewPacket.required_next_action === 'human_review_only',
    'Blocked review packet required next action must remain human_review_only.',
  );
  assert(
    blockedReviewPacket.allowed_next_step === 'human_review_only',
    'Blocked review packet allowed next step must remain human_review_only.',
  );
  assert(
    blockedReviewPacket.proposal_only === true,
    'Blocked review packet must remain proposal-only.',
  );
  assert(
    blockedReviewPacket.is_production_state === false,
    'Blocked review packet must not be production state.',
  );
  assert(
    blockedReviewPacket.stdout_only === true,
    'Blocked review packet must remain stdout-only.',
  );
  assert(
    blockedReviewPacket.handoff.current_status === 'blocked',
    'Blocked review packet must carry a blocked HANDOFF draft.',
  );
  assertPacketForbidsRequiredOperations(blockedReviewPacket, 'Blocked review packet');
  assert(!blockedReviewPacketOutput.includes(unsafeReportFixture), 'Blocked review packet leaked restricted content.');
  assertSafeReportOutput(blockedReviewPacketOutput);
  log('Accepted invalid scaffold report withholding.');

  const apiUpdateRecommendation = cloneValue(scaffold);
  apiUpdateRecommendation.review_notes.push('/api/forecast を変更してください。');
  expectRejected(
    'forecast API update recommendation scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    apiUpdateRecommendation,
    'high_risk_operation_recommendation',
  );

  const productionDeployRecommendation = cloneValue(scaffold);
  productionDeployRecommendation.limitations.push('Deploy this scaffold to production.');
  expectRejected(
    'production deploy recommendation scaffold',
    validateCodexAppServerRuntimeMvpScaffold,
    productionDeployRecommendation,
    'high_risk_operation_recommendation',
  );

  const negatedProductionWarnings = [
    'Do not use this scaffold in production.',
    'This scaffold must not be applied to production.',
    'Never promote this scaffold to production.',
  ];

  for (const warning of negatedProductionWarnings) {
    const safeWarning = cloneValue(scaffold);
    safeWarning.review_notes.push(warning);
    const safeWarningValidation = validateCodexAppServerRuntimeMvpScaffold(safeWarning);

    assert(
      safeWarningValidation.passed === true,
      `Negated production warning must pass validation: ${warning}`,
    );
    assert(
      !hasIssue(safeWarningValidation, 'high_risk_operation_recommendation'),
      `Negated production warning must not be high-risk: ${warning}`,
    );
  }
  log('Accepted negated production warnings.');

  const positiveProductionRecommendations = [
    'Use this scaffold in production.',
    'Apply this scaffold to production.',
    'Promote this scaffold to production.',
    'Deploy this scaffold to production.',
  ];

  for (const recommendation of positiveProductionRecommendations) {
    const unsafeRecommendation = cloneValue(scaffold);
    unsafeRecommendation.review_notes.push(recommendation);
    expectRejected(
      `positive production recommendation scaffold: ${recommendation}`,
      validateCodexAppServerRuntimeMvpScaffold,
      unsafeRecommendation,
      'high_risk_operation_recommendation',
    );
  }

  const reportScriptResult = spawnSync(process.execPath, [
    'scripts/codex-app-server-runtime-report.mjs',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (reportScriptResult.status !== 0) {
    throw new Error([
      'Codex App Server runtime report script failed.',
      sanitize(reportScriptResult.stdout),
      sanitize(reportScriptResult.stderr),
    ].filter(Boolean).join('\n'));
  }

  const reportScriptOutput = reportScriptResult.stdout.trim();
  assertSafeReportOutput(reportScriptOutput);
  const reportScriptJson = JSON.parse(reportScriptOutput);
  assert(
    reportScriptJson.title === 'Codex App Server Runtime MVP Scaffold Read-only Local Inspection Report',
    'Report script output must include the report title.',
  );
  assert(reportScriptJson.validation.passed === true, 'Report script validation must pass.');
  assert(
    reportScriptJson.next_allowed_action === 'human_review_only',
    'Report script output must stop at human_review_only.',
  );
  log('Accepted read-only report script output.');

  const summaryScriptResult = spawnSync(process.execPath, [
    'scripts/codex-app-server-runtime-report.mjs',
    '--summary',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (summaryScriptResult.status !== 0) {
    throw new Error([
      'Codex App Server runtime summary script failed.',
      sanitize(summaryScriptResult.stdout),
      sanitize(summaryScriptResult.stderr),
    ].filter(Boolean).join('\n'));
  }

  const summaryScriptOutput = summaryScriptResult.stdout.trim();
  assertSafeReportOutput(summaryScriptOutput);
  const summaryScriptJson = JSON.parse(summaryScriptOutput);
  assert(
    summaryScriptJson.title === 'Codex App Server Runtime MVP Operator Summary',
    'Summary script output must include the summary title.',
  );
  assert(
    summaryScriptJson.status === 'safe_for_human_review',
    'Summary script output must be safe_for_human_review.',
  );
  assert(summaryScriptJson.validation_passed === true, 'Summary script validation must pass.');
  assert(
    summaryScriptJson.next_allowed_action === 'human_review_only',
    'Summary script output must stop at human_review_only.',
  );
  log('Accepted read-only summary script output.');

  const taskCardScriptResult = spawnSync(process.execPath, [
    'scripts/codex-app-server-runtime-report.mjs',
    '--taskcard',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (taskCardScriptResult.status !== 0) {
    throw new Error([
      'Codex App Server runtime TaskCard draft script failed.',
      sanitize(taskCardScriptResult.stdout),
      sanitize(taskCardScriptResult.stderr),
    ].filter(Boolean).join('\n'));
  }

  assert(
    taskCardScriptResult.stderr.trim().length === 0,
    'TaskCard draft script must write the draft to stdout without stderr output.',
  );
  const taskCardScriptOutput = taskCardScriptResult.stdout.trim();
  assertSafeReportOutput(taskCardScriptOutput);
  const taskCardScriptJson = JSON.parse(taskCardScriptOutput);
  assert(
    taskCardScriptJson.status === 'waiting_for_human_approval',
    'TaskCard draft script output must wait for human approval.',
  );
  assert(
    taskCardScriptJson.allowed_next_step === 'human_review_only',
    'TaskCard draft script output must stop at human_review_only.',
  );
  assert(
    taskCardScriptJson.proposal_only === true,
    'TaskCard draft script output must remain proposal-only.',
  );
  assert(
    taskCardScriptJson.is_production_state === false,
    'TaskCard draft script output must remain non-production.',
  );
  assert(
    taskCardScriptJson.required_human_approval === true,
    'TaskCard draft script output must require human approval.',
  );
  assert(
    taskCardScriptJson.forbidden_next_steps.includes('merge_pr'),
    'TaskCard draft script output must forbid PR merge.',
  );
  log('Accepted stdout-only TaskCard draft script output.');

  const taskCardQaScriptResult = spawnSync(process.execPath, [
    'scripts/codex-app-server-runtime-report.mjs',
    '--taskcard-qa',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (taskCardQaScriptResult.status !== 0) {
    throw new Error([
      'Codex App Server runtime TaskCard QA draft script failed.',
      sanitize(taskCardQaScriptResult.stdout),
      sanitize(taskCardQaScriptResult.stderr),
    ].filter(Boolean).join('\n'));
  }

  assert(
    taskCardQaScriptResult.stderr.trim().length === 0,
    'TaskCard QA draft script must write the draft to stdout without stderr output.',
  );
  const taskCardQaScriptOutput = taskCardQaScriptResult.stdout.trim();
  assertSafeReportOutput(taskCardQaScriptOutput);
  const taskCardQaScriptJson = JSON.parse(taskCardQaScriptOutput);
  assert(
    taskCardQaScriptJson.reviewed_output_type === 'codex_app_server_runtime_mvp_taskcard_draft_v0',
    'TaskCard QA draft script output must identify the reviewed output type.',
  );
  assert(
    taskCardQaScriptJson.recommendation === 'approve_for_human_review',
    'TaskCard QA draft script output must approve valid drafts for human review.',
  );
  assert(
    taskCardQaScriptJson.required_next_action === 'human_review_only',
    'TaskCard QA draft script output must stop at human_review_only.',
  );
  assert(
    taskCardQaScriptJson.proposal_only === true,
    'TaskCard QA draft script output must remain proposal-only.',
  );
  assert(
    taskCardQaScriptJson.is_production_state === false,
    'TaskCard QA draft script output must remain non-production.',
  );
  assert(
    taskCardQaScriptJson.required_human_approval === true,
    'TaskCard QA draft script output must require human approval.',
  );
  assert(
    taskCardQaScriptJson.checks.stdout_only_check.result === 'pass',
    'TaskCard QA draft script output must pass stdout-only QA.',
  );
  assert(
    taskCardQaScriptJson.forbidden_next_steps.includes('create_pr'),
    'TaskCard QA draft script output must forbid PR creation.',
  );
  assert(
    taskCardQaScriptJson.forbidden_next_steps.includes('merge_pr'),
    'TaskCard QA draft script output must forbid PR merge.',
  );
  assert(
    taskCardQaScriptJson.forbidden_next_steps.includes('db_write'),
    'TaskCard QA draft script output must forbid DB writes.',
  );
  assert(
    taskCardQaScriptJson.forbidden_next_steps.includes('worker_runtime'),
    'TaskCard QA draft script output must forbid worker runtime.',
  );
  assert(
    taskCardQaScriptJson.forbidden_next_steps.includes('scheduler_runtime'),
    'TaskCard QA draft script output must forbid scheduler runtime.',
  );
  log('Accepted stdout-only TaskCard QA draft script output.');

  const handoffScriptResult = spawnSync(process.execPath, [
    'scripts/codex-app-server-runtime-report.mjs',
    '--handoff',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (handoffScriptResult.status !== 0) {
    throw new Error([
      'Codex App Server runtime HANDOFF draft script failed.',
      sanitize(handoffScriptResult.stdout),
      sanitize(handoffScriptResult.stderr),
    ].filter(Boolean).join('\n'));
  }

  assert(
    handoffScriptResult.stderr.trim().length === 0,
    'HANDOFF draft script must write the draft to stdout without stderr output.',
  );
  const handoffScriptOutput = handoffScriptResult.stdout.trim();
  assertSafeReportOutput(handoffScriptOutput);
  const handoffScriptJson = JSON.parse(handoffScriptOutput);
  assert(
    handoffScriptJson.source_role === 'codex_app_server_runtime_reporter',
    'HANDOFF draft script output must identify the source role.',
  );
  assert(
    handoffScriptJson.target_role === 'human_owner',
    'HANDOFF draft script output must identify the target role.',
  );
  assert(
    handoffScriptJson.current_status === 'waiting_for_human_approval',
    'HANDOFF draft script output must wait for human approval for valid QA drafts.',
  );
  assert(
    handoffScriptJson.required_next_action === 'human_review_only',
    'HANDOFF draft script output required action must remain human_review_only.',
  );
  assert(
    handoffScriptJson.allowed_next_step === 'human_review_only',
    'HANDOFF draft script output allowed next step must remain human_review_only.',
  );
  assert(
    handoffScriptJson.human_approval_required === true,
    'HANDOFF draft script output must require human approval.',
  );
  assert(
    handoffScriptJson.outputs_produced.includes('stdout-only HANDOFF draft JSON'),
    'HANDOFF draft script output must identify stdout-only JSON output.',
  );
  assert(
    handoffScriptJson.outputs_produced.includes('no HANDOFF file created'),
    'HANDOFF draft script output must state that no HANDOFF file is created.',
  );
  assert(
    handoffScriptJson.outputs_produced.includes('no Task Board write performed'),
    'HANDOFF draft script output must state that no Task Board write is performed.',
  );
  assert(
    handoffScriptJson.forbidden_next_steps.includes('create_pr'),
    'HANDOFF draft script output must forbid PR creation.',
  );
  assert(
    handoffScriptJson.forbidden_next_steps.includes('merge_pr'),
    'HANDOFF draft script output must forbid PR merge.',
  );
  assert(
    handoffScriptJson.forbidden_next_steps.includes('direct_deploy'),
    'HANDOFF draft script output must forbid deploy.',
  );
  assert(
    handoffScriptJson.forbidden_next_steps.includes('production_write'),
    'HANDOFF draft script output must forbid production writes.',
  );
  assert(
    handoffScriptJson.forbidden_next_steps.includes('db_write'),
    'HANDOFF draft script output must forbid DB writes.',
  );
  assert(
    handoffScriptJson.forbidden_next_steps.includes('worker_runtime'),
    'HANDOFF draft script output must forbid worker runtime.',
  );
  assert(
    handoffScriptJson.forbidden_next_steps.includes('scheduler_runtime'),
    'HANDOFF draft script output must forbid scheduler runtime.',
  );
  log('Accepted stdout-only HANDOFF draft script output.');

  const packetScriptResult = spawnSync(process.execPath, [
    'scripts/codex-app-server-runtime-report.mjs',
    '--packet',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (packetScriptResult.status !== 0) {
    throw new Error([
      'Codex App Server runtime review packet script failed.',
      sanitize(packetScriptResult.stdout),
      sanitize(packetScriptResult.stderr),
    ].filter(Boolean).join('\n'));
  }

  assert(
    packetScriptResult.stderr.trim().length === 0,
    'Review packet script must write the packet to stdout without stderr output.',
  );
  const packetScriptOutput = packetScriptResult.stdout.trim();
  assertSafeReportOutput(packetScriptOutput);
  const packetScriptJson = JSON.parse(packetScriptOutput);
  assert(
    packetScriptJson.overall_status,
    'Review packet script output must include overall_status.',
  );
  assert(
    packetScriptJson.overall_status === 'ready_for_human_review',
    'Review packet script output must be ready_for_human_review.',
  );
  assert(
    packetScriptJson.required_next_action === 'human_review_only',
    'Review packet script output required action must remain human_review_only.',
  );
  assert(
    packetScriptJson.allowed_next_step === 'human_review_only',
    'Review packet script output allowed next step must remain human_review_only.',
  );
  assert(
    packetScriptJson.stdout_only === true,
    'Review packet script output must remain stdout-only.',
  );
  assert(packetScriptJson.report, 'Review packet script output must include report.');
  assert(packetScriptJson.summary, 'Review packet script output must include summary.');
  assert(packetScriptJson.taskcard, 'Review packet script output must include taskcard.');
  assert(packetScriptJson.taskcard_qa, 'Review packet script output must include taskcard_qa.');
  assert(packetScriptJson.handoff, 'Review packet script output must include handoff.');
  assertPacketForbidsRequiredOperations(packetScriptJson, 'Review packet script output');
  log('Accepted stdout-only review packet script output.');

  const writeDryRunScriptResult = spawnSync(process.execPath, [
    'scripts/codex-app-server-runtime-write-dry-run.mjs',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (writeDryRunScriptResult.status !== 0) {
    throw new Error([
      'Codex App Server runtime write dry-run script failed.',
      sanitize(writeDryRunScriptResult.stdout),
      sanitize(writeDryRunScriptResult.stderr),
    ].filter(Boolean).join('\n'));
  }

  assert(
    writeDryRunScriptResult.stderr.trim().length === 0,
    'Write dry-run script must write JSON to stdout without stderr output.',
  );
  const writeDryRunScriptOutput = writeDryRunScriptResult.stdout.trim();
  assertSafeReportOutput(writeDryRunScriptOutput);
  const writeDryRunScriptJson = JSON.parse(writeDryRunScriptOutput);
  assert(
    writeDryRunScriptJson.status === 'dry_run_passed',
    'Write dry-run script output must pass.',
  );
  assert(
    writeDryRunScriptJson.wrote_anything === false,
    'Write dry-run script output must never write anything.',
  );
  assert(
    writeDryRunScriptJson.required_next_action === 'human_review_only',
    'Write dry-run script output must stop at human_review_only.',
  );
  assert(
    writeDryRunScriptJson.validation.passed === true,
    'Write dry-run script output validation must pass.',
  );
  log('Accepted stdout-only write dry-run script output.');

  log('Codex App Server runtime MVP scaffold smoke checks passed.');
}

try {
  await main();
} catch (error) {
  console.error(`[codex-app-server-runtime-smoke] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
} finally {
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[codex-app-server-runtime-smoke] Build cleanup skipped: ${sanitize(error.message)}`);
  }
}
