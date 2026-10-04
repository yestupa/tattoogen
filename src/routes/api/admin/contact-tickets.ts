import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  listContactTickets,
  type ContactTicketStatus,
} from '@/modules/contact/service';
import { hasPermission } from '@/modules/rbac/service';
import { respErr, respPage } from '@/lib/resp';

const VALID_STATUSES: ContactTicketStatus[] = ['open', 'replied', 'closed'];

async function checkAdmin(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) throw new Error('Unauthorized');
  if (!(await hasPermission(session.user.id, 'admin.*'))) {
    throw new Error('Forbidden');
  }
}

async function GET({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get('pageSize')) || 20)
    );
    const status = searchParams.get('status') as ContactTicketStatus | null;
    const result = await listContactTickets({
      page,
      pageSize,
      status: status && VALID_STATUSES.includes(status) ? status : undefined,
      search: searchParams.get('keyword')?.trim() || undefined,
    });
    return respPage(result.items, result.total);
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/admin/contact-tickets')({
  server: { handlers: { GET } },
});
