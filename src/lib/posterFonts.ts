// lib/posterFonts.ts
//
// Single source of truth for available poster fonts. No native imports
// here on purpose — this file gets imported by both the client
// (WishModal's dropdown) and the server (composePolaroid.ts), and
// @napi-rs/canvas must never end up in the client bundle.
//
// To add a font: drop the .ttf in assets/fonts/ named to match `value`
// exactly, then add an entry here. No other code needs to change.

export const FONT_OPTIONS = [
  { value: "AlexBrush-Regular", label: "Alex Brush (elegant script)" },
  { value: "Playball-Regular", label: "Playball (rounded script)" },
  { value: "Caveat-Regular", label: "Caveat Regular (handwriting)" },
  { value: "Caveat-Medium", label: "Caveat Medium (handwriting)" },
  { value: "Caveat-SemiBold", label: "Caveat SemiBold (handwriting)" },
  { value: "Caveat-Bold", label: "Caveat Bold (handwriting)" },
] as const;

export type PosterFont = (typeof FONT_OPTIONS)[number]["value"];

export const DEFAULT_POSTER_FONT: PosterFont = "AlexBrush-Regular";

export function isPosterFont(value: string): value is PosterFont {
  return FONT_OPTIONS.some((f) => f.value === value);
}
