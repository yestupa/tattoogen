import { ChevronDown } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import {
  AGENT_ASPECT_RATIOS,
  AGENT_RESOLUTIONS,
  AUTO_ASPECT_RATIO,
  AUTO_RESOLUTION,
  type AgentComposerSettings,
} from '@/lib/agent-settings';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Draw the ratio as a proportional outline. The glyph sits in a fixed-height
 * box so every tile's label lands on the same baseline.
 */
function RatioGlyph({ ratio }: { ratio: string }) {
  const [w, h] = ratio.split(':').map(Number);
  const scale = 18 / Math.max(w, h);
  return (
    <span
      aria-hidden="true"
      className="flex h-[18px] items-center justify-center"
    >
      <span
        className="block rounded-[3px] border-[1.5px] border-current"
        style={{ width: w * scale, height: h * scale }}
      />
    </span>
  );
}

/**
 * Output settings (resolution + aspect ratio) as a single pill next to the
 * model picker; the label mirrors the current pair, e.g. "2K · 16:9".
 */
export function ComposerSettings({
  settings,
  onChange,
  disabled,
}: {
  settings: AgentComposerSettings;
  onChange: (settings: AgentComposerSettings) => void;
  disabled?: boolean;
}) {
  function update(patch: Partial<AgentComposerSettings>) {
    onChange({ ...settings, ...patch });
  }

  const resolutionLabel =
    settings.resolution === AUTO_RESOLUTION
      ? m['agent.composer.auto']()
      : (AGENT_RESOLUTIONS.find((item) => item.value === settings.resolution)
          ?.label ?? settings.resolution);
  const aspectLabel =
    settings.aspectRatio === AUTO_ASPECT_RATIO
      ? m['agent.composer.auto']()
      : settings.aspectRatio;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={`${m['agent.composer.resolution']()}: ${resolutionLabel}; ${m['agent.composer.aspect_ratio']()}: ${aspectLabel}`}
            className="bg-secondary text-foreground hover:bg-muted h-11 gap-1.5 rounded-xl px-3 text-xs"
          />
        }
      >
        <span className="truncate">
          {resolutionLabel} · {aspectLabel}
        </span>
        <ChevronDown className="text-muted-foreground size-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="[&_button]:focus-visible:outline-ring w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl p-3 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2"
      >
        <p className="mb-2 text-xs font-medium">
          {m['agent.composer.resolution']()}
        </p>
        <div className="bg-muted flex rounded-md p-0.5">
          {AGENT_RESOLUTIONS.map((item) => {
            const active = settings.resolution === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => update({ resolution: item.value })}
                aria-pressed={active}
                title={tDynamic(
                  `agent.composer.resolution_${item.value}_description`
                )}
                className={cn(
                  'min-h-11 min-w-11 flex-1 rounded-lg py-1.5 text-xs motion-safe:transition-colors',
                  active
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.value === AUTO_RESOLUTION
                  ? m['agent.composer.auto']()
                  : item.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 mb-2 text-xs font-medium">
          {m['agent.composer.aspect_ratio']()}
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {AGENT_ASPECT_RATIOS.map((ratio) => {
            const active = settings.aspectRatio === ratio;
            const isAuto = ratio === AUTO_ASPECT_RATIO;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => update({ aspectRatio: ratio })}
                aria-pressed={active}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-1 rounded-md border text-[11px] transition-colors',
                  active
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {isAuto ? (
                  <span className="text-xs">{m['agent.composer.auto']()}</span>
                ) : (
                  <>
                    <RatioGlyph ratio={ratio} />
                    <span>{ratio}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
