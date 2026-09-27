import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { getEmailTemplate } from "@/lib/emailTemplates";
import type { Vibe } from "@/types";
import { requireUser } from "@/lib/requireUser";

// Gmail threads messages together when the subject + participants match.
// Repeated test sends (or any accidental duplicate) collapse into one
// conversation, making a new message look "blank" until the trimmed-
// content toggle is clicked. Appending a few invisible zero-width spaces
// makes each subject byte-for-byte unique to Gmail's threading logic
// while looking completely unchanged to the recipient.
function dethreadSubject(subject: string): string {
  const invisible = "\u200B".repeat(1 + Math.floor(Math.random() * 6));
  return `${subject}${invisible}`;
}

export async function POST(req: Request) {
  const { user, error: authError } = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { to, subject, body, recipientName, vibe, photoUrl } = await req.json();

  if (!to || !subject || !body) {
    return NextResponse.json(
      { error: "Missing to, subject, or body" },
      { status: 400 },
    );
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return NextResponse.json(
      { error: "GMAIL_USER or GMAIL_APP_PASSWORD is not set on the server" },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    await transporter.sendMail({
      from: `Aayu <${gmailUser}>`,
      to,
      subject: dethreadSubject(subject),
      text: body,
      html: getEmailTemplate((vibe as Vibe) ?? "warm-family")(
        recipientName || "you",
        body,
        undefined,
        photoUrl,
      ),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
