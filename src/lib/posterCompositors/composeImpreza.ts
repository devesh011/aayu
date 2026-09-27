// lib/posterCompositors/composeImpreza.ts
//
// "Brand Poster" design — name, role/relationship, and date laid out
// around a large centered photo, matching the Impreza reference image.
// NOT YET BUILT — this is a stub so the registry and dropdown work end
// to end. Ask to have this one built when ready; I'll need to see the
// reference image again to match layout/colors precisely.

import type { PosterFont } from "../posterFonts";

export async function composeImprezaPoster(_opts: {
  photoBuffer: Buffer;
  recipientName: string;
  fontFamily?: PosterFont;
}): Promise<Buffer> {
  throw new Error(
    "The Brand Poster design isn't built yet — ask to have it built.",
  );
}
