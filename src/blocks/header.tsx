import { m } from '@/paraglide/messages.js';
import { SiteHeader } from '@/components/site-header';

export function Header({
  localeHrefs,
}: {
  localeHrefs?: Partial<Record<'en' | 'zh', string>>;
} = {}) {
  const navLinks = [
    { href: '/tattoo-tools', label: m['landing.nav.tools']() },
    { href: '/tattoo-ideas', label: m['landing.nav.ideas']() },
    { href: '/tattoo-styles', label: m['landing.nav.styles']() },
    { href: '/pricing', label: m['landing.nav.pricing']() },
    { href: '/blog', label: m['blog.title']() },
  ];

  return <SiteHeader navLinks={navLinks} localeHrefs={localeHrefs} />;
}
