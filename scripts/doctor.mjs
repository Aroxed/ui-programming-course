import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const checks = [];
let failed = false;

function report(ok, label, detail = '') {
  checks.push({ ok, label, detail });
  if (!ok) failed = true;
}

const [major] = process.versions.node.split('.').map(Number);
report(
  major === 24,
  'Node.js 24 LTS',
  major === 24
    ? `detected ${process.versions.node}`
    : `detected ${process.versions.node}; install the version from .nvmrc`,
);

try {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npmVersion = execFileSync(npmCommand, ['--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
  report(true, 'npm', `detected ${npmVersion}`);
} catch {
  report(false, 'npm', 'npm is not available in PATH');
}

report(existsSync('package.json'), 'course root', 'package.json found');
report(existsSync('examples'), 'examples directory', 'examples/ found');
report(existsSync('services'), 'services directory', 'services/ found');
report(existsSync('screenshots'), 'screenshots directory', 'screenshots/ found');

console.log('\nUI Programming Course — environment check\n');
for (const check of checks) {
  const mark = check.ok ? '✓' : '✗';
  console.log(`${mark} ${check.label}${check.detail ? ` — ${check.detail}` : ''}`);
}

if (failed) {
  console.log('\nEnvironment is not ready. Fix the failed checks and run npm run doctor again.\n');
  process.exitCode = 1;
} else {
  console.log('\nEnvironment is ready.\n');
}
