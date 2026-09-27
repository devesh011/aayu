import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { daysUntilNextBirthday } from "@/lib/dates";

const TRIGGER_DAYS = [7, 1, 0] as const;

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function GET(req: Request) {
  // Vercel Cron automatically sends this header when CRON_SECRET is set
  // in your project's environment variables — this route rejects anyone
  // else trying to trigger it manually.
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json(
      { error: "VAPID keys are not set on the server" },
      { status: 500 },
    );
  }
  webpush.setVapidDetails("mailto:you@example.com", vapidPublic, vapidPrivate);

  const { data: contacts, error: contactsError } = await supabaseAdmin
    .from("contacts")
    .select("id, user_id, name, nickname, birth_date");

  if (contactsError) {
    return NextResponse.json({ error: contactsError.message }, { status: 500 });
  }

  const todayStart = startOfTodayISO();
  const results: Array<{ contact: string; daysBefore: number; sent: number }> =
    [];

  for (const contact of contacts ?? []) {
    const days = daysUntilNextBirthday(contact.birth_date);
    if (!TRIGGER_DAYS.includes(days as (typeof TRIGGER_DAYS)[number])) continue;

    // Skip if we've already sent this exact reminder today.
    const { data: existing } = await supabaseAdmin
      .from("notification_log")
      .select("id")
      .eq("contact_id", contact.id)
      .eq("days_before", days)
      .gte("sent_at", todayStart)
      .limit(1);

    if (existing && existing.length > 0) continue;

    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", contact.user_id);

    const displayName = contact.nickname || contact.name;
    const title =
      days === 0
        ? `${displayName}'s birthday is today!`
        : days === 1
          ? `${displayName}'s birthday is tomorrow`
          : `${displayName}'s birthday is in ${days} days`;

    let sentCount = 0;
    for (const sub of subscriptions ?? []) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title,
            body: "Tap to pick a template and wish them.",
            url: "/contacts",
          }),
        );
        sentCount++;
      } catch (err: unknown) {
        const statusCode =
          typeof err === "object" && err !== null && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        // 410 Gone / 404 means the subscription is dead — clean it up.
        if (statusCode === 410 || statusCode === 404) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    }

    if (sentCount > 0) {
      await supabaseAdmin.from("notification_log").insert({
        user_id: contact.user_id,
        contact_id: contact.id,
        days_before: days,
      });
    }

    results.push({ contact: displayName, daysBefore: days, sent: sentCount });
  }

  return NextResponse.json({
    ok: true,
    checked: contacts?.length ?? 0,
    results,
  });
}
