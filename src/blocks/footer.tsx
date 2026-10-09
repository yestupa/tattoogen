import { m } from '@/paraglide/messages.js';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: m['landing.footer.products'](),
      links: [
        { label: m['landing.nav.pricing'](), href: '/pricing' },
        { label: m['blog.title'](), href: '/blog' },
        { label: m['womb.footer.link'](), href: '/womb-tattoo-generator' },
        {
          label: m['fear.footer.link'](),
          href: '/fear-god-tattoo-generator',
        },
        {
          label: m['kaiser.footer.link'](),
          href: '/kaiser-tattoo-generator',
        },
        {
          label: m['poison.footer.link'](),
          href: '/poison-tree-tattoo-generator',
        },
        {
          label: m['butterfly.footer.link'](),
          href: '/butterfly-tattoo-generator',
        },
      ],
    },
    {
      title: m['landing.footer.support'](),
      links: [{ label: m['landing.footer.contact'](), href: '/contact' }],
    },
    {
      title: m['landing.footer.legal'](),
      links: [
        { label: m['landing.footer.privacy'](), href: '/privacy-policy' },
        { label: m['landing.footer.terms'](), href: '/terms-of-service' },
      ],
    },
  ];

  return (
    <SiteFooter
      languageLabel={m['common.nav.switch_language']()}
      rightsReservedLabel={m['common.footer.rights_reserved']()}
      tagline={m['landing.footer.tagline']()}
      columns={columns}
    />
  );
}
