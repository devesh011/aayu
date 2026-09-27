// lib/posterCompositors/composeBwBold.ts
//
// "B&W Bold" design — grayscale hero photo, huge "HAPPY BIRTHDAY" type,
// small taped photo inset, matching the reference image.
// NOT YET BUILT — stub only.

import type { PosterFont } from "../posterFonts";

export async function composeBwBoldPoster(_opts: {
  photoBuffer: Buffer;
  recipientName: string;
  fontFamily?: PosterFont;
}): Promise<Buffer> {
  throw new Error(
    "The B&W Bold design isn't built yet — ask to have it built.",
  );
}
