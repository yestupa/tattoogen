export type ButterflyStyle =
  | 'butterfly_tree'
  | 'fine_line'
  | 'blackwork'
  | 'floral'
  | 'watercolor';

const directions: Record<ButterflyStyle, string> = {
  butterfly_tree:
    'a slender tree with flowing branches and individual butterflies forming an airy crown, clear wing outlines and generous spacing',
  fine_line:
    'one graceful butterfly with delicate fine-line wing veins and clean negative space',
  blackwork:
    'a symmetrical butterfly with bold blackwork wing edges, strong contrast and readable open details',
  floral:
    'two butterflies in a floral composition following a gently curving flowering branch, balanced blossoms and fine botanical linework',
  watercolor:
    'a butterfly tree with restrained dusty-purple and blush watercolor accents inside the wings, anchored by fine black branches',
};

export function buildButterflyTattooPrompt(
  style: ButterflyStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original butterfly tattoo design as standalone tattoo flash on a plain light background.',
    `Style direction: ${directions[style]}.`,
    'Keep each butterfly silhouette legible at tattoo size. Preserve enough space between fine wing veins and between botanical elements.',
    idea ? `Personal detail: ${idea}.` : null,
    'Show only the artwork, not a body mockup, product photograph, text or watermark. A professional tattoo artist should adapt line weight, scale and placement before tattooing.',
  ]
    .filter(Boolean)
    .join(' ');
}
