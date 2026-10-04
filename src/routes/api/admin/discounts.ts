import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { getAuth } from '@/core/auth';
import {
  findDiscountOverlaps,
  listDiscounts,
  removeDiscount,
  saveDiscount,
} from '@/modules/commerce/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr, respOk } from '@/lib/resp';

const discountInput = z.object({
  id: z.string().optional(),
  internalName: z.string().trim().min(1).max(191),
  displayNameEn: z.string().trim().min(1).max(191),
  displayNameZh: z.string().trim().max(191).optional(),
  percentage: z.number().int().min(1).max(99),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  enabled: z.boolean(),
  productIds: z.array(z.string().min(1)).min(1).max(20),
});

async function requireAdmin(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) throw new Error('Unauthorized');
  if (!(await hasPermission(session.user.id, 'admin.*'))) {
    throw new Error('Forbidden');
  }
  return session.user;
}

async function GET({ request }: { request: Request }) {
  try {
    await requireAdmin(request);
    return respData(await listDiscounts());
  } catch (error: any) {
    return respErr(error.message || 'Unable to load discounts');
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const actor = await requireAdmin(request);
    const input = discountInput.parse(await request.json());
    const overlaps = await findDiscountOverlaps(input);
    const id = await saveDiscount(input, actor.id);
    return respData({ id, overlaps });
  } catch (error: any) {
    return respErr(error.message || 'Unable to save discount');
  }
}

async function DELETE({ request }: { request: Request }) {
  try {
    await requireAdmin(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return respErr('Discount ID is required');
    await removeDiscount(id);
    return respOk();
  } catch (error: any) {
    return respErr(error.message || 'Unable to delete discount');
  }
}

export const Route = createFileRoute('/api/admin/discounts')({
  server: { handlers: { GET, POST, DELETE } },
});
