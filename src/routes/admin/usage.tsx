import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { apiGet } from '@/lib/api-client';
import { formatDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeading } from '@/components/page-heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface UsageRow {
  userId: string;
  name: string;
  email: string;
  fastClawUserId: string | null;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  requestCount: number;
  totalTokens: number;
  fetchedAt: string | null;
  stale: boolean;
  status: 'ready' | 'unused' | 'unavailable' | 'error';
}

interface UsageResult {
  items: UsageRow[];
  total: number;
  configured: boolean;
  days: number;
}

const PAGE_SIZE = 20;
const WINDOWS = [7, 30, 90] as const;

function AdminUsagePage() {
  const [page, setPage] = useState(1);
  const [days, setDays] = useState<number>(30);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setPage(1), [days, debouncedSearch]);

  const query = useQuery({
    queryKey: ['admin-fastclaw-usage', page, days, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        days: String(days),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      return apiGet<UsageResult>(`/api/admin/usage?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const columns: Column<UsageRow>[] = [
    {
      header: m['admin.usage.user'](),
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.name || '—'}</span>
          <span className="text-muted-foreground text-xs">{row.email}</span>
        </div>
      ),
    },
    {
      header: m['admin.usage.total_tokens'](),
      className: 'w-[140px]',
      cell: (row) => (
        <span className="font-medium tabular-nums">
          {row.totalTokens.toLocaleString()}
        </span>
      ),
    },
    {
      header: m['admin.usage.input_tokens'](),
      className: 'w-[130px]',
      cell: (row) => row.inputTokens.toLocaleString(),
    },
    {
      header: m['admin.usage.output_tokens'](),
      className: 'w-[130px]',
      cell: (row) => row.outputTokens.toLocaleString(),
    },
    {
      header: m['admin.usage.requests'](),
      className: 'w-[100px]',
      cell: (row) => row.requestCount.toLocaleString(),
    },
    {
      header: m['admin.usage.status'](),
      className: 'w-[150px]',
      cell: (row) => (
        <div className="space-y-1">
          <Badge variant={row.status === 'ready' ? 'secondary' : 'outline'}>
            {row.status === 'ready'
              ? row.stale
                ? m['admin.usage.stale']()
                : m['admin.usage.synced']()
              : row.status === 'unused'
                ? m['admin.usage.unused']()
                : row.status === 'error'
                  ? m['admin.usage.error']()
                  : m['admin.usage.unavailable']()}
          </Badge>
          {row.fetchedAt && (
            <p className="text-muted-foreground text-xs">
              {formatDateTime(row.fetchedAt)}
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        className="[&_h1]:text-3xl [&_h1]:sm:text-3xl"
        title={m['admin.usage.title']()}
        description={m['admin.usage.description']()}
      />

      {query.data && !query.data.configured && (
        <div className="border-border bg-muted/40 rounded-xl border p-4 text-sm">
          {m['admin.usage.not_configured']()}
        </div>
      )}

      <div className="border-border flex gap-1 overflow-x-auto border-b">
        {WINDOWS.map((windowDays) => (
          <button
            key={windowDays}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap',
              days === windowDays
                ? 'border-primary text-foreground'
                : 'text-muted-foreground border-transparent'
            )}
            onClick={() => setDays(windowDays)}
          >
            {m['admin.usage.days']({ days: windowDays })}
          </button>
        ))}
      </div>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={query.data?.items ?? []}
            total={query.data?.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            rowKey={(row) => row.userId}
            emptyText={m['admin.usage.empty']()}
            search={search}
            onSearchChange={setSearch}
            onRefresh={() => query.refetch()}
            loading={query.isFetching}
            error={query.error?.message}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/admin/usage')({
  component: AdminUsagePage,
});
