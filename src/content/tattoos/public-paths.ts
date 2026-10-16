import { tattooDiscoveryPaths } from './catalog';

export const tattooToolPaths = [
  '/tattoo-tools',
  '/tattoo-font-generator',
  '/image-to-tattoo',
  '/tattoo-idea-generator',
  '/tattoo-cover-up',
  '/tattoo-filler',
  '/try-tattoo',
  '/tattoo-to-stencil',
] as const;

export function tattooPublicPaths() {
  return [...tattooDiscoveryPaths(), ...tattooToolPaths];
}
