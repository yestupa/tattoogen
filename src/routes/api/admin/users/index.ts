import { createFileRoute } from '@tanstack/react-router';
import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';

import { getAuth } from '@/core/auth';
import { db } from '@/core/db';
import { user } from '@/config/db/schema';
import { getBalance } from '@/modules/credits/service';
import { getUserRoles, hasPermission } from '@/modules/rbac/service';
import {
  deleteOrdinaryUser,
  validateUserDeletion,
} from '@/modules/users/deletion';
import { respErr, respOk, respPage } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const isAdmin = await hasPermission(session.user.id, 'admin.*');
    if (!isAdmin) return respErr('Forbidden');

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || '20'))
    );
    const offset = (page - 1) * pageSize;
    const search = searchParams.get('search');

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(
        or(like(user.email, `%${search}%`), like(user.name, `%${search}%`))!
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db()
      .select({ count: count() })
      .from(user)
      .where(where);
    const total = totalResult.count;

    const users = await db()
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        utmSource: user.utmSource,
        ip: user.ip,
      })
      .from(user)
      .where(where)
      .orderBy(desc(user.createdAt))
      .limit(pageSize)
      .offset(offset);

    const withCredits = await Promise.all(
      users.map(async (u: (typeof users)[number]) => ({
        ...u,
        credits: await getBalance(u.id),
      }))
    );

    return respPage(withCredits, total);
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

async function DELETE({ request }: { request: Request }) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Unauthorized');
    if (!(await hasPermission(session.user.id, 'admin.*'))) {
      return respErr('Forbidden');
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('id')?.trim() || '';
    const confirmationEmail = searchParams.get('email')?.trim() || '';
    if (!targetId || !confirmationEmail) {
      return respErr('User ID and email confirmation are required');
    }

    const [target] = await db()
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.id, targetId))
      .limit(1);
    if (!target) return respErr('User not found');

    const [actorRoles, targetRoles] = await Promise.all([
      getUserRoles(session.user.id),
      getUserRoles(targetId),
    ]);
    const policyError = validateUserDeletion({
      actorId: session.user.id,
      targetId,
      actorRoles: actorRoles.map((item: { roleName: string }) => item.roleName),
      targetRoles: targetRoles.map(
        (item: { roleName: string }) => item.roleName
      ),
      confirmationEmail,
      targetEmail: target.email,
    });
    if (policyError) return respErr(policyError);

    await deleteOrdinaryUser(targetId);
    return respOk();
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/admin/users/')({
  server: {
    handlers: { GET, DELETE },
  },
});
