// components/InviteUser.tsx
//
// Only renders for the app owner — checked client-side against
// NEXT_PUBLIC_OWNER_EMAIL, purely so nobody else even sees this box.
// Real enforcement happens server-side in /api/invite-user, which
// re-checks against OWNER_EMAIL independently — this component hiding
// itself is a UX nicety, not the actual security boundary.

"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAuthHeader } from "@/lib/authHeader";

export function InviteUser({ session }: { session: Session | null }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
  const isOwner =
    !!session?.user.email &&
    !!ownerEmail &&
    session.user.email.toLowerCase() === ownerEmail.toLowerCase();

  if (!isOwner) return null;

  async function sendInvite() {
    if (!email.trim()) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/invite-user", {
        method: "POST",
        headers: await getAuthHeader(),
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send invite");
      setStatus(`Invited ${email.trim()}.`);
      setEmail("");
    } catch (err) {
      setStatus(
        `Failed: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-(--color-border)/12 p-4 sm:p-6">
      <p className="font-sans text-sm text-ink">Invite someone</p>
      <p className="mt-1 font-sans text-xs text-muted">
        They&apos;ll get their own private, empty account &mdash; not access to
        yours.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="their@email.com"
          className="w-full rounded-full border border-(--color-border)/25 bg-paper px-4 py-2 font-sans text-sm text-ink outline-none focus:border-rust sm:w-auto sm:flex-1"
        />
        <button
          onClick={sendInvite}
          disabled={sending || !email.trim()}
          className="shrink-0 rounded-full bg-gold px-5 py-2 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Sending..." : "Invite"}
        </button>
      </div>
      {status && <p className="mt-2 font-sans text-xs text-muted">{status}</p>}
    </div>
  );
}
