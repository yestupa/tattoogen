import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { apiGet, apiPost } from '@/lib/api-client';
import { getDiscountDisplayName } from '@/lib/discount-label';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';
import {
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

const ALL_PROVIDERS: PaymentProvider[] = [
  'stripe',
  'creem',
  'paypal',
  'alipay',
  'wechat',
];

interface TierConfig {
  key: string;
  name: string;
  tagline: string;
  cta: string;
  popular?: boolean;
}

type PublicPricingProduct = {
  productId: string;
  productName: string;
  planName: string;
  basePriceInCents: number;
  priceInCents: number;
  currency: string;
  credits: number;
  creditsValidDays?: number;
  plan?: { name: string; interval: string; intervalCount: number };
  discount: {
    percentage: number;
    displayNameEn: string;
    displayNameZh: string;
  } | null;
};

/** Same for every tier — only the price and the credit grant differ. */
function sharedFeatures(): string[] {
  return [
    m['landing.pricing.feature_generation'](),
    m['landing.pricing.feature_models'](),
    m['landing.pricing.feature_license'](),
  ];
}

function getTiers(): TierConfig[] {
  return [
    {
      key: 'lite',
      name: m['landing.pricing.lite_name'](),
      tagline: m['landing.pricing.lite_tagline'](),
      cta: m['landing.pricing.lite_cta'](),
    },
    {
      key: 'pro',
      name: m['landing.pricing.pro_name'](),
      tagline: m['landing.pricing.pro_tagline'](),
      cta: m['landing.pricing.pro_cta'](),
      popular: true,
    },
    {
      key: 'ultra',
      name: m['landing.pricing.ultra_name'](),
      tagline: m['landing.pricing.ultra_tagline'](),
      cta: m['landing.pricing.ultra_cta'](),
    },
  ];
}

function buildPlans(
  tiers: TierConfig[],
  intervalSuffix: 'monthly' | 'yearly',
  products: PublicPricingProduct[]
): PricingPlan[] {
  const yearly = intervalSuffix === 'yearly';

  return tiers.flatMap((tier) => {
    const product = products.find(
      (item) => item.productId === `${tier.key}_${intervalSuffix}`
    );
    if (!product) return [];
    const divisor = yearly ? 12 : 1;
    const displayed = product.priceInCents / 100 / divisor;
    const displayedBase = product.basePriceInCents / 100 / divisor;
    const money = (value: number) => `$${Number(value.toFixed(2))}`;

    return {
      id: `${tier.key}-${intervalSuffix}`,
      name: tier.name,
      description: tier.tagline,
      price: money(displayed),
      originalPrice:
        product.basePriceInCents !== product.priceInCents
          ? money(displayedBase)
          : undefined,
      priceNote: yearly
        ? m['landing.pricing.billed_yearly']({
            total: money(product.priceInCents / 100),
          })
        : undefined,
      interval: m['landing.pricing.interval_month'](),
      featured: !!tier.popular,
      badge: product.discount
        ? `${getDiscountDisplayName(product.discount, getLocale())} · ${m[
            'landing.pricing.save_percent'
          ]({
            percent: product.discount.percentage,
          })}`
        : tier.popular
          ? m['landing.pricing.popular']()
          : undefined,
      features: [
        yearly
          ? m['landing.pricing.credits_yearly']({
              credits: product.credits.toLocaleString(),
            })
          : m['landing.pricing.credits_monthly']({
              credits: product.credits.toLocaleString(),
            }),
        ...sharedFeatures(),
      ],
      buttonText: tier.cta,
      productId: product.productId,
      priceInCents: product.priceInCents,
      currency: product.currency,
      credits: product.credits,
      creditsValidDays: product.creditsValidDays,
      plan: product.plan,
    } satisfies PricingPlan;
  });
}

export function Pricing({
  title,
  compact = false,
  redirect,
}: {
  title?: string;
  /** Drop the section chrome (heading + page padding) when embedded. */
  compact?: boolean;
  /** Same-origin path to land on after a successful payment. */
  redirect?: string;
} = {}) {
  const router = useRouter();
  const { data: session } = useSession();

  // Same cache entry the sidebar and the credits page use, so the plan the
  // viewer already pays for is known without another request.
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', 'current'],
    queryFn: () =>
      apiGet<{ productId?: string | null } | null>(
        '/api/user/subscriptions/current'
      ),
    enabled: Boolean(session?.user),
  });

  const { data: configsData } = usePublicConfig();
  const pricingQuery = useQuery({
    queryKey: ['public-pricing'],
    queryFn: () => apiGet<PublicPricingProduct[]>('/api/pricing'),
  });
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );

  const tiers = getTiers();
  const products = pricingQuery.data ?? [];
  const yearlySavings = tiers.map((tier) => {
    const monthly = products.find(
      (item) => item.productId === `${tier.key}_monthly`
    );
    const yearly = products.find(
      (item) => item.productId === `${tier.key}_yearly`
    );
    if (!monthly || !yearly || monthly.priceInCents <= 0) return 0;
    return Math.round(
      (1 - yearly.priceInCents / 12 / monthly.priceInCents) * 100
    );
  });

  const groups: PricingGroup[] = [
    {
      key: 'monthly',
      label: m['landing.pricing.monthly'](),
      plans: buildPlans(tiers, 'monthly', products),
    },
    {
      key: 'yearly',
      label: m['landing.pricing.yearly'](),
      // The best discount on offer — tiers differ, so it's "up to".
      badge: m['landing.pricing.save_up_to']({
        percent: Math.max(0, ...yearlySavings),
      }),
      plans: buildPlans(tiers, 'yearly', products),
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
        redirect,
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error(m['landing.pricing.checkout_failed']());
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || m['landing.pricing.checkout_failed']());
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider: PaymentProvider) {
    setLoadingProvider(provider);
    checkoutMutation.mutate({ plan, provider });
  }

  async function handleCheckout(plan: PricingPlan) {
    // Free tier — no checkout, just funnel to sign-up.
    if (!plan.productId || !plan.priceInCents) {
      router.push('/sign-up');
      return;
    }

    if (!session?.user) {
      const redirect = encodeURIComponent(
        typeof window !== 'undefined' ? window.location.pathname : '/pricing'
      );
      router.push(`/sign-in?redirect=${redirect}`);
      return;
    }

    const selectEnabled = configs.select_payment_enabled === 'true';
    const defaultProvider = (configs.default_payment_provider ||
      enabledProviders[0] ||
      'stripe') as PaymentProvider;

    if (selectEnabled && enabledProviders.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    await startCheckout(plan, defaultProvider);
  }

  function handleProviderSelect(provider: PaymentProvider) {
    if (!pendingPlan) return;
    startCheckout(pendingPlan, provider);
  }

  const table = (
    /* Yearly is the better deal, so it's what the page opens on. */
    <PricingTable
      groups={groups}
      defaultGroup="yearly"
      currentProductId={subscription?.productId}
      onCheckout={handleCheckout}
    />
  );

  const providerModal = (
    <PaymentProviderModal
      open={modalOpen}
      onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) {
          setPendingPlan(null);
          setLoadingProvider(null);
        }
      }}
      providers={enabledProviders.length ? enabledProviders : ['stripe']}
      loadingProvider={loadingProvider}
      onSelect={handleProviderSelect}
      planName={pendingPlan?.name}
      price={pendingPlan?.price}
    />
  );

  if (compact) {
    return (
      <>
        {table}
        {providerModal}
      </>
    );
  }

  return (
    <section id="pricing" className="section-paper px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell">
        <div className="text-center">
          <p className="eyebrow-vermilion">{m['landing.pricing.eyebrow']()}</p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {title ?? m['landing.pricing.title']()}
          </h2>
          <p className="text-paper-muted mx-auto mt-5 max-w-xl text-base leading-7 sm:text-lg">
            {m['landing.pricing.description']()}
          </p>
        </div>
        <div className="mt-12">{table}</div>
      </div>
      {providerModal}
    </section>
  );
}
