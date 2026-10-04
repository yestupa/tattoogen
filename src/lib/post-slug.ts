export const POST_SLUG_ERROR =
  'Invalid post slug. Use lowercase letters, numbers, and single hyphens only.';

const CANONICAL_POST_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizePostSlug(value: string): string {
  return value.trim().toLowerCase();
}

export function isCanonicalPostSlug(value: string): boolean {
  return CANONICAL_POST_SLUG.test(value);
}

export function requirePostSlug(value: unknown): string {
  if (typeof value !== 'string') throw new Error(POST_SLUG_ERROR);
  const slug = normalizePostSlug(value);
  if (!isCanonicalPostSlug(slug)) throw new Error(POST_SLUG_ERROR);
  return slug;
}

export function blogPostPath(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`;
}
