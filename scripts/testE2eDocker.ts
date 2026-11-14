import playwrightPackage from '@playwright/test/package.json' with { type: 'json' };
import { type ChildProcess, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { access, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const apiContext = resolve(root, process.env.E2E_API_CONTEXT ?? '../repodog-dotnet-kickstarter');
await access(resolve(apiContext, 'Dockerfile'));

await Promise.all(
  ['playwright-report', 'test-results'].map(directory => mkdir(resolve(root, directory), { recursive: true })),
);

const password = (): string => `Aa1!${randomBytes(24).toString('hex')}`;

const environment = {
  ...process.env,
  E2E_API_CONTEXT: apiContext,
  E2E_AUTH_SECRET: randomBytes(32).toString('hex'),
  E2E_DB_PASSWORD: password(),
  E2E_PLAYWRIGHT_VERSION: playwrightPackage.version,
  E2E_PRIVILEGED_EMAIL: 'privileged-e2e@example.invalid',
  E2E_PRIVILEGED_PASSWORD: password(),
  E2E_USER_EMAIL: 'user-e2e@example.invalid',
  E2E_USER_PASSWORD: password(),
};

const composeArguments = [
  'compose',
  '--project-name',
  `repodog-nextjs-kickstarter-e2e-${String(process.pid)}`,
  '--file',
  'compose.e2e.yaml',
];

let child: ChildProcess | undefined;

const interrupt = (): void => {
  child?.kill('SIGINT');
};

process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);

const compose = (args: string[]): Promise<number> =>
  new Promise<number>((resolveExit, reject) => {
    child = spawn('docker', [...composeArguments, ...args], { cwd: root, env: environment, stdio: 'inherit' });
    child.once('error', reject);

    child.once('exit', code => {
      child = undefined;
      resolveExit(code ?? 130);
    });
  });

let exitCode = 1;

try {
  const buildCode = await compose(['build']);

  if (buildCode !== 0) {
    throw new Error('The end-to-end images could not be built.');
  }

  const startupCode = await compose(['up', '--detach', '--wait', '--wait-timeout', '240', 'db', 'api', 'web']);

  if (startupCode !== 0) {
    throw new Error('The end-to-end services did not become ready.');
  }

  exitCode = await compose(['run', '--rm', '--no-deps', '-T', 'e2e']);

  if (exitCode !== 0) {
    await compose(['logs', '--no-color', '--tail', '100', 'api', 'web']);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'The end-to-end run failed.');
} finally {
  const cleanupCode = await compose(['down', '--volumes', '--remove-orphans']);

  if (cleanupCode !== 0 && exitCode === 0) {
    exitCode = cleanupCode;
  }

  process.off('SIGINT', interrupt);
  process.off('SIGTERM', interrupt);
}

process.exitCode = exitCode;
