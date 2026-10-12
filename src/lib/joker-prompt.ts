export type JokerStyle =
  | 'mask'
  | 'card'
  | 'grin'
  | 'jester'
  | 'masks'
  | 'diamond'
  | 'rose'
  | 'color_hat';

const directions: Record<JokerStyle, string> = {
  mask: 'a smiling black-and-grey theatre mask with diamond eye makeup and a two-point bell hat',
  card: 'an original jester figure inside a complete vintage Joker playing-card frame',
  grin: 'a graphic upward grin with clearly spaced teeth and restrained black shading',
  jester:
    'a three-point jester hat with a bell on each tip and fine dotwork texture',
  masks:
    'two contrasting theatre masks, one smiling and one quiet, in a balanced diagonal composition',
  diamond:
    'a three-point bell hat inside a sharp diamond frame in bold blackwork',
  rose: 'an original vintage jester playing card paired with a rose and a few leaves',
  color_hat:
    'a three-point jester hat with alternating muted emerald and purple diamond panels',
};

export function buildJokerTattooPrompt(
  style: JokerStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original Joker tattoo design as standalone tattoo flash on a plain light background.',
    `Visual direction: ${directions[style]}.`,
    idea ? `Personal detail: ${idea}.` : null,
    'Use original jester, theatre-mask or playing-card imagery. Do not depict a named comic, film or game character, actor likeness, franchise logo or copyrighted costume.',
    'Give the artwork a clean tattoo-friendly silhouette and practical line spacing. Show artwork only: no body mockup, no extra lettering, no watermark. A tattoo artist should adapt the final details, size and line weight for the placement.',
  ]
    .filter(Boolean)
    .join(' ');
}
