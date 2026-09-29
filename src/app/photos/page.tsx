"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { SignIn } from "@/components/SignIn";
import { uploadContactPhoto } from "@/lib/uploadPhoto";
import type { Contact } from "@/types";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LoadingHourglass } from "@/components/LoadingHourglass";

function PhotoIcon({ className }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 15l4.5-4.5a2 2 0 0 1 2.8 0L15 15" />
      <path d="M13.5 13.5L15.5 11.5a2 2 0 0 1 2.8 0L21 14" />
      <circle cx="8" cy="9" r="1.5" />
    </svg>
  );
}

function NoContactsYet() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-(--color-border)/12 px-4 py-8 text-center sm:py-10">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay/10 text-rust">
        <PhotoIcon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-sans text-sm text-ink">No contacts yet</p>
        <p className="mt-1 font-sans text-xs text-muted">
          Add someone on the People page first, then come back to set their
          photo.
        </p>
      </div>
      <a
        href="/contacts"
        className="mt-1 w-full rounded-full bg-gold px-5 py-2.5 text-center font-sans text-xs text-paper transition-opacity hover:opacity-90 sm:w-auto sm:py-2"
      >
        Go to People
      </a>
    </div>
  );
}

function ContactPhotoRow({
  contact,
  onUpdated,
}: {
  contact: Contact;
  onUpdated: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadContactPhoto(file);
      const { error } = await supabase
        .from("contacts")
        .update({ photo_url: url })
        .eq("id", contact.id);
      if (error) throw new Error(error.message);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setUploading(true);
    setError(null);
    const { error } = await supabase
      .from("contacts")
      .update({ photo_url: null })
      .eq("id", contact.id);
    setUploading(false);
    if (error) setError(error.message);
    else onUpdated();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-(--color-border)/12 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {contact.photoUrl ? (
          <img
            src={contact.photoUrl}
            alt={contact.name}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-clay/10 font-sans text-lg text-muted">
            {(contact.nickname || contact.name).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-sans text-sm text-ink">
            {contact.nickname || contact.name}
          </p>
          <p className="truncate font-sans text-xs text-muted">
            {contact.relationship}
          </p>
          {error && (
            <p className="mt-1 font-sans text-xs text-red-700">{error}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          disabled={uploading}
          className="hidden"
          id={`photo-${contact.id}`}
        />
        <label
          htmlFor={`photo-${contact.id}`}
          className="cursor-pointer rounded-full bg-gold px-4 py-1.5 font-sans text-xs text-paper transition-opacity hover:opacity-90"
        >
          {uploading ? "Uploading..." : contact.photoUrl ? "Replace" : "Upload"}
        </label>
        {contact.photoUrl && (
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="font-sans text-xs text-muted hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function PhotosPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const loadContacts = useCallback(async () => {
    const { data } = await supabase.from("contacts").select("*").order("name");
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
          preferredChannels: row.preferred_channels ?? [],
          createdAt: row.created_at,
        })),
      );
    }
  }, []);

  useEffect(() => {
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <AmbientBackground />
      <h1 className="font-display text-2xl text-ink sm:text-4xl">Photos</h1>
      <p className="mt-2 font-sans text-sm text-muted">
        Set a photo for each person once &mdash; it&apos;s used automatically
        every time you send them a wish.
      </p>

      <div className="mt-8 sm:mt-10">
        {loading || !minDelayDone ? (
          <LoadingHourglass />
        ) : !session ? (
          <div className="rounded-2xl border border-(--color-border)/12 p-4 sm:p-6">
            <p className="mb-4 font-sans text-sm text-muted">
              Sign in to manage photos.
            </p>
            <SignIn redirectPath="/photos" />
          </div>
        ) : contacts.length === 0 ? (
          <NoContactsYet />
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <ContactPhotoRow
                key={c.id}
                contact={c}
                onUpdated={loadContacts}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
