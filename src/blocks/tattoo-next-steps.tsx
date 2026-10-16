import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { RelatedLinks } from '@/components/tattoo/related-links';
import { tattooNextSteps } from '@/content/tattoos/navigation';

export function TattooNextSteps({ context = '' }: { context?: string }) {
  const locale = getLocale();
  return (
    <RelatedLinks
      heading={m['discovery.next.heading']()}
      description={m['discovery.next.description']()}
      links={tattooNextSteps(context).map((link) => ({
        href: link.href,
        label: link.label[locale],
        description: link.description[locale],
      }))}
    />
  );
}
