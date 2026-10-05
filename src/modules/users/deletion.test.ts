import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { validateUserDeletion } from './deletion';

const base = {
  actorId: 'actor-1',
  targetId: 'user-2',
  actorRoles: ['super_admin'],
  targetRoles: ['user'],
  confirmationEmail: 'member@example.com',
  targetEmail: 'member@example.com',
};

describe('admin user deletion policy', () => {
  it('allows a super admin to delete an ordinary user after email confirmation', () => {
    expect(validateUserDeletion(base)).toBeNull();
  });

  it('blocks self-deletion and protected administrator accounts', () => {
    expect(validateUserDeletion({ ...base, targetId: base.actorId })).toMatch(
      /own account/i
    );
    expect(validateUserDeletion({ ...base, targetRoles: ['admin'] })).toMatch(
      /administrator/i
    );
    expect(
      validateUserDeletion({ ...base, targetRoles: ['super_admin'] })
    ).toMatch(/administrator/i);
  });

  it('requires a super admin and an exact email confirmation', () => {
    expect(validateUserDeletion({ ...base, actorRoles: ['admin'] })).toMatch(
      /super administrator/i
    );
    expect(
      validateUserDeletion({ ...base, confirmationEmail: 'wrong@example.com' })
    ).toMatch(/email confirmation/i);
  });

  it('keeps the confirmation email out of the request URL', () => {
    const route = readFileSync(
      new URL('../../routes/api/admin/users/index.ts', import.meta.url),
      'utf8'
    );
    const page = readFileSync(
      new URL('../../routes/admin/users.tsx', import.meta.url),
      'utf8'
    );
    expect(route).toContain('await request.json()');
    expect(route).not.toContain("searchParams.get('email')");
    expect(page).toContain("apiDelete('/api/admin/users', {");
  });
});
