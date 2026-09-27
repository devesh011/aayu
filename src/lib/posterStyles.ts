// lib/posterStyles.ts
//
// Single source of truth for available poster designs. No native imports
// here — imported by both the client (WishModal's dropdown) and the
// server (the compose-photo route), same pattern as posterFonts.ts.
//
// To add a new design: build its compositor in lib/posterCompositors/,
// register it in lib/posterCompositors/index.ts, then add one entry here.

export const POSTER_STYLES = [
  { value: "polaroid", label: "Polaroid (tilted photo + tape)" },
  { value: "impreza", label: "Brand Poster (name + role + date)" },
  { value: "bw-bold", label: "B&W Bold (big type + photo collage)" },
  { value: "butterfly", label: "Butterfly Typographic" },
] as const;

export type PosterStyle = (typeof POSTER_STYLES)[number]["value"];

export const DEFAULT_POSTER_STYLE: PosterStyle = "polaroid";

export function isPosterStyle(value: string): value is PosterStyle {
  return POSTER_STYLES.some((s) => s.value === value);
}
