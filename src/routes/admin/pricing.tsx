import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { apiGet, apiPut } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { PageHeading } from '@/components/page-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type PricingProduct = {
  productId: string;
  productName: string;
  description: string;
  basePriceInCents: number;
  priceInCents: number;
  credits: number;
  creditsValidDays: number;
  enabled: boolean;
  discount: { percentage: number; displayNameEn: string } | null;
};

function PricingRow({ product }: { product: PricingProduct }) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState(String(product.basePriceInCents / 100));
  const [credits, setCredits] = useState(String(product.credits));
  const [days, setDays] = useState(String(product.creditsValidDays));
  const [enabled, setEnabled] = useState(product.enabled);

  useEffect(() => {
    setPrice(String(product.basePriceInCents / 100));
    setCredits(String(product.credits));
    setDays(String(product.creditsValidDays));
    setEnabled(product.enabled);
  }, [product]);

  const save = useMutation({
    mutationFn: () =>
      apiPut('/api/admin/pricing', {
        productId: product.productId,
        priceInCents: Math.round(Number(price) * 100),
        credits: Number(credits),
        creditsValidDays: Number(days),
        enabled,
      }),
    onSuccess: () => {
      toast.success(m['admin.pricing.saved']());
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['public-pricing'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="font-serif text-xl">
            {product.productName}
          </CardTitle>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {product.productId}
          </p>
        </div>
        {product.discount && (
          <Badge>
            {m['admin.pricing.discount_active']({
              percent: product.discount.percentage,
            })}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label>{m['admin.pricing.price']()}</Label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{m['admin.pricing.credits']()}</Label>
          <Input
            type="number"
            min="1"
            step="1"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{m['admin.pricing.valid_days']()}</Label>
          <Input
            type="number"
            min="1"
            step="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-3 pb-2">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <Label>{m['admin.pricing.enabled']()}</Label>
        </div>
        <div className="flex items-end">
          <Button
            className="w-full"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            <Save className="size-4" />
            {m['admin.pricing.save']()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminPricingPage() {
  const pricing = useQuery({
    queryKey: ['admin-pricing'],
    queryFn: () => apiGet<PricingProduct[]>('/api/admin/pricing'),
  });
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        title={m['admin.pricing.title']()}
        description={m['admin.pricing.description']()}
      />
      <div className="space-y-4">
        {(pricing.data ?? []).map((product) => (
          <PricingRow key={product.productId} product={product} />
        ))}
      </div>
      {pricing.error && (
        <p className="text-destructive text-sm">{pricing.error.message}</p>
      )}
    </div>
  );
}

export const Route = createFileRoute('/admin/pricing')({
  component: AdminPricingPage,
});
