export type WombStyle =
  | 'gothic'
  | 'fine-line'
  | 'floral'
  | 'neo-tribal'
  | 'celestial';

const styleDirections: Record<WombStyle, string> = {
  gothic:
    'a gothic heart with mirrored blackwork wings and fine ornamental tips',
  'fine-line': 'a delicate fine-line heart with airy, restrained wings',
  floral: 'a lotus and mirrored botanical vines with graceful flowing lines',
  'neo-tribal': 'a bold neo-tribal central sigil with sharp symmetrical curves',
  celestial: 'a crescent moon, small stars, and balanced ornamental wings',
};

export function buildWombTattooPrompt(
  style: WombStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original womb tattoo design as clean black-ink tattoo flash for the lower abdomen.',
    'Build a balanced, symmetrical composition around a clear centerline below the navel, with intentional negative space and a silhouette that can be discussed with a tattoo artist.',
    `Style direction: ${styleDirections[style]}.`,
    idea ? `Personal idea: ${idea}` : null,
    'Show the design alone on a plain light background. Avoid a body mockup, text, watermark, and surrounding objects.',
  ]
    .filter(Boolean)
    .join(' ');
}
