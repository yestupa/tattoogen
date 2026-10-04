import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  addContactMessage,
  getContactMessages,
  getContactTicketById,
  updateContactTicketStatus,
  type ContactTicketStatus,
} from '@/modules/contact/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr, respOk } from '@/lib/resp';

const VALID_STATUSES: ContactTicketStatus[] = ['open', 'replied', 'closed'];

async function checkAdmin(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) throw new Error('Unauthorized');
  if (!(await hasPermission(session.user.id, 'admin.*'))) {
    throw new Error('Forbidden');
  }
}

async function GET({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    await checkAdmin(request);
    const ticket = await getContactTicketById(params.id);
    if (!ticket) return respErr('Ticket not found');
    return respData({
      ticket,
      messages: await getContactMessages(params.id),
    });
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

async function POST({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    await checkAdmin(request);
    const ticket = await getContactTicketById(params.id);
    if (!ticket) return respErr('Ticket not found');
    if (ticket.status === 'closed') return respErr('Ticket is closed');
    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content || content.length > 5000) return respErr('Invalid content');
    return respData(
      await addContactMessage({
        ticketId: params.id,
        role: 'admin',
        content,
      })
    );
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

async function PATCH({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    await checkAdmin(request);
    if (!(await getContactTicketById(params.id))) {
      return respErr('Ticket not found');
    }
    const body = await request.json().catch(() => ({}));
    const status = body.status as ContactTicketStatus;
    if (!VALID_STATUSES.includes(status)) return respErr('Invalid status');
    await updateContactTicketStatus(params.id, status);
    return respOk();
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/admin/contact-tickets/$id')({
  server: { handlers: { GET, POST, PATCH } },
});
