export type CoupleStyle =
  | 'sun_moon'
  | 'matching_hearts'
  | 'botanical'
  | 'swallows'
  | 'mountain_wave';

const directions: Record<CoupleStyle, string> = {
  sun_moon:
    'one fine-line sun and one crescent moon inside a subtle circular halo; balanced celestial linework',
  matching_hearts:
    'two matching fine-line hearts with the same outline, scale and line weight, each complete on its own',
  botanical:
    'two delicate botanical branches bending toward one another, with related leaves and mirrored direction',
  swallows:
    'two separate black-ink swallows facing one another, with distinct wings and forked tails',
  mountain_wave:
    'one mountain landscape and one ocean wave, each in its own fine-line circular frame of equal size',
};

export function buildCoupleTattooPrompt(
  style: CoupleStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original couple tattoo design as standalone tattoo flash on a plain light background.',
    'Show two separate, complete tattoo designs side by side. They should make sense individually and share a coherent line weight, scale and visual direction.',
    `Pair direction: ${directions[style]}.`,
    idea ? `Personal detail: ${idea}.` : null,
    'Leave clear space between the two designs. Show artwork only, not a body mockup, no text or watermark. A professional tattoo artist should adapt each design for the wearers and final placement.',
  ]
    .filter(Boolean)
    .join(' ');
}
