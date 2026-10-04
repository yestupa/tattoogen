import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { tDynamic } from '@/core/i18n/dynamic';
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  type PageResult,
} from '@/lib/api-client';
import { isCanonicalPostSlug, normalizePostSlug } from '@/lib/post-slug';
import { formatDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
import { TextField } from '@/components/form-field';
import { PageHeading } from '@/components/page-heading';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PostListItem {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  image: string | null;
  categories: string | null;
  authorName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TranslationRecord {
  locale: 'en' | 'zh';
  slug: string;
  title: string;
  description: string | null;
  content: string;
  status: string;
}

interface PostDetail extends PostListItem {
  translations: Partial<Record<'en' | 'zh', TranslationRecord>>;
}

interface CategoryOption {
  id: string;
  title: string;
  slug: string;
}

const PAGE_SIZE = 20;
const TABS = ['all', 'published', 'draft'] as const;
type Tab = (typeof TABS)[number];

const localizedPostSchema = z
  .object({
    image: z.string(),
    categories: z.string(),
    authorName: z.string(),
    enSlug: z.string(),
    enTitle: z.string(),
    enDescription: z.string(),
    enContent: z.string(),
    enStatus: z.enum(['draft', 'published']),
    zhSlug: z.string(),
    zhTitle: z.string(),
    zhDescription: z.string(),
    zhContent: z.string(),
    zhStatus: z.enum(['draft', 'published']),
  })
  .superRefine((value, context) => {
    const locales = [
      {
        key: 'en',
        slug: value.enSlug,
        title: value.enTitle,
        content: value.enContent,
      },
      {
        key: 'zh',
        slug: value.zhSlug,
        title: value.zhTitle,
        content: value.zhContent,
      },
    ] as const;
    let completed = 0;
    for (const locale of locales) {
      const started = Boolean(
        locale.slug.trim() || locale.title.trim() || locale.content.trim()
      );
      if (!started) continue;
      completed += 1;
      if (!isCanonicalPostSlug(normalizePostSlug(locale.slug))) {
        context.addIssue({
          code: 'custom',
          path: [`${locale.key}Slug`],
          message: m['admin.posts.slug_invalid'](),
        });
      }
      if (!locale.title.trim()) {
        context.addIssue({
          code: 'custom',
          path: [`${locale.key}Title`],
          message: m['admin.posts.title_required'](),
        });
      }
    }
    if (!completed) {
      context.addIssue({
        code: 'custom',
        path: ['enTitle'],
        message: m['admin.posts.translation_required'](),
      });
    }
  });

type PostForm = z.infer<typeof localizedPostSchema>;
const emptyForm: PostForm = {
  image: '',
  categories: '',
  authorName: '',
  enSlug: '',
  enTitle: '',
  enDescription: '',
  enContent: '',
  enStatus: 'draft',
  zhSlug: '',
  zhTitle: '',
  zhDescription: '',
  zhContent: '',
  zhStatus: 'draft',
};

function toPayload(value: PostForm) {
  const translations = [
    {
      locale: 'en' as const,
      slug: normalizePostSlug(value.enSlug),
      title: value.enTitle.trim(),
      description: value.enDescription,
      content: value.enContent,
      status: value.enStatus,
    },
    {
      locale: 'zh' as const,
      slug: normalizePostSlug(value.zhSlug),
      title: value.zhTitle.trim(),
      description: value.zhDescription,
      content: value.zhContent,
      status: value.zhStatus,
    },
  ].filter((item) => item.slug || item.title || item.content);
  return {
    image: value.image,
    categories: value.categories,
    authorName: value.authorName,
    translations,
  };
}

function PostsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostListItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => setPage(1), [tab, debouncedSearch]);

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories', 'options'],
    queryFn: () => apiGet<CategoryOption[]>('/api/admin/categories?all=true'),
  });
  const categoryOptions = categoriesQuery.data ?? [];

  const listQuery = useQuery({
    queryKey: ['admin-posts', page, tab, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (tab !== 'all') params.set('status', tab);
      if (debouncedSearch) params.set('search', debouncedSearch);
      return apiGet<PageResult<PostListItem>>(`/api/admin/posts?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const form = useForm({
    defaultValues: emptyForm,
    validators: { onSubmit: localizedPostSchema },
    onSubmit: async ({ value }) => saveMutation.mutateAsync(value),
  });

  const saveMutation = useMutation({
    mutationFn: (value: PostForm) =>
      editingPostId
        ? apiPut('/api/admin/posts', {
            id: editingPostId,
            ...toPayload(value),
          })
        : apiPost('/api/admin/posts', toPayload(value)),
    onSuccess: () => {
      toast.success(
        editingPostId ? m['admin.posts.updated']() : m['admin.posts.created']()
      );
      setEditorOpen(false);
      setEditingPostId(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/api/admin/posts?id=${encodeURIComponent(id)}`),
    onSuccess: () => {
      toast.success(m['admin.posts.deleted']());
      setDeletingPost(null);
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const translateMutation = useMutation({
    mutationFn: (input: {
      title: string;
      description: string;
      content: string;
    }) =>
      apiPost<{
        title: string;
        description: string;
        content: string;
      }>('/api/admin/posts/translate', input),
    onSuccess: (translation) => {
      form.setFieldValue('zhTitle', translation.title);
      form.setFieldValue('zhDescription', translation.description);
      form.setFieldValue('zhContent', translation.content);
      form.setFieldValue('zhStatus', 'draft');
      toast.success(m['admin.posts.translation_generated']());
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function generateChineseDraft() {
    const values = form.state.values;
    if (!values.enTitle.trim() || !values.enContent.trim()) {
      toast.error(m['admin.posts.translation_source_required']());
      return;
    }
    if (
      (values.zhTitle.trim() || values.zhContent.trim()) &&
      !window.confirm(m['admin.posts.translation_overwrite_confirm']())
    ) {
      return;
    }
    translateMutation.mutate({
      title: values.enTitle,
      description: values.enDescription,
      content: values.enContent,
    });
  }

  function openCreate() {
    setEditingPostId(null);
    form.reset(emptyForm);
    setEditorOpen(true);
  }

  async function openEdit(post: PostListItem) {
    setLoadingPostId(post.id);
    try {
      const detail = await apiGet<PostDetail>(
        `/api/admin/posts?id=${encodeURIComponent(post.id)}`
      );
      const en = detail.translations.en;
      const zh = detail.translations.zh;
      form.reset({
        image: detail.image || '',
        categories: detail.categories || '',
        authorName: detail.authorName || '',
        enSlug: en?.slug || '',
        enTitle: en?.title || '',
        enDescription: en?.description || '',
        enContent: en?.content || '',
        enStatus: en?.status === 'published' ? 'published' : 'draft',
        zhSlug: zh?.slug || '',
        zhTitle: zh?.title || '',
        zhDescription: zh?.description || '',
        zhContent: zh?.content || '',
        zhStatus: zh?.status === 'published' ? 'published' : 'draft',
      });
      setEditingPostId(post.id);
      setEditorOpen(true);
    } catch (error: any) {
      toast.error(error.message || m['admin.posts.load_failed']());
    } finally {
      setLoadingPostId(null);
    }
  }

  function renderTranslation(locale: 'en' | 'zh') {
    const slugName = `${locale}Slug` as 'enSlug' | 'zhSlug';
    const titleName = `${locale}Title` as 'enTitle' | 'zhTitle';
    const descriptionName = `${locale}Description` as
      | 'enDescription'
      | 'zhDescription';
    const contentName = `${locale}Content` as 'enContent' | 'zhContent';
    const statusName = `${locale}Status` as 'enStatus' | 'zhStatus';
    return (
      <TabsContent value={locale} className="space-y-4 pt-4">
        <p className="text-muted-foreground text-sm">
          {locale === 'en'
            ? m['admin.posts.english_content']()
            : m['admin.posts.chinese_content']()}
        </p>
        {locale === 'zh' && (
          <Button
            type="button"
            variant="outline"
            disabled={translateMutation.isPending}
            onClick={generateChineseDraft}
          >
            {translateMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {m['admin.posts.generate_chinese_draft']()}
          </Button>
        )}
        <form.Field name={slugName}>
          {(field) => (
            <TextField
              field={field}
              label={m['admin.posts.slug_field']()}
              placeholder={
                locale === 'en'
                  ? 'fine-line-tattoo-guide'
                  : 'xi-xian-wen-shen-zhi-nan'
              }
            />
          )}
        </form.Field>
        <form.Field name={titleName}>
          {(field) => (
            <TextField
              field={field}
              label={m['admin.posts.title_field']()}
              placeholder={m['admin.posts.title_placeholder']()}
            />
          )}
        </form.Field>
        <form.Field name={descriptionName}>
          {(field) => (
            <TextField
              field={field}
              label={m['admin.posts.description_field']()}
              placeholder={m['admin.posts.description_placeholder']()}
            />
          )}
        </form.Field>
        <form.Field name={statusName}>
          {(field) => (
            <div className="space-y-2">
              <Label>{m['admin.posts.status_field']()}</Label>
              <Select
                items={[
                  {
                    label: m['admin.posts.status_draft'](),
                    value: 'draft',
                  },
                  {
                    label: m['admin.posts.status_published'](),
                    value: 'published',
                  },
                ]}
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(
                    (value || 'draft') as 'draft' | 'published'
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    {m['admin.posts.status_draft']()}
                  </SelectItem>
                  <SelectItem value="published">
                    {m['admin.posts.status_published']()}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
        <form.Field name={contentName}>
          {(field) => (
            <div className="space-y-2">
              <Label>{m['admin.posts.content_field']()}</Label>
              <RichTextEditor
                uploadFailedLabel={m['common.upload.failed']()}
                value={field.state.value}
                onChange={field.handleChange}
                placeholder={m['admin.posts.content_placeholder']()}
              />
            </div>
          )}
        </form.Field>
      </TabsContent>
    );
  }

  const columns: Column<PostListItem>[] = [
    {
      header: m['admin.posts.title_col'](),
      cell: (post) => <span className="font-medium">{post.title || '—'}</span>,
    },
    {
      header: m['admin.posts.slug_col'](),
      cell: (post) => <span className="font-mono text-xs">{post.slug}</span>,
    },
    {
      header: m['admin.posts.author_col'](),
      cell: (post) => post.authorName || '—',
    },
    {
      header: m['admin.posts.status_col'](),
      cell: (post) => (
        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
          {post.status}
        </Badge>
      ),
    },
    {
      header: m['admin.posts.created_at'](),
      cell: (post) => (
        <span className="text-muted-foreground text-sm">
          {formatDateTime(post.createdAt)}
        </span>
      ),
    },
    {
      header: m['admin.posts.actions_col'](),
      className: 'w-[90px]',
      cell: (post) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={m['common.action.edit']()}
            disabled={loadingPostId === post.id}
            onClick={() => openEdit(post)}
          >
            {loadingPostId === post.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Pencil className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={m['common.action.delete']()}
            onClick={() => setDeletingPost(post)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        title={m['admin.posts.title']()}
        description={m['admin.posts.description']()}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {m['admin.posts.create']()}
          </Button>
        }
      />
      <div className="border-border flex gap-1 overflow-x-auto border-b">
        {TABS.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
              tab === item
                ? 'border-primary text-foreground'
                : 'text-muted-foreground border-transparent'
            )}
          >
            {tDynamic(`admin.posts.tab_${item}`)}
          </button>
        ))}
      </div>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={listQuery.data?.items ?? []}
            total={listQuery.data?.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            rowKey={(post) => post.id}
            emptyText={m['admin.posts.no_data']()}
            search={search}
            onSearchChange={setSearch}
            onRefresh={() => listQuery.refetch()}
            loading={listQuery.isFetching}
            error={listQuery.error?.message}
          />
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingPostId
                ? m['admin.posts.edit_title']()
                : m['admin.posts.create_title']()}
            </DialogTitle>
            <DialogDescription>
              {m['admin.posts.bilingual_description']()}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <form.Field name="authorName">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.posts.author_field']()}
                    placeholder={m['admin.posts.author_placeholder']()}
                  />
                )}
              </form.Field>
              <form.Field name="image">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.posts.image_field']()}
                    placeholder="https://"
                  />
                )}
              </form.Field>
              <form.Field name="categories">
                {(field) => {
                  const selected = categoryOptions.find(
                    (item) => item.id === field.state.value
                  );
                  return (
                    <div className="space-y-2 sm:col-span-2">
                      <Label>{m['admin.posts.category_field']()}</Label>
                      <Select
                        items={categoryOptions.map((item) => ({
                          label: item.title,
                          value: item.id,
                        }))}
                        value={field.state.value || ''}
                        disabled={categoriesQuery.isLoading}
                        onValueChange={(value) =>
                          field.handleChange(value || '')
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={m[
                              'admin.posts.category_placeholder'
                            ]()}
                          >
                            {selected?.title}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }}
              </form.Field>
            </div>
            <Tabs defaultValue="en">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="en">
                  {m['admin.posts.english_tab']()}
                </TabsTrigger>
                <TabsTrigger value="zh">
                  {m['admin.posts.chinese_tab']()}
                </TabsTrigger>
              </TabsList>
              {renderTranslation('en')}
              {renderTranslation('zh')}
            </Tabs>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditorOpen(false)}
              >
                {m['admin.posts.cancel']()}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {m['admin.posts.save']()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingPost}
        onOpenChange={(open) => !open && setDeletingPost(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m['admin.posts.delete_title']()}</DialogTitle>
            <DialogDescription>
              {m['admin.posts.delete_confirm']()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPost(null)}>
              {m['admin.posts.cancel']()}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deletingPost && deleteMutation.mutate(deletingPost.id)
              }
            >
              {m['admin.posts.confirm_delete']()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/posts')({
  component: PostsPage,
});
