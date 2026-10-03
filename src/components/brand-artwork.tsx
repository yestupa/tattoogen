import { cn } from '@/lib/utils';

export interface BrandArtworkProps {
  className?: string;
  label?: string;
}

export function BrandArtwork({ className, label }: BrandArtworkProps) {
  const accessibleLabel = label?.trim() || undefined;

  return (
    <svg
      data-brand-artwork="tattoo-generator"
      viewBox="0 0 320 360"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-auto w-full', className)}
      role={accessibleLabel ? 'img' : undefined}
      aria-label={accessibleLabel}
      aria-hidden={accessibleLabel ? undefined : true}
      focusable="false"
    >
      {/* Crescent moon and small flash stars. */}
      <path d="M181 44a35 35 0 1 0 23 55 30 30 0 0 1-23-55Z" />
      <path d="m91 77 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" />
      <path d="m238 121 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />
      <path d="M225 51v10m-5-5h10M65 155v8m-4-4h8" />
      <circle cx="112" cy="47" r="2" fill="currentColor" stroke="none" />
      <circle cx="258" cy="93" r="2" fill="currentColor" stroke="none" />
      {/* A fine needle anchors the botanical composition. */}
      <path d="m160 126 8 24-8 155-8-155Z" />
      <path d="M160 136v151m-6-131h12m-13 8h14" />
      <ellipse cx="160" cy="146" rx="2.5" ry="7" />
      {/* Hand-drawn stems and leaves. */}
      <path d="M150 288c-48-23-69-60-64-104m17 48c-21-3-37-19-41-41 23 4 37 16 41 41Zm-14-30c-12-13-13-33-4-51 14 15 17 33 4 51Zm31 57c-24 4-43-3-55-21 23-5 43 1 55 21Zm-20-34c16-4 25-18 25-37-20 6-29 19-25 37Z" />
      <path d="M170 288c48-23 69-60 64-104m-17 48c21-3 37-19 41-41-23 4-37 16-41 41Zm14-30c12-13 13-33 4-51-14 15-17 33-4 51Zm-31 57c24 4 43-3 55-21-23-5-43 1-55 21Zm20-34c-16-4-25-18-25-37 20 6 29 19 25 37Z" />
      {/* Flowing ink lines finish the flash without a raster asset. */}
      <path d="M49 280c38 46 94 50 132 37s69-6 89 15M59 294c32 35 73 40 103 33s55-14 84-4" />
      <path
        d="M117 116c-27 11-46 31-51 55m137-55c27 11 46 31 51 55"
        strokeDasharray="2 8"
      />
      <path d="m160 321 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
    </svg>
  );
}
