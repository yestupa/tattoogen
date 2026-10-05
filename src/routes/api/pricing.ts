import { createFileRoute } from '@tanstack/react-router';

import { listEffectiveProducts } from '@/modules/commerce/service';
import { respData, respErr } from '@/lib/resp';

async function GET() {
  try {
    const products = (await listEffectiveProducts())
      .filter((item) => item.enabled)
      .map((item) => ({
        productId: item.productId,
        productName: item.productName,
        planName: item.planName,
        description: item.description,
        type: item.type,
        basePriceInCents: item.basePriceInCents,
        priceInCents: item.priceInCents,
        currency: item.currency,
        credits: item.credits,
        creditsValidDays: item.creditsValidDays,
        requiresSubscription: item.requiresSubscription,
        plan: item.plan,
        discount: item.discount
          ? {
              displayNameEn: item.discount.displayNameEn,
              displayNameZh: item.discount.displayNameZh,
              percentage: item.discount.percentage,
              endsAt: item.discount.endsAt,
            }
          : null,
      }));
    return respData(products, {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch {
    return respErr('Unable to load pricing');
  }
}

export const Route = createFileRoute('/api/pricing')({
  server: { handlers: { GET } },
});
