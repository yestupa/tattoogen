import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { apiDelete, apiGet, apiPost } from '@/lib/api-client';
import { formatDateTime } from '@/lib/time';
import { m } from '@/paraglide/messages.js';
import { PageHeading } from '@/components/page-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Product = { productId: string; productName: string; description: string };
type Discount = {
  id: string;
  internalName: string;
  displayNameEn: string;
  displayNameZh: string;
  percentage: number;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
  productIds: string[];
};
type FormState = Omit<Discount, 'id' | 'startsAt' | 'endsAt'> & {
  id?: string;
  startsAt: string;
  endsAt: string;
};

function toLocalInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function emptyDiscount(): FormState {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 86_400_000);
  return {
    internalName: '',
    displayNameEn: '',
    displayNameZh: '',
    percentage: 20,
    startsAt: toLocalInput(start),
    endsAt: toLocalInput(end),
    enabled: true,
    productIds: [],
  };
}

function AdminDiscountsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<Discount | null>(null);
  const productsQuery = useQuery({
    queryKey: ['admin-pricing'],
    queryFn: () => apiGet<Product[]>('/api/admin/pricing'),
  });
  const discountsQuery = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => apiGet<Discount[]>('/api/admin/discounts'),
  });
  const products = productsQuery.data ?? [];
  const discounts = discountsQuery.data ?? [];

  const save = useMutation({
    mutationFn: (value: FormState) =>
      apiPost<{ overlaps: string[] }>('/api/admin/discounts', {
        ...value,
        percentage: Number(value.percentage),
        startsAt: new Date(value.startsAt).toISOString(),
        endsAt: new Date(value.endsAt).toISOString(),
      }),
    onSuccess: (result) => {
      toast.success(
        result.overlaps.length
          ? m['admin.discounts.saved_overlap']({
              count: result.overlaps.length,
            })
          : m['admin.discounts.saved']()
      );
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['public-pricing'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/api/admin/discounts?id=${encodeURIComponent(id)}`),
    onSuccess: () => {
      setDeleting(null);
      toast.success(m['admin.discounts.deleted']());
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const now = Date.now();
  const rows = useMemo(
    () =>
      discounts.map((item) => ({
        ...item,
        state: !item.enabled
          ? 'disabled'
          : new Date(item.endsAt).getTime() <= now
            ? 'expired'
            : new Date(item.startsAt).getTime() > now
              ? 'upcoming'
              : 'active',
      })),
    [discounts, now]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        title={m['admin.discounts.title']()}
        description={m['admin.discounts.description']()}
        action={
          <Button onClick={() => setEditing(emptyDiscount())}>
            <Plus className="size-4" />
            {m['admin.discounts.create']()}
          </Button>
        }
      />
      <div className="grid gap-4">
        {rows.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl">{item.displayNameEn}</h2>
                  <Badge
                    variant={item.state === 'active' ? 'default' : 'secondary'}
                  >
                    {m[
                      `admin.discounts.state_${item.state}` as keyof typeof m
                    ]?.() ?? item.state}
                  </Badge>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.internalName}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {formatDateTime(item.startsAt)} –{' '}
                  {formatDateTime(item.endsAt)}
                </p>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {item.productIds.join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setEditing({
                      ...item,
                      startsAt: toLocalInput(new Date(item.startsAt)),
                      endsAt: toLocalInput(new Date(item.endsAt)),
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center">
              {m['admin.discounts.empty']()}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.id
                ? m['admin.discounts.edit']()
                : m['admin.discounts.create']()}
            </DialogTitle>
            <DialogDescription>
              {m['admin.discounts.form_description']()}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{m['admin.discounts.internal_name']()}</Label>
                <Input
                  value={editing.internalName}
                  onChange={(e) =>
                    setEditing({ ...editing, internalName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{m['admin.discounts.percentage']()}</Label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={editing.percentage}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      percentage: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{m['admin.discounts.display_name_en']()}</Label>
                <Input
                  value={editing.displayNameEn}
                  onChange={(e) =>
                    setEditing({ ...editing, displayNameEn: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{m['admin.discounts.display_name_zh']()}</Label>
                <Input
                  value={editing.displayNameZh}
                  onChange={(e) =>
                    setEditing({ ...editing, displayNameZh: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{m['admin.discounts.starts_at']()}</Label>
                <Input
                  type="datetime-local"
                  value={editing.startsAt}
                  onChange={(e) =>
                    setEditing({ ...editing, startsAt: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{m['admin.discounts.ends_at']()}</Label>
                <Input
                  type="datetime-local"
                  value={editing.endsAt}
                  onChange={(e) =>
                    setEditing({ ...editing, endsAt: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3 sm:col-span-2">
                <Label>{m['admin.discounts.products']()}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {products.map((product) => (
                    <label
                      key={product.productId}
                      className="border-border flex items-center gap-3 rounded-xl border p-3"
                    >
                      <Checkbox
                        checked={editing.productIds.includes(product.productId)}
                        onCheckedChange={(checked) =>
                          setEditing({
                            ...editing,
                            productIds: checked
                              ? [...editing.productIds, product.productId]
                              : editing.productIds.filter(
                                  (id) => id !== product.productId
                                ),
                          })
                        }
                      />
                      <span className="text-sm">
                        {product.productName}
                        <span className="text-muted-foreground ml-2 font-mono text-xs">
                          {product.productId}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  checked={editing.enabled}
                  onCheckedChange={(enabled) =>
                    setEditing({ ...editing, enabled })
                  }
                />
                <span className="text-sm font-medium">
                  {m['admin.discounts.enabled']()}
                </span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {m['common.action.cancel']()}
            </Button>
            <Button
              disabled={save.isPending}
              onClick={() => editing && save.mutate(editing)}
            >
              {m['common.action.save']()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m['admin.discounts.delete_title']()}</DialogTitle>
            <DialogDescription>
              {m['admin.discounts.delete_description']()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {m['common.action.cancel']()}
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting.id)}
            >
              {m['common.action.delete']()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/discounts')({
  component: AdminDiscountsPage,
});
