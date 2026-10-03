import { Calendar } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { BrandArtwork } from '@/components/brand-artwork';

export type BlogCardProps = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  date?: string;
  authorName?: string;
  authorImage?: string;
};

export function BlogCard({
  href,
  title,
  description,
  image,
  date,
  authorName,
  authorImage,
}: BlogCardProps) {
  return (
    <Link
      href={href}
      className="group border-border bg-card hover:border-primary/40 shadow-soft rounded-card relative flex min-w-0 flex-col overflow-hidden border transition-colors"
    >
      {image && (
        <img
          src={image}
          alt={title}
          width={640}
          height={360}
          loading="lazy"
          className="aspect-video w-full object-cover object-center"
        />
      )}
      {!image && (
        <div className="bg-secondary/40 paper-texture flex aspect-video items-center justify-center">
          <BrandArtwork className="text-foreground/70 h-36 w-auto p-3" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-lg leading-snug font-semibold group-hover:underline group-hover:underline-offset-4">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {description}
          </p>
        )}
        <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar aria-hidden className="size-3.5" />
              {date}
            </span>
          )}
          <span className="flex-1" />
          {(authorName || authorImage) && (
            <span className="inline-flex items-center gap-2">
              {authorImage && (
                <img
                  src={authorImage}
                  alt={authorName || ''}
                  width={20}
                  height={20}
                  loading="lazy"
                  className="size-5 rounded-full object-cover"
                />
              )}
              {authorName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
