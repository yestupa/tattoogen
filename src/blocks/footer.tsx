import { m } from '@/paraglide/messages.js';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: m['landing.footer.tools'](),
      links: [
        { label: m['discovery.nav.font'](), href: '/tattoo-font-generator' },
        { label: m['discovery.nav.image'](), href: '/image-to-tattoo' },
        {
          label: m['discovery.nav.idea_tool'](),
          href: '/tattoo-idea-generator',
        },
        { label: m['discovery.nav.try_on'](), href: '/try-tattoo' },
        { label: m['discovery.nav.stencil'](), href: '/tattoo-to-stencil' },
        { label: m['discovery.nav.cover_up'](), href: '/tattoo-cover-up' },
        { label: m['discovery.nav.filler'](), href: '/tattoo-filler' },
      ],
    },
    {
      title: m['landing.footer.explore'](),
      links: [
        { label: m['discovery.nav.ideas'](), href: '/tattoo-ideas' },
        { label: m['discovery.nav.styles'](), href: '/tattoo-styles' },
        { label: m['discovery.nav.placements'](), href: '/tattoo-placements' },
        { label: m['landing.nav.pricing'](), href: '/pricing' },
        { label: m['blog.title'](), href: '/blog' },
      ],
    },
    {
      title: m['landing.footer.popular'](),
      links: [
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
      title: m['landing.footer.more_ideas'](),
      links: [
        {
          label: m['couple.footer.link'](),
          href: '/couple-tattoo-generator',
        },
        {
          label: m['angel.footer.link'](),
          href: '/angel-numbers-tattoo-generator',
        },
        {
          label: m['joker.footer.link'](),
          href: '/joker-tattoo-generator',
        },
        {
          label: m['ghost.footer.link'](),
          href: '/ghost-face-tattoo-generator',
        },
        {
          label: m['throat.footer.link'](),
          href: '/throat-tattoo-for-men-generator',
        },
      ],
    },
    {
      title: m['landing.footer.support'](),
      links: [
        { label: m['landing.footer.contact'](), href: '/contact' },
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
