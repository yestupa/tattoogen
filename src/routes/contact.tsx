import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CheckCircle2, Clock3, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type FormState = {
  requesterName: string;
  requesterEmail: string;
  category: string;
  subject: string;
  message: string;
  website: string;
};

const INITIAL_FORM: FormState = {
  requesterName: '',
  requesterEmail: '',
  category: 'generation',
  subject: '',
  message: '',
  website: '',
};

export const Route = createFileRoute('/contact')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['contact.meta_title']({}, { locale }),
      description: m['contact.meta_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { title, description, locale } = loaderData;
    const urlFor = (loc: typeof locale) =>
      localizeUrl(new URL('/contact', envConfigs.app_url), { locale: loc })
        .href;
    return {
      meta: [
        { title: `${title} | ${envConfigs.app_name}` },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: urlFor(locale) },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor(baseLocale) },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiPost<{ reference: string }>('/api/contact', {
        ...form,
        locale: getLocale(),
        startedAt,
      });
      setReference(result.reference);
      setForm(INITIAL_FORM);
      setStartedAt(Date.now());
    } catch (error: any) {
      toast.error(error?.message || m['contact.submit_failed']());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section
          data-public-hero
          className="section-ink px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="section-shell">
            <p className="eyebrow-vermilion">{m['contact.eyebrow']()}</p>
            <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[0.94] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
              {m['contact.title']()}
            </h1>
            <p className="text-ink-muted mt-5 max-w-2xl text-base leading-7 sm:text-lg">
              {m['contact.description']()}
            </p>
          </div>
        </section>

        <section className="section-paper paper-texture px-4 py-16 sm:px-6 sm:py-24">
          <div className="section-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <section className="lg:pt-6">
              <div className="mt-9 space-y-5">
                <div className="border-paper-line bg-paper-panel flex gap-4 rounded-[1.1rem] border p-5">
                  <Clock3 className="text-vermilion mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-medium">
                      {m['contact.response_title']()}
                    </p>
                    <p className="text-paper-muted mt-1 text-sm leading-6">
                      {m['contact.response_description']()}
                    </p>
                  </div>
                </div>
                <div className="border-paper-line bg-paper-panel flex gap-4 rounded-[1.1rem] border p-5">
                  <ShieldCheck className="text-vermilion mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-medium">
                      {m['contact.privacy_title']()}
                    </p>
                    <p className="text-paper-muted mt-1 text-sm leading-6">
                      {m['contact.privacy_description']()}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Card className="border-paper-line bg-paper-panel overflow-hidden rounded-[1.4rem] shadow-[0_24px_70px_-48px_rgba(17,17,16,0.55)]">
              <CardContent className="p-6 sm:p-8">
                {reference ? (
                  <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                    <span className="bg-primary/10 mb-5 inline-flex size-14 items-center justify-center rounded-full">
                      <CheckCircle2 className="text-primary size-7" />
                    </span>
                    <h2 className="font-display text-3xl font-semibold tracking-[-0.04em]">
                      {m['contact.success_title']()}
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-md leading-7">
                      {m['contact.success_description']()}
                    </p>
                    <div className="bg-muted mt-6 rounded-xl px-4 py-3 text-sm">
                      <span className="text-muted-foreground">
                        {m['contact.reference']()}
                      </span>{' '}
                      <span className="font-mono font-medium">{reference}</span>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Link
                        href="/chat"
                        className={buttonVariants({ size: 'lg' })}
                      >
                        {m['contact.create_cta']()}
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => setReference('')}
                      >
                        {m['contact.another_ticket']()}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={submit}>
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 inline-flex size-10 items-center justify-center rounded-full">
                        <Mail className="text-primary size-5" />
                      </span>
                      <div>
                        <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">
                          {m['contact.form_title']()}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {m['contact.form_description']()}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">
                          {m['contact.name']()}
                        </Label>
                        <Input
                          id="contact-name"
                          required
                          minLength={2}
                          maxLength={80}
                          autoComplete="name"
                          className="h-11"
                          value={form.requesterName}
                          onChange={(event) =>
                            update('requesterName', event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">
                          {m['contact.email']()}
                        </Label>
                        <Input
                          id="contact-email"
                          required
                          type="email"
                          maxLength={254}
                          autoComplete="email"
                          className="h-11"
                          value={form.requesterEmail}
                          onChange={(event) =>
                            update('requesterEmail', event.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-category">
                        {m['contact.category']()}
                      </Label>
                      <select
                        id="contact-category"
                        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
                        value={form.category}
                        onChange={(event) =>
                          update('category', event.target.value)
                        }
                      >
                        <option value="generation">
                          {m['contact.category_generation']()}
                        </option>
                        <option value="billing">
                          {m['contact.category_billing']()}
                        </option>
                        <option value="account">
                          {m['contact.category_account']()}
                        </option>
                        <option value="privacy">
                          {m['contact.category_privacy']()}
                        </option>
                        <option value="other">
                          {m['contact.category_other']()}
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-subject">
                        {m['contact.subject']()}
                      </Label>
                      <Input
                        id="contact-subject"
                        required
                        minLength={4}
                        maxLength={160}
                        className="h-11"
                        value={form.subject}
                        onChange={(event) =>
                          update('subject', event.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message">
                        {m['contact.message']()}
                      </Label>
                      <Textarea
                        id="contact-message"
                        required
                        minLength={20}
                        maxLength={5000}
                        rows={7}
                        value={form.message}
                        onChange={(event) =>
                          update('message', event.target.value)
                        }
                        placeholder={m['contact.message_placeholder']()}
                      />
                      <p className="text-muted-foreground text-xs">
                        {form.message.length} / 5000
                      </p>
                    </div>

                    <div
                      className="absolute -left-[9999px] h-px w-px overflow-hidden"
                      aria-hidden="true"
                    >
                      <Label htmlFor="contact-website">Website</Label>
                      <Input
                        id="contact-website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={(event) =>
                          update('website', event.target.value)
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="min-h-12 w-full"
                      disabled={submitting}
                    >
                      {submitting
                        ? m['contact.submitting']()
                        : m['contact.submit']()}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
