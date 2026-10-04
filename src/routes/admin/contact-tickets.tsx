import { useEffect, useState } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { tDynamic } from '@/core/i18n/dynamic';
import { apiGet, apiPatch, apiPost, type PageResult } from '@/lib/api-client';
import { formatDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeading } from '@/components/page-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type Status = 'open' | 'replied' | 'closed';
type Tab = 'all' | Status;

interface ContactTicketRow {
  id: string;
  requesterName: string;
  requesterEmail: string;
  category: string;
  subject: string;
  status: Status;
  locale: string;
  createdAt: string;
  updatedAt: string;
  latestMessage: string | null;
}

interface ContactMessageRow {
  id: string;
  role: 'requester' | 'admin';
  content: string;
  createdAt: string;
}

const PAGE_SIZE = 20;
const TABS: Tab[] = ['all', 'open', 'replied', 'closed'];
const STATUS_BADGE: Record<Status, 'default' | 'secondary' | 'outline'> = {
  open: 'default',
  replied: 'secondary',
  closed: 'outline',
};

function AdminContactTicketsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTicket, setActiveTicket] = useState<ContactTicketRow | null>(
    null
  );
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setPage(1), [tab, debouncedSearch]);

  const listQuery = useQuery({
    queryKey: ['admin-contact-tickets', page, tab, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (tab !== 'all') params.set('status', tab);
      if (debouncedSearch) params.set('keyword', debouncedSearch);
      return apiGet<PageResult<ContactTicketRow>>(
        `/api/admin/contact-tickets?${params}`
      );
    },
    placeholderData: keepPreviousData,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-contact-tickets'] });

  async function openDetail(row: ContactTicketRow) {
    try {
      const data = await apiGet<{
        ticket: ContactTicketRow;
        messages: ContactMessageRow[];
      }>(`/api/admin/contact-tickets/${row.id}`);
      setActiveTicket({ ...row, ...data.ticket });
      setMessages(data.messages);
      setReply('');
    } catch (error: any) {
      toast.error(error?.message || m['common.action.failed']());
    }
  }

  async function submitReply() {
    if (!activeTicket || !reply.trim()) return;
    setReplying(true);
    try {
      await apiPost(`/api/admin/contact-tickets/${activeTicket.id}`, {
        content: reply,
      });
      toast.success(m['admin.contact_tickets.reply_saved']());
      await openDetail(activeTicket);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || m['common.action.failed']());
    } finally {
      setReplying(false);
    }
  }

  async function setStatus(status: Status) {
    if (!activeTicket) return;
    try {
      await apiPatch(`/api/admin/contact-tickets/${activeTicket.id}`, {
        status,
      });
      setActiveTicket({ ...activeTicket, status });
      toast.success(m['admin.contact_tickets.status_saved']());
      refresh();
    } catch (error: any) {
      toast.error(error?.message || m['common.action.failed']());
    }
  }

  const columns: Column<ContactTicketRow>[] = [
    {
      header: m['admin.contact_tickets.created'](),
      className: 'w-[160px]',
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: m['admin.contact_tickets.subject'](),
      cell: (row) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => openDetail(row)}
        >
          {row.subject}
        </button>
      ),
    },
    {
      header: m['admin.contact_tickets.requester'](),
      cell: (row) => (
        <div className="flex flex-col">
          <span>{row.requesterName}</span>
          <span className="text-muted-foreground text-xs">
            {row.requesterEmail}
          </span>
        </div>
      ),
    },
    {
      header: m['admin.contact_tickets.category'](),
      className: 'w-[110px]',
      cell: (row) => <Badge variant="outline">{row.category}</Badge>,
    },
    {
      header: m['admin.contact_tickets.status'](),
      className: 'w-[110px]',
      cell: (row) => (
        <Badge variant={STATUS_BADGE[row.status]}>
          {tDynamic(`admin.contact_tickets.status_${row.status}`)}
        </Badge>
      ),
    },
    {
      header: m['admin.contact_tickets.action'](),
      className: 'w-[70px]',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={m['admin.contact_tickets.open']()}
          onClick={() => openDetail(row)}
        >
          <MessageSquare className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        className="[&_h1]:text-3xl [&_h1]:sm:text-3xl"
        title={m['admin.contact_tickets.title']()}
        description={m['admin.contact_tickets.description']()}
      />

      <div className="border-border flex gap-1 overflow-x-auto border-b">
        {TABS.map((item) => (
          <button
            key={item}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap',
              tab === item
                ? 'border-primary text-foreground'
                : 'text-muted-foreground border-transparent'
            )}
            onClick={() => setTab(item)}
          >
            {tDynamic(`admin.contact_tickets.tab_${item}`)}
          </button>
        ))}
      </div>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={listQuery.data?.items ?? []}
            total={listQuery.data?.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            rowKey={(row) => row.id}
            emptyText={m['admin.contact_tickets.empty']()}
            search={search}
            onSearchChange={setSearch}
            onRefresh={() => listQuery.refetch()}
            loading={listQuery.isFetching}
            error={listQuery.error?.message}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!activeTicket}
        onOpenChange={(open) => !open && setActiveTicket(null)}
      >
        <DialogContent className="rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeTicket?.subject}</DialogTitle>
            {activeTicket && (
              <p className="text-muted-foreground text-sm">
                {activeTicket.requesterName} · {activeTicket.requesterEmail} ·{' '}
                {activeTicket.category} · {activeTicket.locale.toUpperCase()}
              </p>
            )}
          </DialogHeader>

          <div className="max-h-[50vh] space-y-3 overflow-y-auto py-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'rounded-xl p-3 text-sm',
                  message.role === 'admin'
                    ? 'bg-primary/10 ml-8'
                    : 'bg-muted mr-8'
                )}
              >
                <div className="mb-1 flex justify-between gap-4 text-xs">
                  <span className="font-medium">
                    {message.role === 'admin'
                      ? m['admin.contact_tickets.admin_note']()
                      : activeTicket?.requesterName}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDateTime(message.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>

          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitReply();
            }}
          >
            {activeTicket?.status !== 'closed' && (
              <Textarea
                value={reply}
                maxLength={5000}
                rows={3}
                onChange={(event) => setReply(event.target.value)}
                placeholder={m['admin.contact_tickets.note_placeholder']()}
              />
            )}
            <DialogFooter>
              {activeTicket?.status === 'closed' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStatus('open')}
                >
                  {m['admin.contact_tickets.reopen']()}
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatus('closed')}
                  >
                    {m['admin.contact_tickets.close']()}
                  </Button>
                  <Button type="submit" disabled={replying || !reply.trim()}>
                    {replying
                      ? m['admin.contact_tickets.saving']()
                      : m['admin.contact_tickets.save_note']()}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/contact-tickets')({
  component: AdminContactTicketsPage,
});
