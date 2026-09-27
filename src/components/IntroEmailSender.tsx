// components/IntroEmailSender.tsx
//
// Drop this into the People page (ContactsPage), above or below the
// contacts list. Loops through contacts that have an email on file and
// haven't already received the intro email, sending one at a time with a
// delay in between — never all at once, to avoid looking like a spam
// blast and to stay under Gmail SMTP's rate limits.

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeader } from "@/lib/authHeader";
import type { Contact } from "@/types";

const DELAY_MS = 2500; // gap between sends

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function IntroEmailSender({
  contacts,
  onUpdated,
}: {
  contacts: Contact[];
  onUpdated: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [failures, setFailures] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const pending = contacts.filter((c) => c.email && !c.introSentAt);

  async function sendAll() {
    setConfirming(false);
    setSending(true);
    setFailures([]);
    setProgress({ done: 0, total: pending.length });

    const failed: string[] = [];

    for (let i = 0; i < pending.length; i++) {
      const contact = pending[i];
      const recipientName = contact.nickname || contact.name;

      try {
        const res = await fetch("/api/send-intro-email", {
          method: "POST",
          headers: await getAuthHeader(),
          body: JSON.stringify({ to: contact.email, recipientName }),
        });
        if (!res.ok) throw new Error("send failed");

        await supabase
          .from("contacts")
          .update({ intro_sent_at: new Date().toISOString() })
          .eq("id", contact.id);
      } catch {
        failed.push(recipientName);
      }

      setProgress({ done: i + 1, total: pending.length });

      if (i < pending.length - 1) {
        await sleep(DELAY_MS);
      }
    }

    setFailures(failed);
    setSending(false);
    onUpdated();
  }

  if (pending.length === 0) {
    return null; // nothing left to introduce — section disappears on its own
  }

  return (
    <div className="mb-6 rounded-2xl border border-(--color-border)/12 p-4 sm:p-6">
      <p className="font-sans text-sm text-ink">
        {pending.length} contact{pending.length === 1 ? "" : "s"} haven&apos;t
        gotten the one-time heads-up email yet.
      </p>
      <p className="mt-1 font-sans text-xs text-muted">
        Sends one at a time, a few seconds apart &mdash; not all at once. Each
        contact only ever gets this once.
      </p>

      {!sending && !confirming && (
        <button
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-full bg-gold px-5 py-2 font-sans text-sm text-paper transition-opacity hover:opacity-90"
        >
          Send intro emails
        </button>
      )}

      {confirming && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="font-sans text-xs text-muted">
            Send to all {pending.length}? This can&apos;t be undone per contact.
          </p>
          <button
            onClick={sendAll}
            className="rounded-full bg-gold px-4 py-1.5 font-sans text-xs text-paper hover:opacity-90"
          >
            Yes, send
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-full border border-(--color-border)/25 px-4 py-1.5 font-sans text-xs text-ink"
          >
            Cancel
          </button>
        </div>
      )}

      {sending && progress && (
        <p className="mt-3 font-sans text-xs text-muted">
          Sending... {progress.done} of {progress.total}
        </p>
      )}

      {!sending && failures.length > 0 && (
        <p className="mt-3 font-sans text-xs text-red-700">
          Failed for: {failures.join(", ")}. You can try again &mdash; contacts
          who already succeeded won&apos;t be re-sent.
        </p>
      )}
    </div>
  );
}
