import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';

interface BrandImageProps {
  alt?: string;
  className?: string;
}

/** The supplied wordmark has generous transparent padding; crop it in CSS. */
export function BrandLogo({
  alt = envConfigs.app_name,
  className,
}: BrandImageProps) {
  return (
    <span
      className={cn(
        'relative block aspect-[4.4/1] w-48 shrink-0 overflow-hidden',
        className
      )}
    >
      <img
        src="/logo.png"
        alt={alt}
        width={1536}
        height={1024}
        draggable={false}
        className="absolute top-1/2 left-1/2 h-auto w-[110%] max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </span>
  );
}

export function BrandMark({
  alt = envConfigs.app_name,
  className,
}: BrandImageProps) {
  return (
    <img
      src="/favicon.png"
      alt={alt}
      width={1254}
      height={1254}
      draggable={false}
      className={cn('aspect-square shrink-0 object-contain', className)}
    />
  );
}
