import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { envConfigs } from '@/config';
import {
  countRecentContactTickets,
  createContactTicket,
} from '@/modules/contact/service';
import {
  contactRequestSchema,
  isLikelyHumanContact,
} from '@/modules/contact/validation';
import { md5 } from '@/lib/hash';
import { respData, respErr } from '@/lib/resp';

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return (
    request.headers.get('cf-connecting-ip') ||
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

async function POST({ request }: { request: Request }) {
  try {
    const parsed = contactRequestSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return respErr('Please check every field and try again', { status: 400 });
    }
    const input = parsed.data;

    if (!isLikelyHumanContact(input)) {
      if (input.website) {
        return respData({ reference: 'received' });
      }
      return respErr('Please wait a moment before submitting', { status: 400 });
    }

    const ipHash = md5(`${envConfigs.auth_secret}|${getClientIp(request)}`);
    const recentCount = await countRecentContactTickets(
      ipHash,
      new Date(Date.now() - 60 * 60 * 1000)
    );
    if (recentCount >= 5) {
      return respErr('Too many requests. Please try again later', {
        status: 429,
      });
    }

    const auth = getAuth();
    const session = await auth.api
      .getSession({ headers: request.headers })
      .catch(() => null);
    const row = await createContactTicket({
      ...input,
      userId: session?.user?.id,
      ipHash,
    });
    return respData({ reference: row.id });
  } catch {
    return respErr('Unable to submit ticket', { status: 500 });
  }
}

export const Route = createFileRoute('/api/contact')({
  server: { handlers: { POST } },
});
