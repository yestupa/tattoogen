import type { EmailProvider } from '.';
import { CloudflareEmailProvider } from './cloudflare';
import { ResendProvider } from './resend';

export function getConfiguredEmailProvider(
  configs: Record<string, string>
): { provider: EmailProvider; from: string } | null {
  const selected = configs.email_provider || 'resend';

  if (selected === 'cloudflare') {
    const apiToken = configs.cloudflare_email_api_token?.trim();
    const accountId = configs.cloudflare_email_account_id?.trim();
    const from = configs.cloudflare_email_sender_email?.trim();
    if (!apiToken || !accountId || !from) return null;
    return {
      provider: new CloudflareEmailProvider({
        apiToken,
        accountId,
        defaultFrom: from,
      }),
      from,
    };
  }

  const apiKey = configs.resend_api_key?.trim();
  const from = configs.resend_sender_email?.trim();
  if (!apiKey || !from) return null;
  return {
    provider: new ResendProvider({ apiKey, defaultFrom: from }),
    from,
  };
}

export function isEmailConfigured(configs: Record<string, string>) {
  return getConfiguredEmailProvider(configs) !== null;
}
