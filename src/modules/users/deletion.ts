import { eq, inArray } from 'drizzle-orm';

import { db } from '@/core/db';
import {
  inviteCode,
  ticket,
  ticketMessage,
  user,
  userInvite,
} from '@/config/db/schema';

export function validateUserDeletion(params: {
  actorId: string;
  targetId: string;
  actorRoles: string[];
  targetRoles: string[];
  confirmationEmail: string;
  targetEmail: string;
}) {
  if (!params.actorRoles.includes('super_admin')) {
    return 'Only a super administrator can delete users';
  }
  if (params.actorId === params.targetId) {
    return 'You cannot delete your own account';
  }
  if (
    params.targetRoles.includes('admin') ||
    params.targetRoles.includes('super_admin')
  ) {
    return 'Administrator accounts cannot be deleted here';
  }
  if (
    params.confirmationEmail.trim().toLowerCase() !==
    params.targetEmail.trim().toLowerCase()
  ) {
    return 'Email confirmation does not match';
  }
  return null;
}

export async function deleteOrdinaryUser(userId: string) {
  return db().transaction(async (tx: any) => {
    const ownedTickets = await tx
      .select({ id: ticket.id })
      .from(ticket)
      .where(eq(ticket.userId, userId));
    const ticketIds = ownedTickets.map((row: { id: string }) => row.id);

    await tx.delete(ticketMessage).where(eq(ticketMessage.userId, userId));
    if (ticketIds.length) {
      await tx
        .delete(ticketMessage)
        .where(inArray(ticketMessage.ticketId, ticketIds));
    }
    await tx.delete(ticket).where(eq(ticket.userId, userId));
    await tx.delete(userInvite).where(eq(userInvite.userId, userId));
    await tx
      .update(inviteCode)
      .set({ createdBy: null })
      .where(eq(inviteCode.createdBy, userId));
    await tx.delete(user).where(eq(user.id, userId));
  });
}
