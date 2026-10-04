import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { listFastClawUserUsage } from '@/modules/agent/usage';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Unauthorized');
    if (!(await hasPermission(session.user.id, 'admin.*'))) {
      return respErr('Forbidden');
    }

    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days'));
    const result = await listFastClawUserUsage({
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: Math.min(
        50,
        Math.max(1, Number(searchParams.get('pageSize')) || 20)
      ),
      search: searchParams.get('search')?.trim() || undefined,
      days: [7, 30, 90].includes(days) ? days : 30,
      force: searchParams.get('refresh') === '1',
    });
    return respData(result);
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/admin/usage')({
  server: { handlers: { GET } },
});
