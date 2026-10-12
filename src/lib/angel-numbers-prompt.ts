export type AngelNumberStyle =
  | '111'
  | '222'
  | '333'
  | '444'
  | '555'
  | '777'
  | '888'
  | '11:11';

const directions: Record<AngelNumberStyle, string> = {
  '111': 'three slender serif ones with a small star and two ink dots',
  '222': 'three clear serif twos framed by delicate olive branches',
  '333': 'three readable serif threes with a crescent, stars, and fine dotwork',
  '444':
    'three angular gothic fours in bold blackwork with open triangular counters',
  '555': 'three flowing serif fives with restrained curling lines beneath',
  '777':
    'three legible sevens between a balanced pair of fine-line feathered wings',
  '888': 'three open-counter serif eights above a rose and leafy branches',
  '11:11':
    'four ones separated by one colon, with a crescent, starbursts, and a dotted halo',
};

export function buildAngelNumbersTattooPrompt(
  style: AngelNumberStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original angel numbers tattoo design as standalone tattoo flash on a plain light background.',
    `Render the exact selected sequence: ${style}. Carefully verify the count, order and punctuation of every numeral; do not add or omit any digits.`,
    `Visual direction: ${directions[style]}.`,
    idea ? `Personal detail: ${idea}.` : null,
    'Give the numerals clear spacing and a tattoo-friendly silhouette. Show artwork only: no body mockup, no extra lettering, no watermark. The personal meaning belongs to the wearer; do not invent a universal meaning for the sequence. A tattoo artist should adapt the final line weight and size for the placement.',
  ]
    .filter(Boolean)
    .join(' ');
}
