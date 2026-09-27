// lib/posterCompositors/index.ts
//
// Registry mapping a PosterStyle id to its compositor function. The API
// route imports ONLY this file — never the individual compositors — so
// adding a new design later means: build the file, add one line here.

import type { PosterStyle } from "../posterStyles";
import type { PosterFont } from "../posterFonts";
import { composePolaroidPoster } from "./composePolaroid";
import { composeImprezaPoster } from "./composeImpreza";
import { composeBwBoldPoster } from "./composeBwBold";
import { composeButterflyPoster } from "./composeButterfly";

type Compositor = (opts: {
  photoBuffer: Buffer;
  recipientName: string;
  fontFamily?: PosterFont;
  // Optional AI-generated background image. Only composePolaroidPoster
  // currently uses it — other compositors simply ignore the field, which
  // is safe since it's optional.
  backgroundImageBuffer?: Buffer;
}) => Promise<Buffer>;

export const POSTER_COMPOSITORS: Record<PosterStyle, Compositor> = {
  polaroid: composePolaroidPoster,
  impreza: composeImprezaPoster,
  "bw-bold": composeBwBoldPoster,
  butterfly: composeButterflyPoster,
};
