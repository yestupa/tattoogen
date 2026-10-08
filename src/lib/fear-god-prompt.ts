export type FearGodStyle = 'gothic' | 'script' | 'minimal' | 'cross' | 'hands';

const styleDirections: Record<FearGodStyle, string> = {
  gothic:
    'bold blackletter lettering with deliberate thick strokes and restrained gothic flourishes',
  script:
    'flowing script lettering with graceful connected strokes and balanced flourishes',
  minimal:
    'minimal high-contrast serif lettering with generous spacing and a small understated cross',
  cross:
    'a centered ornamental cross above clear serif lettering, with subtle rays and balanced botanical accents',
  hands:
    'engraved praying hands above a ribbon carrying the lettering, with restrained devotional ornament',
};

export function buildFearGodTattooPrompt(
  style: FearGodStyle,
  personalIdea: string
): string {
  const idea = personalIdea.trim();
  return [
    'Create an original Fear God tattoo design as black-ink tattoo flash on a plain light background.',
    'The only lettering must read exactly FEAR GOD, in that order and spelling. Keep every letter clear and legible; do not add any other words.',
    `Style direction: ${styleDirections[style]}.`,
    idea ? `Personal idea: ${idea}` : null,
    'Show the design alone, not a body mockup, product photo, or watermark. Treat the image as a concept: verify the spelling, scale, and orientation with a tattoo artist before tattooing.',
  ]
    .filter(Boolean)
    .join(' ');
}
