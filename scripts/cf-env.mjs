import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadProductionEnv() {
  if (!existsSync('.env.production')) return;

  const lines = readFileSync('.env.production', 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equals = trimmed.indexOf('=');
    if (equals === -1) continue;

    const name = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();
    if (!name || process.env[name] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[name] = value;
  }
}

export function packageCli(packageName, cliPath) {
  return resolve('node_modules', packageName, cliPath);
}
