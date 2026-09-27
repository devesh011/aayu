"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getAuthHeader } from "@/lib/authHeader";
import type { Contact, Vibe } from "@/types";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LoadingHourglass } from "@/components/LoadingHourglass";

const VIBES: { value: Vibe; label: string }[] = [
  { value: "warm-family", label: "Warm / Family" },
  { value: "funny-close", label: "Funny / Close friend" },
  { value: "sweet", label: "Sweet" },
  { value: "formal", label: "Formal" },
  { value: "minimal", label: "Minimal" },
  { value: "photo-poster", label: "Photo Poster (Polaroid)" },
];

function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/generate` },
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

export default function GeneratePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [vibe, setVibe] = useState<Vibe>("warm-family");
  const [language, setLanguage] = useState<"english" | "hindi" | "gujarati">(
    "english",
  );
  const [tone, setTone] = useState<
    "" | "savage" | "wholesome" | "nostalgic" | "filmy" | "shayari" | "hype"
  >("");
  const [customPrompt, setCustomPrompt] = useState("");

  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [templateName, setTemplateName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
          introSentAt: row.intro_sent_at ?? undefined,
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

  function handleContactPick(id: string) {
    setSelectedContactId(id);
    if (!id) return;
    const c = contacts.find((c) => c.id === id);
    if (c) {
      setName(c.nickname || c.name);
      setRelationship(c.relationship);
      setVibe(c.vibe);
    }
  }

  async function generate() {
    if (!name.trim() || !relationship.trim()) {
      setGenError("Name and relationship are required.");
      return;
    }
    setGenerating(true);
    setGenError(null);
    setMessage("");
    try {
      const res = await fetch("/api/generate-message", {
        method: "POST",
        headers: await getAuthHeader(),
        body: JSON.stringify({
          name,
          relationship,
          vibe,
          language,
          tone: tone || undefined,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setMessage(data.message);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function saveAsTemplate() {
    if (!templateName.trim() || !message.trim()) return;
    setSaving(true);
    setSaveStatus(null);
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    if (!user_id) {
      setSaveStatus("You need to be signed in.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("templates").insert({
      user_id,
      name: templateName,
      vibe,
      subject: "Happy Birthday {{name}}! 🎉",
      body: message,
    });
    setSaving(false);
    if (error) {
      setSaveStatus(`Failed: ${error.message}`);
      return;
    }
    setSaveStatus("Saved — you'll find it on the Templates page.");
    setTemplateName("");
  }

  const inputClass =
    "w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust";
  const labelClass = "mb-1 block font-sans text-xs tracking-[0.1em] text-muted";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16">
      <AmbientBackground />
      <h1 className="font-display text-2xl text-ink sm:text-4xl">
        AI Messages
      </h1>
      <p className="mt-2 font-sans text-sm text-muted">
        Generate a personalized birthday message instead of writing one from
        scratch.
      </p>

      <div className="mt-8 sm:mt-10">
        {loading || !minDelayDone ? (
          <LoadingHourglass />
        ) : !session ? (
          <div className="rounded-2xl border border-(--color-border)/12 p-4 sm:p-6">
            <p className="mb-4 font-sans text-sm text-muted">
              Sign in to generate messages.
            </p>
            <SignIn />
          </div>
        ) : (
          <div className="grid gap-4 rounded-2xl border border-(--color-border)/12 p-4 sm:p-6">
            {contacts.length > 0 && (
              <div>
                <label className={labelClass}>
                  PICK A SAVED CONTACT (OPTIONAL)
                </label>
                <select
                  className={inputClass}
                  value={selectedContactId}
                  onChange={(e) => handleContactPick(e.target.value)}
                >
                  <option value="">— type someone in manually —</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nickname || c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>NAME</label>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name"
                />
              </div>
              <div>
                <label className={labelClass}>RELATIONSHIP</label>
                <input
                  className={inputClass}
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="How do you know them?"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>EMAIL VIBE</label>
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
                <label className={labelClass}>LANGUAGE</label>
                <select
                  className={inputClass}
                  value={language}
                  onChange={(e) =>
                    setLanguage(
                      e.target.value as "english" | "hindi" | "gujarati",
                    )
                  }
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="gujarati">Gujarati</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>MESSAGE TONE</label>
                <select
                  className={inputClass}
                  value={tone}
                  onChange={(e) =>
                    setTone(
                      e.target.value as
                        | ""
                        | "savage"
                        | "wholesome"
                        | "nostalgic"
                        | "filmy"
                        | "shayari"
                        | "hype",
                    )
                  }
                >
                  <option value="">Match the vibe above</option>
                  <option value="wholesome">Extra Wholesome</option>
                  <option value="savage">Savage / Roast</option>
                  <option value="nostalgic">Nostalgic</option>
                  <option value="filmy">Filmy / Dramatic</option>
                  <option value="shayari">Shayari / Poetic</option>
                  <option value="hype">Hype / Motivational</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                ANYTHING ELSE? (OPTIONAL — WRITE YOUR OWN PROMPT)
              </label>
              <textarea
                rows={3}
                className={inputClass}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={`e.g. "mention that we haven't met in 2 years", "keep it under 3 lines", "reference that she loves cats"`}
              />
            </div>

            <button
              onClick={generate}
              disabled={generating}
              className="w-full rounded-full bg-gold px-6 py-2.5 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-fit"
            >
              {generating ? "Generating..." : "Generate message"}
            </button>

            {genError && (
              <p className="font-sans text-xs text-red-700">{genError}</p>
            )}

            {message && (
              <>
                <div>
                  <label className={labelClass}>
                    GENERATED MESSAGE (EDIT FREELY)
                  </label>
                  <textarea
                    rows={5}
                    className={inputClass}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="rounded-xl bg-clay/8 p-4">
                  <label className={labelClass}>SAVE AS A TEMPLATE</label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <input
                      className={`${inputClass} w-full`}
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder={`Template name, e.g. "D3's message"`}
                    />
                    <button
                      onClick={saveAsTemplate}
                      disabled={saving || !templateName.trim()}
                      className="w-full shrink-0 rounded-full bg-gold px-5 py-2 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                  {saveStatus && (
                    <p className="mt-2 font-sans text-xs text-muted">
                      {saveStatus}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
