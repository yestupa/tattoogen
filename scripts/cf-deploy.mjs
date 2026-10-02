import { spawnSync } from 'node:child_process';

import { loadProductionEnv, packageCli } from './cf-env.mjs';

loadProductionEnv();
process.env.NITRO_PRESET = 'cloudflare_module';
await import('./db-setup.mjs');

const build = spawnSync(
  process.execPath,
  [packageCli('vite', 'bin/vite.js'), 'build'],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const deploy = spawnSync(
  process.execPath,
  [packageCli('wrangler', 'bin/wrangler.js'), 'deploy'],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

process.exit(deploy.status ?? 1);
