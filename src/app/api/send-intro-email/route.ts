// app/api/send-intro-email/route.ts
//
// Sends the one-time "heads up" email to a single contact. Called once
// per contact from the client, with a delay between calls (see the
// "Send intro emails" button on the People page) — never loops or
// batches server-side, so there's no serverless timeout risk and the
// UI can show live progress.

import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { introEmailTemplate } from "@/lib/emailTemplates";
import { requireUser } from "@/lib/requireUser";

function dethreadSubject(subject: string): string {
  const invisible = "\u200B".repeat(1 + Math.floor(Math.random() * 6));
  return `${subject}${invisible}`;
}

export async function POST(req: Request) {
  const { user, error: authError } = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { to, recipientName, senderName } = await req.json();

  if (!to || !recipientName) {
    return NextResponse.json(
      { error: "Missing to or recipientName" },
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
      subject: dethreadSubject("A quick heads-up from Aayu"),
      text: `Hi ${recipientName}, someone is using Aayu to send you birthday wishes going forward. If this lands in Spam, marking it "Not spam" helps future notes land properly. See you on your birthday!`,
      html: introEmailTemplate(recipientName, senderName),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
