import { and, count, desc, eq, inArray, like, or, type SQL } from 'drizzle-orm';

import { db } from '@/core/db';
import { post, postTranslation } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';
import { requirePostSlug } from '@/lib/post-slug';

export enum PostType {
  ARTICLE = 'article',
  PAGE = 'page',
  LOG = 'log',
}

export enum PostStatus {
  PUBLISHED = 'published',
  PENDING = 'pending',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

type Post = typeof post.$inferSelect;
type NewPost = typeof post.$inferInsert;

export type PublishedArticleItem = Pick<
  Post,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'image'
  | 'authorName'
  | 'authorImage'
  | 'createdAt'
> & {
  locale: 'en' | 'zh';
};

export type PostLocale = 'en' | 'zh';
export type TranslationInput = {
  locale: PostLocale;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  status: 'draft' | 'published' | 'archived';
};

export type LocalizedPostInput = {
  image?: string;
  categories?: string;
  authorName?: string;
  translations: TranslationInput[];
};

export async function list(params: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { type, status, search, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [];
  if (type) conditions.push(eq(post.type, type));
  if (status) conditions.push(eq(post.status, status));
  if (search) {
    conditions.push(
      or(like(post.title, `%${search}%`), like(post.slug, `%${search}%`))!
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db()
    .select({ count: count() })
    .from(post)
    .where(where);
  const total = totalResult.count;

  const items = await db()
    .select({
      id: post.id,
      slug: post.slug,
      type: post.type,
      title: post.title,
      description: post.description,
      image: post.image,
      categories: post.categories,
      authorName: post.authorName,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })
    .from(post)
    .where(where)
    .orderBy(desc(post.updatedAt), desc(post.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { items, total };
}

export async function listPublishedArticles(
  params: { limit?: number; locale?: PostLocale } = {}
): Promise<PublishedArticleItem[]> {
  const { limit = 100, locale = 'en' } = params;
  return db()
    .select({
      id: post.id,
      slug: postTranslation.slug,
      title: postTranslation.title,
      description: postTranslation.description,
      image: post.image,
      authorName: post.authorName,
      authorImage: post.authorImage,
      createdAt: postTranslation.publishedAt,
      locale: postTranslation.locale,
    })
    .from(post)
    .innerJoin(postTranslation, eq(postTranslation.postId, post.id))
    .where(
      and(
        eq(post.type, PostType.ARTICLE),
        eq(postTranslation.locale, locale),
        eq(postTranslation.status, PostStatus.PUBLISHED)
      )
    )
    .orderBy(desc(postTranslation.publishedAt), desc(post.createdAt))
    .limit(limit) as Promise<PublishedArticleItem[]>;
}

export async function findPublishedBySlug(
  slug: string,
  locale: PostLocale = 'en'
) {
  const normalizedSlug = requirePostSlug(slug);
  const [result] = await db()
    .select({
      id: post.id,
      userId: post.userId,
      image: post.image,
      categories: post.categories,
      authorName: post.authorName,
      authorImage: post.authorImage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      slug: postTranslation.slug,
      title: postTranslation.title,
      description: postTranslation.description,
      content: postTranslation.content,
      status: postTranslation.status,
      locale: postTranslation.locale,
      publishedAt: postTranslation.publishedAt,
    })
    .from(post)
    .innerJoin(postTranslation, eq(postTranslation.postId, post.id))
    .where(
      and(
        eq(postTranslation.slug, normalizedSlug),
        eq(postTranslation.locale, locale),
        eq(postTranslation.status, PostStatus.PUBLISHED)
      )
    )
    .limit(1);
  return result;
}

function normalizeTranslations(inputs: TranslationInput[]) {
  const byLocale = new Map<PostLocale, TranslationInput>();
  for (const input of inputs) {
    if (input.locale !== 'en' && input.locale !== 'zh') {
      throw new Error('Unsupported locale');
    }
    const hasContent = Boolean(
      input.slug.trim() || input.title.trim() || input.content?.trim()
    );
    if (!hasContent) continue;
    if (!input.title.trim())
      throw new Error(`${input.locale} title is required`);
    byLocale.set(input.locale, {
      ...input,
      slug: requirePostSlug(input.slug),
      title: input.title.trim(),
      description: input.description?.trim() || '',
      content: input.content || '',
    });
  }
  const translations = [...byLocale.values()];
  if (!translations.length)
    throw new Error('At least one translation is required');
  return translations;
}

function sharedPostStatus(translations: TranslationInput[]) {
  return translations.some((item) => item.status === PostStatus.PUBLISHED)
    ? PostStatus.PUBLISHED
    : PostStatus.DRAFT;
}

export async function getAdminPostById(id: string) {
  const shared = await getById(id);
  if (!shared) return undefined;
  const rows: Array<typeof postTranslation.$inferSelect> = await db()
    .select()
    .from(postTranslation)
    .where(eq(postTranslation.postId, id));
  return {
    ...shared,
    translations: Object.fromEntries(
      rows.map((row) => [row.locale, row])
    ) as Partial<Record<PostLocale, (typeof rows)[number]>>,
  };
}

export async function createLocalized(
  userId: string,
  input: LocalizedPostInput
) {
  const translations = normalizeTranslations(input.translations);
  const primary =
    translations.find((item) => item.locale === 'en') || translations[0];
  const id = getUuid();
  await db().transaction(async (tx: any) => {
    await tx.insert(post).values({
      id,
      userId,
      slug: primary.slug,
      type: PostType.ARTICLE,
      title: primary.title,
      description: primary.description || '',
      content: primary.content || '',
      image: input.image || '',
      categories: input.categories || '',
      authorName: input.authorName || '',
      status: sharedPostStatus(translations),
    });
    await tx.insert(postTranslation).values(
      translations.map((item) => ({
        id: getUuid(),
        postId: id,
        ...item,
        description: item.description || '',
        content: item.content || '',
        publishedAt: item.status === PostStatus.PUBLISHED ? new Date() : null,
      }))
    );
  });
  return getAdminPostById(id);
}

export async function updateLocalized(id: string, input: LocalizedPostInput) {
  const translations = normalizeTranslations(input.translations);
  const primary =
    translations.find((item) => item.locale === 'en') || translations[0];
  const database = db();
  await database.transaction(async (tx: any) => {
    await tx
      .update(post)
      .set({
        slug: primary.slug,
        title: primary.title,
        description: primary.description || '',
        content: primary.content || '',
        image: input.image || '',
        categories: input.categories || '',
        authorName: input.authorName || '',
        status: sharedPostStatus(translations),
        updatedAt: new Date(),
      })
      .where(eq(post.id, id));

    const existing = await tx
      .select()
      .from(postTranslation)
      .where(eq(postTranslation.postId, id));
    const existingByLocale = new Map(
      existing.map((row: any) => [row.locale, row])
    );
    for (const item of translations) {
      const current: any = existingByLocale.get(item.locale);
      const values = {
        slug: item.slug,
        title: item.title,
        description: item.description || '',
        content: item.content || '',
        status: item.status,
        publishedAt:
          item.status === PostStatus.PUBLISHED
            ? current?.publishedAt || new Date()
            : null,
        updatedAt: new Date(),
      };
      if (current) {
        await tx
          .update(postTranslation)
          .set(values)
          .where(eq(postTranslation.id, current.id));
      } else {
        await tx.insert(postTranslation).values({
          id: getUuid(),
          postId: id,
          locale: item.locale,
          ...values,
        });
      }
    }
  });
  return getAdminPostById(id);
}

export async function getPublishedLocaleAvailability() {
  return db()
    .select({
      postId: postTranslation.postId,
      locale: postTranslation.locale,
      slug: postTranslation.slug,
      updatedAt: postTranslation.updatedAt,
    })
    .from(postTranslation)
    .where(
      and(
        inArray(postTranslation.locale, ['en', 'zh']),
        eq(postTranslation.status, PostStatus.PUBLISHED)
      )
    );
}

export async function getById(id: string) {
  const [result] = await db()
    .select()
    .from(post)
    .where(eq(post.id, id))
    .limit(1);
  return result;
}

export async function create(data: {
  userId: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  content?: string;
  categories?: string;
  authorName?: string;
  status?: string;
}) {
  const slug = requirePostSlug(data.slug);
  const newPost: NewPost = {
    id: getUuid(),
    userId: data.userId,
    slug,
    type: PostType.ARTICLE,
    title: data.title,
    description: data.description || '',
    image: data.image || '',
    content: data.content || '',
    categories: data.categories || '',
    authorName: data.authorName || '',
    status: data.status || PostStatus.DRAFT,
  };
  const [result] = await db().insert(post).values(newPost).returning();
  return result;
}

export async function update(
  id: string,
  data: {
    slug?: string;
    title?: string;
    description?: string;
    image?: string;
    content?: string;
    categories?: string;
    authorName?: string;
    status?: string;
  }
) {
  const updateData: any = { ...data };
  if (data.slug !== undefined) updateData.slug = requirePostSlug(data.slug);
  const [result] = await db()
    .update(post)
    .set(updateData)
    .where(eq(post.id, id))
    .returning();
  return result;
}

export async function remove(id: string) {
  await db()
    .update(post)
    .set({ status: PostStatus.ARCHIVED })
    .where(eq(post.id, id));
}
