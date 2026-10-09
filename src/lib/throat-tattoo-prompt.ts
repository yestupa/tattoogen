export type ThroatTattooStyle =
  | 'ornamental'
  | 'blackwork_wings'
  | 'rose'
  | 'snake'
  | 'geometric';

const directions: Record<ThroatTattooStyle, string> = {
  ornamental:
    'symmetrical ornamental petals with dotwork shading, a wide upper silhouette and a tapered center below',
  blackwork_wings:
    'bold blackwork wings spreading laterally, with solid dark feather shapes and deliberate negative space',
  rose: 'a black-and-grey rose with layered petals and darker leaves forming a compact front-neck composition',
  snake:
    'one flowing snake with a continuous curve, readable scale details and a restrained vertical rhythm',
  geometric:
    'fine-line geometric arcs and diamond forms with precise symmetry, small dots and generous open space',
};

export function buildThroatTattooPrompt(
  style: ThroatTattooStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original tattoo design for the front of the neck as standalone tattoo flash on a plain light background.',
    `Style direction: ${directions[style]}.`,
    'Keep the central motif readable between the underside of the jaw and the shirt collar. Balance the upper width, lower taper and space around dark areas.',
    idea ? `Personal detail: ${idea}.` : null,
    'Show only the artwork, not a body mockup or product photograph; no text or watermark. A tattoo artist should adapt line weight, scale and placement to the individual before tattooing.',
  ]
    .filter(Boolean)
    .join(' ');
}
