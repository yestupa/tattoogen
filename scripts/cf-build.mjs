import { spawnSync } from 'node:child_process';

import { loadProductionEnv, packageCli } from './cf-env.mjs';

loadProductionEnv();
process.env.NITRO_PRESET = 'cloudflare_module';
await import('./db-setup.mjs');

const result = spawnSync(
  process.execPath,
  [packageCli('vite', 'bin/vite.js'), 'build'],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

process.exit(result.status ?? 1);
