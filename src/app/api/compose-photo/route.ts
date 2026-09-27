// app/api/compose-photo/route.ts
//
// Takes the contact's saved photoUrl + name + chosen font + chosen poster
// design, renders the poster via the matching compositor from the
// registry, uploads the finished PNG to storage, and returns its public
// URL. New designs never touch this file — only lib/posterCompositors/.

import { NextResponse } from "next/server";
import { POSTER_COMPOSITORS } from "@/lib/posterCompositors";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isPosterFont, DEFAULT_POSTER_FONT } from "@/lib/posterFonts";
import { requireUser } from "@/lib/requireUser";
import { isPosterStyle, DEFAULT_POSTER_STYLE } from "@/lib/posterStyles";

export async function POST(req: Request) {
  const { user, error: authError } = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { photoUrl, recipientName, fontFamily, posterStyle, backgroundUrl } =
    await req.json();

  if (!photoUrl || !recipientName) {
    return NextResponse.json(
      { error: "Missing photoUrl or recipientName" },
      { status: 400 },
    );
  }

  const resolvedFont =
    typeof fontFamily === "string" && isPosterFont(fontFamily)
      ? fontFamily
      : DEFAULT_POSTER_FONT;

  const resolvedStyle =
    typeof posterStyle === "string" && isPosterStyle(posterStyle)
      ? posterStyle
      : DEFAULT_POSTER_STYLE;

  try {
    const photoRes = await fetch(photoUrl);
    if (!photoRes.ok) throw new Error("Could not fetch the source photo");
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer());

    let backgroundImageBuffer: Buffer | undefined;
    if (typeof backgroundUrl === "string" && backgroundUrl) {
      const bgRes = await fetch(backgroundUrl);
      if (!bgRes.ok) throw new Error("Could not fetch the background image");
      backgroundImageBuffer = Buffer.from(await bgRes.arrayBuffer());
    }

    const compose = POSTER_COMPOSITORS[resolvedStyle];
    const composite = await compose({
      photoBuffer,
      recipientName,
      fontFamily: resolvedFont,
      backgroundImageBuffer,
    });

    const storagePath = `composites/${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("wish-photos")
      .upload(storagePath, composite, {
        contentType: "image/png",
        cacheControl: "31536000",
      });
    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabaseAdmin.storage
      .from("wish-photos")
      .getPublicUrl(storagePath);

    return NextResponse.json({ imageUrl: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
