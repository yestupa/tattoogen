import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Coins } from 'lucide-react';
import { toast } from 'sonner';

import { apiGet, apiPost } from '@/lib/api-client';
import { getDiscountDisplayName } from '@/lib/discount-label';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CheckoutResponse {
  checkout_url?: string;
}

interface TopUpProduct {
  productId: string;
  priceInCents: number;
  basePriceInCents: number;
  credits: number;
  requiresSubscription?: boolean;
  discount: {
    percentage: number;
    displayNameEn: string;
    displayNameZh: string;
  } | null;
}

/**
 * Buy extra credits on top of a plan. The packs come from the same
 * authoritative catalog the checkout API validates against, so the amounts
 * shown here are the amounts granted.
 */
export function CreditTopUpDialog({
  open,
  onOpenChange,
  redirect = '/settings/credits',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where checkout lands afterwards — a chat top-up returns to the chat. */
  redirect?: string;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const productsQuery = useQuery({
    queryKey: ['public-pricing'],
    queryFn: () => apiGet<TopUpProduct[]>('/api/pricing'),
  });
  const creditTopUps = (productsQuery.data ?? []).filter(
    (item) => item.requiresSubscription
  );

  const checkout = useMutation({
    mutationFn: (productId: string) =>
      apiPost<CheckoutResponse>('/api/payment/checkout', {
        product_id: productId,
        redirect,
      }),
    onSuccess: (data) => {
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setPendingId(null);
      toast.error(m['settings.credits.topup_failed']());
    },
    onError: (error: Error) => {
      setPendingId(null);
      toast.error(error.message || m['settings.credits.topup_failed']());
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m['settings.credits.topup_title']()}</DialogTitle>
          <DialogDescription>
            {m['settings.credits.topup_description']()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {creditTopUps.map((pack) => (
            <div
              key={pack.productId}
              className="border-border flex items-center gap-3 rounded-lg border p-4"
            >
              <Coins className="text-muted-foreground size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  ${(pack.priceInCents / 100).toLocaleString()}
                </p>
                {pack.basePriceInCents !== pack.priceInCents && (
                  <p className="text-muted-foreground text-xs line-through">
                    ${(pack.basePriceInCents / 100).toLocaleString()}
                  </p>
                )}
                {pack.discount && (
                  <p className="text-primary text-xs font-medium">
                    {getDiscountDisplayName(pack.discount, getLocale())} ·{' '}
                    {m['landing.pricing.save_percent']({
                      percent: pack.discount.percentage,
                    })}
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  {m['settings.credits.topup_credits']({
                    credits: pack.credits.toLocaleString(),
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={checkout.isPending}
                onClick={() => {
                  setPendingId(pack.productId);
                  checkout.mutate(pack.productId);
                }}
              >
                {pendingId === pack.productId
                  ? m['common.pricing.processing']()
                  : m['settings.credits.topup_action']()}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-xs">
          {m['settings.credits.topup_note']()}
        </p>
      </DialogContent>
    </Dialog>
  );
}
