import fs from 'node:fs';
import Module, { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const tsModuleCache = new Map();
let ts;

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
    name: '.env reference',
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
  return String(message)
    .replaceAll(projectRoot, '<project-root>')
    .replaceAll(projectRoot.replaceAll(path.sep, '/'), '<project-root>')
    .replace(/\b[A-Za-z]:[\\/][^\r\n'"`<>|]+/g, '<local-path>')
    .replace(/\\\\[^\\/\s]+[\\/][^\\/\s]+/g, '<network-path>')
    .replace(/(^|[\s'"`])\/(?:Users|home|tmp|var|etc|mnt|Volumes)\/[^\s'"`]+/g, '$1<local-path>')
    .replace(/\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})\b/g, '<private-network>');
}

function assertSafeOutput(output) {
  for (const { name, pattern } of RESTRICTED_OUTPUT_PATTERNS) {
    if (pattern.test(output)) {
      throw new Error(`Approval decision validation output contains restricted content: ${name}.`);
    }
  }
}

function getTypeScript() {
  if (!ts) {
    ts = require('typescript');
  }

  return ts;
}

function resolveRequest(request, parentFile) {
  if (request.startsWith('.') || request.startsWith('..')) {
    const basePath = path.resolve(path.dirname(parentFile), request);
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.mjs`,
      path.join(basePath, 'index.ts'),
      path.join(basePath, 'index.js'),
    ];

    const resolved = candidates.find((candidate) => fs.existsSync(candidate));
    if (resolved) {
      return resolved;
    }
  }

  return require.resolve(request, {
    paths: [
      path.dirname(parentFile),
      projectRoot,
    ],
  });
}

function loadTypeScriptModule(filePath) {
  const typescript = getTypeScript();
  const normalizedFilePath = path.resolve(filePath);
  const cachedModule = tsModuleCache.get(normalizedFilePath);
  if (cachedModule) {
    return cachedModule.exports;
  }

  const source = fs.readFileSync(normalizedFilePath, 'utf8');
  const transpiled = typescript.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: typescript.ModuleKind.CommonJS,
      moduleResolution: typescript.ModuleResolutionKind.Node10,
      strict: true,
      target: typescript.ScriptTarget.ES2020,
    },
    fileName: normalizedFilePath,
    reportDiagnostics: true,
  });

  const diagnostics = transpiled.diagnostics?.filter(
    (diagnostic) => diagnostic.category === typescript.DiagnosticCategory.Error,
  ) ?? [];
  if (diagnostics.length > 0) {
    const diagnosticText = typescript.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => projectRoot,
      getNewLine: () => '\n',
    });
    throw new Error(`In-memory TypeScript transpilation failed.\n${sanitize(diagnosticText)}`);
  }

  const tsModule = new Module(normalizedFilePath);
  tsModule.filename = normalizedFilePath;
  tsModule.paths = Module._nodeModulePaths(path.dirname(normalizedFilePath));
  tsModule.require = (request) => {
    const resolvedRequest = resolveRequest(request, normalizedFilePath);

    if (resolvedRequest.endsWith('.ts') || resolvedRequest.endsWith('.tsx')) {
      return loadTypeScriptModule(resolvedRequest);
    }

    return require(resolvedRequest);
  };
  tsModuleCache.set(normalizedFilePath, tsModule);
  tsModule._compile(transpiled.outputText, normalizedFilePath);

  return tsModule.exports;
}

function loadWriteApprovalDecisionHelpers() {
  const writeDryRunModule = loadTypeScriptModule(
    path.join(projectRoot, 'lib', 'codex-app-server-runtime', 'write-dry-run.ts'),
  );
  const writeApprovalRequestModule = loadTypeScriptModule(
    path.join(projectRoot, 'lib', 'codex-app-server-runtime', 'write-approval-request.ts'),
  );
  const writeApprovalDecisionModule = loadTypeScriptModule(
    path.join(projectRoot, 'lib', 'codex-app-server-runtime', 'write-approval-decision.ts'),
  );

  return {
    makeTaskBoardHandoffWriteDryRunRequest:
      writeDryRunModule.makeTaskBoardHandoffWriteDryRunRequest,
    runTaskBoardHandoffWriteDryRun:
      writeDryRunModule.runTaskBoardHandoffWriteDryRun,
    makeTaskBoardHandoffWriteApprovalRequestDraft:
      writeApprovalRequestModule.makeTaskBoardHandoffWriteApprovalRequestDraft,
    validateTaskBoardHandoffWriteApprovalDecision:
      writeApprovalDecisionModule.validateTaskBoardHandoffWriteApprovalDecision,
  };
}

try {
  const {
    makeTaskBoardHandoffWriteDryRunRequest,
    runTaskBoardHandoffWriteDryRun,
    makeTaskBoardHandoffWriteApprovalRequestDraft,
    validateTaskBoardHandoffWriteApprovalDecision,
  } = loadWriteApprovalDecisionHelpers();
  const request = makeTaskBoardHandoffWriteDryRunRequest();
  const dryRunResult = runTaskBoardHandoffWriteDryRun(request);
  const approvalRequestDraft =
    makeTaskBoardHandoffWriteApprovalRequestDraft(dryRunResult);
  const approvalDecisionValidation =
    validateTaskBoardHandoffWriteApprovalDecision(approvalRequestDraft);
  const output = JSON.stringify(approvalDecisionValidation, null, 2);

  assertSafeOutput(output);
  console.log(output);
} catch (error) {
  console.error(`[codex-app-server-runtime-write-approval-decision-validator] ${sanitize(error.stack || error.message || error)}`);
  process.exitCode = 1;
}
