"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { WishModal } from "@/components/WishModal";
import { IntroEmailSender } from "@/components/IntroEmailSender";
import { EnableNotifications } from "@/components/EnableNotifications";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LoadingHourglass } from "@/components/LoadingHourglass";
import type { Contact, Vibe, Channel } from "@/types";
import { InviteUser } from "@/components/InviteUser";

const VIBES: { value: Vibe; label: string }[] = [
  { value: "warm-family", label: "Warm / Family" },
  { value: "funny-close", label: "Funny / Close friend" },
  { value: "sweet", label: "Sweet" },
  { value: "formal", label: "Formal" },
  { value: "minimal", label: "Minimal" },
];

// const CHANNELS: { value: Channel; label: string }[] = [
//   { value: "email", label: "Email" },
//   { value: "whatsapp", label: "WhatsApp" },
//   { value: "instagram", label: "Instagram" },
//   { value: "snapchat", label: "Snapchat" },
// ];

function daysUntilNextBirthday(birthDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [, month, day] = birthDate.split("-").map(Number);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/contacts` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <p className="font-sans text-sm text-muted">
        Check {email} for a sign-in link.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-full border border-(--color-border)/25 bg-paper px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-rust sm:w-auto sm:flex-1"
      />
      <button
        type="submit"
        className="w-full rounded-full bg-gold px-6 py-2.5 font-sans text-sm text-paper transition-opacity hover:opacity-90 sm:w-auto"
      >
        Send sign-in link
      </button>
      {error && <p className="font-sans text-xs text-red-700">{error}</p>}
    </form>
  );
}

function AddContactForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [relationship, setRelationship] = useState("");
  const [vibe, setVibe] = useState<Vibe>("warm-family");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // function toggleChannel(c: Channel) {
  //   setChannels((prev) =>
  //     prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
  //   );
  // }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    if (!user_id) {
      setError("You need to be signed in.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("contacts").insert({
      user_id,
      name,
      nickname: nickname || null,
      birth_date: birthDate,
      relationship,
      vibe,
      phone: phone || null,
      email: email || null,
      preferred_channels: channels,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    setNickname("");
    setBirthDate("");
    setRelationship("");
    setVibe("warm-family");
    setChannels([]);
    setPhone("");
    setEmail("");
    onAdded();
  }

  const inputClass =
    "w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2.5 font-sans text-base text-ink outline-none focus:border-rust sm:text-sm";
  const labelClass = "mb-1 block font-sans text-xs tracking-[0.1em] text-muted";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 rounded-2xl border border-(--color-border)/12 p-4 sm:grid-cols-2 sm:p-6"
      style={{ background: "var(--color-paper)" }}
    >
      <div>
        <label className={labelClass}>NAME</label>
        <input
          required
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />
      </div>
      <div>
        <label className={labelClass}>NICKNAME (OPTIONAL)</label>
        <input
          className={inputClass}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="What you call them"
        />
      </div>
      <div>
        <label className={labelClass}>BIRTHDAY</label>
        <input
          required
          type="date"
          className={inputClass}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>RELATIONSHIP</label>
        <input
          required
          className={inputClass}
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="How you know them"
        />
      </div>
      <div>
        <label className={labelClass}>VIBE / TEMPLATE STYLE</label>
        <select
          className={inputClass}
          value={vibe}
          onChange={(e) => setVibe(e.target.value as Vibe)}
        >
          {VIBES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>EMAIL (OPTIONAL)</label>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Their email address"
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>PHONE (OPTIONAL, FOR WHATSAPP)</label>
        <input
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="With country code"
        />
      </div>

      {error && (
        <p className="font-sans text-xs text-red-700 sm:col-span-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-gold px-6 py-3 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50 sm:col-span-2"
      >
        {saving ? "Saving..." : "Add birthday"}
      </button>
    </form>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M8 15c.6-1 1.4-1 2 0s1.4 1 2 0 1.4-1 2 0 1.4 1 2 0" />
    </svg>
  );
}

function NoContactsAdded() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-(--color-border)/12 px-4 py-8 text-center sm:py-10">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay/10 text-rust">
        <CalendarIcon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-sans text-sm text-ink">No one added yet</p>
        <p className="mt-1 font-sans text-xs text-muted">
          Use the form above to add your first birthday.
        </p>
      </div>
    </div>
  );
}

function ContactRow({
  contact,
  onWish,
  onUpdated,
  onDelete,
}: {
  contact: Contact;
  onWish: () => void;
  onUpdated: () => void;
  onDelete: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(contact.name);
  const [nickname, setNickname] = useState(contact.nickname ?? "");
  const [birthDate, setBirthDate] = useState(contact.birthDate);
  const [relationship, setRelationship] = useState(contact.relationship);
  const [vibe, setVibe] = useState<Vibe>(contact.vibe);
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2.5 font-sans text-base text-ink outline-none focus:border-rust sm:text-sm";
  const labelClass = "mb-1 block font-sans text-xs tracking-[0.1em] text-muted";

  function cancelEdit() {
    setName(contact.name);
    setNickname(contact.nickname ?? "");
    setBirthDate(contact.birthDate);
    setRelationship(contact.relationship);
    setVibe(contact.vibe);
    setPhone(contact.phone ?? "");
    setEmail(contact.email ?? "");
    setError(null);
    setEditing(false);
  }

  async function saveEdit() {
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    if (!birthDate) {
      setError("Birthday is required.");
      return;
    }
    if (!relationship.trim()) {
      setError("Relationship can't be empty.");
      return;
    }

    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("contacts")
      .update({
        name: name.trim(),
        nickname: nickname.trim() || null,
        birth_date: birthDate,
        relationship: relationship.trim(),
        vibe,
        phone: phone.trim() || null,
        email: email.trim() || null,
      })
      .eq("id", contact.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    onUpdated();
  }

  const days = daysUntilNextBirthday(contact.birthDate);
  const when =
    days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `in ${days} days`;

  if (editing) {
    return (
      <div
        className="grid gap-3 rounded-xl border border-rust/30 p-4"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>NAME</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>NICKNAME</label>
            <input
              className={inputClass}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>BIRTHDAY</label>
            <input
              type="date"
              className={inputClass}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>RELATIONSHIP</label>
            <input
              className={inputClass}
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>VIBE</label>
            <select
              className={inputClass}
              value={vibe}
              onChange={(e) => setVibe(e.target.value as Vibe)}
            >
              {VIBES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>EMAIL</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>PHONE</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="font-sans text-xs text-red-700">{error}</p>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={saveEdit}
            disabled={saving}
            className="w-full rounded-full bg-gold px-5 py-2.5 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={cancelEdit}
            className="w-full rounded-full border border-(--color-border)/25 px-5 py-2.5 font-sans text-sm text-ink sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-(--color-border)/12 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {contact.photoUrl ? (
          <img
            src={contact.photoUrl}
            alt={contact.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/10 font-sans text-[10px] text-muted">
            {(contact.nickname || contact.name).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-sans text-sm text-ink">
            {contact.nickname || contact.name}
          </p>
          <p className="truncate font-sans text-xs text-muted">
            {contact.relationship} &middot; {when}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:justify-end">
        <span className="rounded-full border border-rust/40 px-3 py-1 font-sans text-xs whitespace-nowrap text-rust">
          {VIBES.find((v) => v.value === contact.vibe)?.label}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(true)}
            className="font-sans text-xs whitespace-nowrap text-rust hover:underline"
          >
            Edit
          </button>
          {confirmingDelete ? (
            <span className="flex items-center gap-2">
              <button
                onClick={onDelete}
                className="font-sans text-xs whitespace-nowrap text-red-700 hover:underline"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="font-sans text-xs whitespace-nowrap text-muted hover:underline"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="font-sans text-xs whitespace-nowrap text-muted hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>

        <button
          onClick={onWish}
          className="w-full shrink-0 rounded-full bg-gold px-3 py-1.5 font-sans text-xs text-paper transition-opacity hover:opacity-90 sm:w-auto sm:py-1"
        >
          Wish now
        </button>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const loadContacts = useCallback(async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("birth_date");
    if (data) {
      setContacts(
        data.map((row) => ({
          id: row.id,
          name: row.name,
          nickname: row.nickname ?? undefined,
          birthDate: row.birth_date,
          relationship: row.relationship,
          vibe: row.vibe,
          phone: row.phone ?? undefined,
          email: row.email ?? undefined,
          photoUrl: row.photo_url ?? undefined,
          introSentAt: row.intro_sent_at ?? undefined,
          preferredChannels: row.preferred_channels ?? [],
          createdAt: row.created_at,
        })),
      );
    }
  }, []);

  async function handleDelete(id: string) {
    await supabase.from("contacts").delete().eq("id", id);
    loadContacts();
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        window.history.replaceState({}, "", "/contacts");
      });
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) loadContacts();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) loadContacts();
    });
    return () => sub.subscription.unsubscribe();
  }, [loadContacts]);

  const [wishTarget, setWishTarget] = useState<Contact | null>(null);

  const sorted = [...contacts].sort(
    (a, b) =>
      daysUntilNextBirthday(a.birthDate) - daysUntilNextBirthday(b.birthDate),
  );

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16">
      <AmbientBackground />
      <h1 className="font-display text-2xl text-ink sm:text-4xl">People</h1>
      <p className="mt-2 font-sans text-sm text-muted">
        The people you don&apos;t want to forget.
      </p>

      <div className="mt-8 sm:mt-10">
        {loading || !minDelayDone ? (
          <LoadingHourglass />
        ) : !session ? (
          <div className="rounded-2xl border border-(--color-border)/12 p-4 sm:p-6">
            <p className="mb-4 font-sans text-sm text-muted">
              Sign in to add and see your birthdays &mdash; no password, just a
              link sent to your email.
            </p>
            <SignIn />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <EnableNotifications />
            </div>
            <InviteUser session={session} />
            <IntroEmailSender contacts={contacts} onUpdated={loadContacts} />
            <AddContactForm onAdded={loadContacts} />
            <div className="mt-8 space-y-3 sm:mt-10">
              <p className="font-sans text-xs tracking-[0.15em] text-muted">
                UPCOMING
              </p>
              {sorted.length === 0 ? (
                <NoContactsAdded />
              ) : (
                sorted.map((c) => (
                  <ContactRow
                    key={c.id}
                    contact={c}
                    onWish={() => setWishTarget(c)}
                    onUpdated={loadContacts}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {wishTarget && (
        <WishModal contact={wishTarget} onClose={() => setWishTarget(null)} />
      )}
    </main>
  );
}
