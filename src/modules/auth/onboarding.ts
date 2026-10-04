import { grantForNewUser } from '@/modules/credits/service';
import { notifyVerifiedSignup } from '@/modules/notifications/service';
import { grantRoleForNewUser } from '@/modules/rbac/service';

export async function completeUserOnboarding(params: {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    locale?: string | null;
    createdAt?: Date | string | null;
  };
  configs: Record<string, string>;
}) {
  const { user, configs } = params;
  const verificationRequired = configs.email_verification_enabled === 'true';
  if (verificationRequired && !user.emailVerified) return false;

  await grantRoleForNewUser({ userId: user.id, configs });
  await grantForNewUser({
    userId: user.id,
    userEmail: user.email,
    configs,
  });
  await notifyVerifiedSignup(user);
  return true;
}
