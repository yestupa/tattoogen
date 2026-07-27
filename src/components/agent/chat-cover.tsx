import { cn } from '@/lib/utils';

/** A consistent visual anchor for generated-image conversations. */
export function ChatCover({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) return null;

  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground relative block shrink-0 overflow-hidden',
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="size-full object-cover"
      />
    </span>
  );
}
