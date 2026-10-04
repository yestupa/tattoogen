import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { blogPostPath } from '@/lib/post-slug';
import { baseLocale } from '@/paraglide/runtime.js';

const STATIC_PAGES: { path: string; title: string; description: string }[] = [
  { path: '', title: 'Home', description: 'Landing page' },
  { path: '/pricing', title: 'Pricing', description: 'Pricing plans' },
  { path: '/blog', title: 'Blog', description: 'Blog posts and articles' },
];

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { app_url, app_name, app_description } = envConfigs;

        let posts: Awaited<
          ReturnType<
            typeof import('@/modules/posts/service').listPublishedArticles
          >
        > = [];
        try {
          const { listPublishedArticles } =
            await import('@/modules/posts/service');
          posts = await listPublishedArticles({ locale: baseLocale }).catch(
            () => []
          );
        } catch {
          // Database unreachable — keep the static page list available.
        }

        const lines: string[] = [
          `# ${app_name}`,
          '',
          `> ${app_description}`,
          '',
          '## Pages',
          '',
          ...STATIC_PAGES.map(
            (p) => `- [${p.title}](${app_url}${p.path}): ${p.description}`
          ),
        ];

        if (posts.length > 0) {
          lines.push('', '## Blog Posts', '');
          for (const post of posts) {
            lines.push(
              `- [${post.title}](${app_url}${blogPostPath(post.slug)}): ${post.description}`
            );
          }
        }

        lines.push('');

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
