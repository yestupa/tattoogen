import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { blogPostPath } from '@/lib/post-slug';
import { baseLocale } from '@/paraglide/runtime.js';

const STATIC_PAGES: { path: string; title: string; description: string }[] = [
  { path: '', title: 'Home', description: 'Landing page' },
  { path: '/pricing', title: 'Pricing', description: 'Pricing plans' },
  { path: '/blog', title: 'Blog', description: 'Blog posts and articles' },
];

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { app_url, app_name, app_description } = envConfigs;

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

        let posts: Awaited<
          ReturnType<
            typeof import('@/modules/posts/service').listPublishedArticles
          >
        > = [];
        try {
          const { listPublishedArticles, findPublishedBySlug } =
            await import('@/modules/posts/service');
          posts = await listPublishedArticles({ locale: baseLocale }).catch(
            () => []
          );

          if (posts.length > 0) {
            lines.push('', '## Blog Posts', '');

            for (const post of posts) {
              lines.push(`### ${post.title}`, '');
              lines.push(`URL: ${app_url}${blogPostPath(post.slug)}`);
              if (post.description)
                lines.push(`Description: ${post.description}`);
              lines.push('');

              const detail = await findPublishedBySlug(
                post.slug,
                baseLocale
              ).catch(() => null);
              if (detail?.content) {
                lines.push(detail.content, '');
              }

              lines.push('---', '');
            }
          }
        } catch {
          // Database unreachable — keep the static page list available.
        }

        lines.push('');

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
