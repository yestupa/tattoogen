export type KaiserStyle =
  | 'blue_rose'
  | 'fine_line'
  | 'thornwork'
  | 'crown'
  | 'watercolor';

const styleDirections: Record<KaiserStyle, string> = {
  blue_rose:
    'a vivid cobalt-blue rose as the focal point, with layered petals and black thorn vines flowing beneath it',
  fine_line:
    'a delicate fine-line blue rose with airy petals, slender thorn vines and ample negative space',
  thornwork:
    'dramatic blackwork thorn vines winding around a restrained blue rose accent, with clear tattoo-ready contrast',
  crown:
    'a balanced crown and keyhole beneath a blue rose, framed by restrained thorn vines',
  watercolor:
    'a blue watercolor rose with soft cobalt washes and crisp fine-line thorn details',
};

export function buildKaiserTattooPrompt(
  style: KaiserStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original independent fan-inspired Kaiser tattoo design as standalone tattoo flash on a plain light background.',
    'Use the blue rose, thorn vines, crown or keyhole as visual motifs; no official logos or character portrait.',
    `Style direction: ${styleDirections[style]}.`,
    idea ? `Personal idea: ${idea}` : null,
    'Show the design alone, not a body mockup, product photo, or watermark. Review final size, color, line weight and placement with a professional tattoo artist before tattooing.',
  ]
    .filter(Boolean)
    .join(' ');
}
