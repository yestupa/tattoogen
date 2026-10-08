import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { PageState } from '@/components/page-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  emptyText?: string;
  rowKey: (row: T) => string;
  onRefresh?: () => void | Promise<unknown>;
  loading?: boolean;
  error?: string;
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder,
  toolbar,
  emptyText,
  rowKey,
  onRefresh,
  loading,
  error,
}: DataTableProps<T>) {
  const [refreshing, setRefreshing] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Adapt the simple Column<T> shape to react-table column defs. Server-side
  // pagination stays fully controlled by the page/total props.
  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col, i) => ({
        id: String(i),
        header: () => col.header,
        cell: ({ row }) => col.cell(row.original),
        meta: { className: col.className },
      })),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    getRowId: (row) => rowKey(row),
  });

  async function handleRefresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  const showHeader = onSearchChange || toolbar || onRefresh;
  const busy = refreshing || loading;

  return (
    <div
      className="paper-ui border-paper-line bg-paper-panel min-w-0 space-y-4 rounded-2xl border p-3 shadow-[0_18px_54px_-44px_rgba(17,17,16,0.6)] sm:p-4"
      aria-busy={busy || undefined}
    >
      {showHeader && (
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {onSearchChange && (
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <Search
                className="text-muted-foreground absolute top-3.5 left-3 size-4"
                aria-hidden="true"
              />
              <Input
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  searchPlaceholder || m['common.search.placeholder']()
                }
                aria-label={
                  searchPlaceholder || m['common.search.placeholder']()
                }
                className="focus-visible:ring-primary/40 min-h-11 pl-9"
              />
            </div>
          )}
          {toolbar}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              className="focus-visible:ring-primary/40 ml-auto size-11 rounded-xl"
              onClick={handleRefresh}
              disabled={busy}
              aria-label={m['common.table.refresh']()}
            >
              <RefreshCw className={cn('size-4', busy && 'animate-spin')} />
            </Button>
          )}
        </div>
      )}

      {error && data.length > 0 && !busy && (
        <div
          role="alert"
          aria-live="polite"
          className="border-destructive/30 bg-destructive/5 text-destructive space-y-1 rounded-xl border p-3 text-sm wrap-anywhere"
        >
          <p className="font-medium">
            {m['common.table.refresh']()} · {m['common.error.message']()}
          </p>
          <p>{error}</p>
        </div>
      )}

      <div className="border-paper-line min-w-0 overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader className="bg-paper-bg/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      (header.column.columnDef.meta as { className?: string })
                        ?.className
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && table.getRowModel().rows.length === 0 ? (
              Array.from({ length: Math.min(pageSize, 5) }, (_, index) => (
                <TableRow key={index} data-table-skeleton aria-hidden="true">
                  {columns.map((_, column) => (
                    <TableCell key={column}>
                      <div className="bg-primary/10 h-4 min-w-20 rounded-full motion-safe:animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="p-0 whitespace-normal"
                >
                  <PageState
                    variant={error ? 'error' : 'empty'}
                    title={emptyText || m['common.table.no_data']()}
                    description={
                      error || m['common.table.total']({ count: total })
                    }
                    headingLevel={2}
                    className="max-w-none rounded-none border-0 py-10 shadow-none sm:py-12 [&_h2]:text-xl"
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="focus-within:bg-vermilion/5 data-[state=selected]:bg-vermilion/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        (cell.column.columnDef.meta as { className?: string })
                          ?.className
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-muted-foreground text-sm">
          {m['common.table.total']({ count: total })}
        </p>
        {total > pageSize && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="focus-visible:ring-primary/40 min-h-11"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              {m['common.table.previous']()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="focus-visible:ring-primary/40 min-h-11"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              {m['common.table.next']()}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
