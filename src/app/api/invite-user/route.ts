// app/api/invite-user/route.ts
//
// Only the app owner (matched by email against OWNER_EMAIL) can invite
// new people. Uses Supabase's admin inviteUserByEmail, which creates the
// account and emails them an invite link directly — this works even with
// public signups disabled in Supabase, since it's an admin action, not
// self-registration.

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { user, error: authError } = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    return NextResponse.json(
      { error: "OWNER_EMAIL is not set on the server" },
      { status: 500 },
    );
  }

  if (user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
    return NextResponse.json(
      { error: "Only the app owner can invite people" },
      { status: 403 },
    );
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
