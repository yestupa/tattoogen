import { m } from '@/paraglide/messages.js';
import { SiteHeader } from '@/components/site-header';

export function Header({
  localeHrefs,
}: {
  localeHrefs?: Partial<Record<'en' | 'zh', string>>;
} = {}) {
  const navLinks = [
    { href: '/chat', label: m['landing.nav.create']() },
    { href: '/pricing', label: m['landing.nav.pricing']() },
    { href: '/blog', label: m['blog.title']() },
  ];

  return <SiteHeader navLinks={navLinks} localeHrefs={localeHrefs} />;
}
