export type GhostFaceStyle =
  | 'black_grey'
  | 'fine_line'
  | 'blackwork'
  | 'sketch'
  | 'black_crimson';

const directions: Record<GhostFaceStyle, string> = {
  black_grey:
    'black-and-grey stipple shading on the hood around an elongated pale ghostly mask, drooping eye sockets, an oval mouth and clear negative space',
  fine_line:
    'fine-line contours of an elongated ghostly mask and lightly outlined hood, with delicate facial details and generous open space',
  blackwork:
    'bold blackwork hood folds framing a pale elongated mask, with strong graphic contrast and readable eye and mouth shapes',
  sketch:
    'loose ink sketch lines and crosshatching around a slightly tilted ghostly mask, with a hand-drawn hood and controlled shadows',
  black_crimson:
    'restrained deep-crimson accents in the hood folds around a black-and-grey ghostly mask, with the pale face remaining the focal point',
};

export function buildGhostFaceTattooPrompt(
  style: GhostFaceStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original ghostly mask tattoo design as standalone tattoo flash on a plain light background.',
    `Style direction: ${directions[style]}.`,
    'Keep the mask silhouette, eye sockets and oval mouth legible at tattoo size. Preserve space between dark hood folds and facial details.',
    idea ? `Personal detail: ${idea}.` : null,
    'Show only the artwork, not a body mockup, product photograph; no text or watermark. A tattoo artist should adapt line weight, scale and placement before tattooing.',
  ]
    .filter(Boolean)
    .join(' ');
}
