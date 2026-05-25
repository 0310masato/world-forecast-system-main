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

function assertSafeReportOutput(output) {
  const restrictedPatterns = [
    /\b[A-Z]:\\[^\r\n'"`]+/,
    /\b[A-Z]:\/[^\r\n'"`<>|]+/,
    /(^|[\s'"`])\/(?:tmp|home|Users)\/[^\r\n'"`<>|]+/,
    /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})\b/,
    /\b(?:api[_-]?key|token|secret|password|credential|oauth[_-]?token)\s*[:=]/i,
    /\bsk-[A-Za-z0-9_-]{12,}\b/,
  ];

  assert(!output.includes(projectRoot), 'Report output leaked the project root.');
  assert(!output.includes(buildDir), 'Report output leaked the smoke build directory.');

  for (const pattern of restrictedPatterns) {
    assert(!pattern.test(output), 'Report output leaked restricted content.');
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
    makeCodexAppServerRuntimeMvpInspectionReport,
  } = require(path.join(buildDir, 'lib', 'codex-app-server-runtime', 'report.js'));
  const {
    validateCodexAppServerRuntimeMvpScaffold,
  } = require(path.join(buildDir, 'lib', 'codex-app-server-runtime', 'validation.js'));

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
  assert(unsafeReport.validation.passed === false, 'Unsafe report scaffold must fail validation.');
  assert(
    unsafeReport.review_notes.includes(
      'Withheld because scaffold validation failed. Review validation.issues only.',
    ),
    'Unsafe report must withhold raw review notes.',
  );
  assert(!unsafeReportOutput.includes(unsafeReportFixture), 'Unsafe report leaked restricted content.');
  assertSafeReportOutput(unsafeReportOutput);
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
