import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  like,
  or,
  type SQL,
} from 'drizzle-orm';

import { db } from '@/core/db';
import {
  contactMessage,
  contactTicket,
  type ContactMessage,
  type ContactTicket,
} from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

export type ContactTicketStatus = 'open' | 'replied' | 'closed';
export type ContactMessageRole = 'requester' | 'admin';

export async function countRecentContactTickets(ipHash: string, since: Date) {
  const [result] = await db()
    .select({ count: count() })
    .from(contactTicket)
    .where(
      and(eq(contactTicket.ipHash, ipHash), gt(contactTicket.createdAt, since))
    );
  return result.count;
}

export async function createContactTicket(params: {
  userId?: string | null;
  requesterName: string;
  requesterEmail: string;
  category: string;
  subject: string;
  message: string;
  locale: string;
  ipHash: string;
}): Promise<ContactTicket> {
  return db().transaction(async (tx: any) => {
    const now = new Date();
    const [row] = await tx
      .insert(contactTicket)
      .values({
        id: getUuid(),
        userId: params.userId ?? null,
        requesterName: params.requesterName,
        requesterEmail: params.requesterEmail.toLowerCase(),
        category: params.category,
        subject: params.subject,
        status: 'open',
        locale: params.locale,
        ipHash: params.ipHash,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await tx.insert(contactMessage).values({
      id: getUuid(),
      ticketId: row.id,
      role: 'requester',
      content: params.message,
      createdAt: now,
    });

    return row;
  });
}

async function getLatestMessages(ticketIds: string[]) {
  if (!ticketIds.length) return {} as Record<string, string>;
  const rows = await db()
    .select({
      ticketId: contactMessage.ticketId,
      content: contactMessage.content,
    })
    .from(contactMessage)
    .where(inArray(contactMessage.ticketId, ticketIds))
    .orderBy(desc(contactMessage.createdAt));

  const latest: Record<string, string> = {};
  for (const row of rows) {
    if (!(row.ticketId in latest)) latest[row.ticketId] = row.content;
  }
  return latest;
}

export async function listContactTickets(params: {
  page?: number;
  pageSize?: number;
  status?: ContactTicketStatus;
  search?: string;
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const conditions: SQL[] = [];
  if (params.status) conditions.push(eq(contactTicket.status, params.status));
  if (params.search) {
    conditions.push(
      or(
        like(contactTicket.subject, `%${params.search}%`),
        like(contactTicket.requesterEmail, `%${params.search}%`),
        like(contactTicket.requesterName, `%${params.search}%`)
      )!
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const countQuery = db().select({ count: count() }).from(contactTicket);
  const [totalResult] = await (where ? countQuery.where(where) : countQuery);

  const listQuery = db().select().from(contactTicket);
  const rows: ContactTicket[] = await (
    where ? listQuery.where(where) : listQuery
  )
    .orderBy(desc(contactTicket.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const latest = await getLatestMessages(
    rows.map((row: ContactTicket) => row.id)
  );

  return {
    items: rows.map((row: ContactTicket) => ({
      ...row,
      latestMessage: latest[row.id] ?? null,
    })),
    total: totalResult.count,
  };
}

export async function getContactTicketById(id: string) {
  const [row] = await db()
    .select()
    .from(contactTicket)
    .where(eq(contactTicket.id, id))
    .limit(1);
  return row;
}

export async function getContactMessages(
  ticketId: string
): Promise<ContactMessage[]> {
  return db()
    .select()
    .from(contactMessage)
    .where(eq(contactMessage.ticketId, ticketId))
    .orderBy(asc(contactMessage.createdAt));
}

export async function addContactMessage(params: {
  ticketId: string;
  role: ContactMessageRole;
  content: string;
}) {
  return db().transaction(async (tx: any) => {
    const now = new Date();
    const [row] = await tx
      .insert(contactMessage)
      .values({
        id: getUuid(),
        ticketId: params.ticketId,
        role: params.role,
        content: params.content,
        createdAt: now,
      })
      .returning();

    await tx
      .update(contactTicket)
      .set({
        status: params.role === 'admin' ? 'replied' : 'open',
        updatedAt: now,
      })
      .where(eq(contactTicket.id, params.ticketId));
    return row;
  });
}

export async function updateContactTicketStatus(
  id: string,
  status: ContactTicketStatus
) {
  const [row] = await db()
    .update(contactTicket)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactTicket.id, id))
    .returning();
  return row;
}
