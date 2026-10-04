import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { getAuth } from '@/core/auth';
import {
  listEffectiveProducts,
  savePricingOverride,
} from '@/modules/commerce/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr } from '@/lib/resp';

const pricingInput = z.object({
  productId: z.string().min(1),
  priceInCents: z.number().int().positive(),
  credits: z.number().int().positive(),
  creditsValidDays: z.number().int().positive(),
  enabled: z.boolean(),
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
    return respData(await listEffectiveProducts());
  } catch (error: any) {
    return respErr(error.message || 'Unable to load pricing');
  }
}

async function PUT({ request }: { request: Request }) {
  try {
    const actor = await requireAdmin(request);
    const input = pricingInput.parse(await request.json());
    await savePricingOverride(input, actor.id);
    return respData(await listEffectiveProducts());
  } catch (error: any) {
    return respErr(error.message || 'Unable to save pricing');
  }
}

export const Route = createFileRoute('/api/admin/pricing')({
  server: { handlers: { GET, PUT } },
});
