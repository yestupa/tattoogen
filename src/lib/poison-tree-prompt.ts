export type PoisonTreeStyle =
  | 'bare_tree'
  | 'fine_line'
  | 'blackwork'
  | 'poison_apple'
  | 'etching';

const styleDirections: Record<PoisonTreeStyle, string> = {
  bare_tree:
    'a balanced bare tree silhouette with branching canopy, weathered trunk and exposed roots',
  fine_line:
    'delicate fine-line branches, a slender trunk, airy negative space and lightly drawn roots',
  blackwork:
    'bold blackwork tree silhouette with strong contrast, tapered bare branches and sculptural roots',
  poison_apple:
    'a leafless black tree with one small red apple as a restrained symbolic focal point',
  etching:
    'an antique etching treatment with fine hatching in the bark, twisted branches and exposed roots',
};

export function buildPoisonTreeTattooPrompt(
  style: PoisonTreeStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original poison tree tattoo design as standalone tattoo flash on a plain light background.',
    'Build the composition around bare branches, a textured trunk and exposed roots. Keep the silhouette clear and tattoo-ready; use a red apple only when requested by the selected style or personal detail.',
    `Style direction: ${styleDirections[style]}.`,
    idea ? `Personal detail: ${idea}` : null,
    'Show the design alone, not a body mockup, product photograph, text, or watermark. A professional tattoo artist should adapt line weight, scale and placement before tattooing.',
  ]
    .filter(Boolean)
    .join(' ');
}
