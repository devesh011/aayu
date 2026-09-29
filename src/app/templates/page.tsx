"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { beastOfRage } from "@/lib/fonts";
import {
  renderTemplate,
  type Template,
  type Vibe,
  type Contact,
} from "@/types";
import { getEmailTemplate } from "@/lib/emailTemplates";
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

const SAMPLE_CONTACT: Contact = {
  id: "sample",
  name: "Sample Contact",
  nickname: "Friend",
  birthDate: "1998-04-12",
  relationship: "Close friend",
  vibe: "warm-family",
  preferredChannels: [],
  createdAt: "",
};

function getSignInErrorMessage(message: string): React.ReactNode {
  const isInviteOnly =
    /signup|sign.?up/i.test(message) && /not allowed|disabled/i.test(message);
  if (isInviteOnly) {
    return (
      <>
        This one&apos;s invite-only — links only go out to people close to{" "}
        <span className={`${beastOfRage.className} text-base tracking-wide`}>
          D3v8ll
        </span>
        . Reach out to him if you&apos;d like in.
      </>
    );
  }
  return message;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/templates` },
    });
    if (error) setError(getSignInErrorMessage(error.message));
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-full border border-(--color-border)/25 bg-paper px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-rust"
        />
        <button
          type="submit"
          className="rounded-full bg-gold px-6 py-2.5 font-sans text-sm text-paper transition-opacity hover:opacity-90"
        >
          Send sign-in link
        </button>
      </div>
      {error && <p className="font-sans text-xs text-red-700">{error}</p>}
    </form>
  );
}

function AllTemplatesPreview({
  recipientName,
  message,
}: {
  recipientName: string;
  message: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-sans text-xs text-rust hover:underline"
      >
        {open ? "Hide all designs" : `Compare all ${VIBES.length} designs`}
      </button>

      {open && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {VIBES.map((v) => (
            <div key={v.value}>
              <p className="mb-2 font-sans text-xs tracking-widest text-muted">
                {v.label.toUpperCase()}
              </p>
              <div className="overflow-hidden rounded-xl border border-(--color-border)/15">
                <iframe
                  title={`${v.label} preview`}
                  srcDoc={getEmailTemplate(v.value)(recipientName, message)}
                  className="h-85 w-full"
                  sandbox=""
                />
              </div>
              {v.value === "photo-poster" && (
                <p className="mt-1 font-sans text-[11px] text-muted">
                  Shows a placeholder here &mdash; the real poster only renders
                  from a contact&apos;s Wish screen, once generated from their
                  actual photo.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddTemplateForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState<Vibe>("warm-family");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const { error } = await supabase
      .from("templates")
      .insert({ user_id, name, vibe, subject, body });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    setVibe("warm-family");
    setSubject("");
    setBody("");
    onAdded();
  }

  const inputClass =
    "w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust";
  const labelClass = "mb-1 block font-sans text-xs tracking-[0.1em] text-muted";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-(--color-border)/12 p-4 sm:p-6"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>TEMPLATE NAME</label>
          <input
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Warm birthday note"
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
      </div>

      <div>
        <label className={labelClass}>
          SUBJECT &mdash; use {"{{name}}"} or {"{{relationship}}"}
        </label>
        <input
          required
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Happy Birthday {{name}}! 🎉"
        />
      </div>

      <div>
        <label className={labelClass}>BODY</label>
        <textarea
          required
          rows={4}
          className={inputClass}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hey {{name}}, wishing you an amazing year ahead..."
        />
      </div>

      {vibe === "photo-poster" && (
        <p className="-mt-2 font-sans text-xs text-muted">
          This message is what appears below the poster image &mdash; the poster
          itself (photo, headline, name) is generated separately from the
          contact&apos;s saved photo when you send.
        </p>
      )}

      {(subject || body) && (
        <div className="rounded-xl bg-clay/8 p-4">
          <p className="mb-1 font-sans text-xs tracking-widest text-muted">
            PREVIEW &mdash; using &ldquo;{SAMPLE_CONTACT.nickname}&rdquo;,{" "}
            {SAMPLE_CONTACT.relationship}
          </p>
          <p className="font-display text-lg text-clay">
            {renderTemplate(subject, SAMPLE_CONTACT)}
          </p>
          <p className="mt-1 whitespace-pre-wrap font-sans text-sm text-ink">
            {renderTemplate(body, SAMPLE_CONTACT)}
          </p>
        </div>
      )}

      {body && (
        <div>
          <p className="mb-2 font-sans text-xs tracking-widest text-muted">
            EMAIL PREVIEW &mdash; what actually gets sent
          </p>
          <iframe
            title="Email preview"
            srcDoc={getEmailTemplate(vibe)(
              SAMPLE_CONTACT.nickname || SAMPLE_CONTACT.name,
              renderTemplate(body, SAMPLE_CONTACT),
            )}
            className="h-105 w-full rounded-xl border border-(--color-border)/12"
          />
        </div>
      )}

      {body && (
        <AllTemplatesPreview
          recipientName={SAMPLE_CONTACT.nickname || SAMPLE_CONTACT.name}
          message={renderTemplate(body, SAMPLE_CONTACT)}
        />
      )}

      {error && <p className="font-sans text-xs text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gold px-6 py-3 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save template"}
      </button>
    </form>
  );
}

function TemplateIcon({ className }: { className?: string }) {
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
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function NoTemplatesYet() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-(--color-border)/12 px-4 py-8 text-center sm:py-10">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay/10 text-rust">
        <TemplateIcon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-sans text-sm text-ink">No templates yet</p>
        <p className="mt-1 font-sans text-xs text-muted">
          Add your first one above.
        </p>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onDelete,
  onUpdated,
}: {
  template: Template;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(template.name);
  const [vibe, setVibe] = useState<Vibe>(template.vibe);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust";
  const labelClass = "mb-1 block font-sans text-xs tracking-[0.1em] text-muted";

  function cancelEdit() {
    setName(template.name);
    setVibe(template.vibe);
    setSubject(template.subject);
    setBody(template.body);
    setError(null);
    setEditing(false);
  }

  async function saveEdit() {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("templates")
      .update({ name, vibe, subject, body })
      .eq("id", template.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    onUpdated();
  }

  if (editing) {
    return (
      <div
        className="grid gap-3 rounded-xl border border-rust/30 p-4"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>TEMPLATE NAME</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
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
        </div>
        <div>
          <label className={labelClass}>SUBJECT</label>
          <input
            className={inputClass}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>BODY</label>
          <textarea
            rows={4}
            className={inputClass}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="rounded-xl bg-clay/8 p-3">
          <p className="mb-1 font-sans text-xs tracking-widest text-muted">
            PREVIEW
          </p>
          <p className="font-display text-base text-clay">
            {renderTemplate(subject, SAMPLE_CONTACT)}
          </p>
          <p className="mt-1 whitespace-pre-wrap font-sans text-sm text-ink">
            {renderTemplate(body, SAMPLE_CONTACT)}
          </p>
        </div>

        {error && <p className="font-sans text-xs text-red-700">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            disabled={saving}
            className="rounded-full bg-gold px-5 py-2 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={cancelEdit}
            className="rounded-full border border-(--color-border)/25 px-5 py-2 font-sans text-sm text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--color-border)/12 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-sans text-sm text-ink">{template.name}</p>
          <p className="mt-1 truncate font-display italic text-clay">
            {renderTemplate(template.subject, SAMPLE_CONTACT)}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => setEditing(true)}
            className="font-sans text-xs text-rust hover:underline"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="font-sans text-xs text-muted hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted">
        {renderTemplate(template.body, SAMPLE_CONTACT)}
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer font-sans text-xs tracking-widest text-rust">
          VIEW EMAIL PREVIEW
        </summary>
        <iframe
          title={`Email preview for ${template.name}`}
          srcDoc={getEmailTemplate(template.vibe)(
            SAMPLE_CONTACT.nickname || SAMPLE_CONTACT.name,
            renderTemplate(template.body, SAMPLE_CONTACT),
          )}
          className="mt-2 h-95 w-full rounded-xl border border-(--color-border)/12"
        />
      </details>
    </div>
  );
}

export default function TemplatesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 2000); // fixed 2s
    return () => clearTimeout(timer);
  }, []);

  const loadTemplates = useCallback(async () => {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setTemplates(
        data.map((row) => ({
          id: row.id,
          name: row.name,
          vibe: row.vibe,
          subject: row.subject,
          body: row.body,
        })),
      );
    }
  }, []);

  async function handleDelete(id: string) {
    await supabase.from("templates").delete().eq("id", id);
    loadTemplates();
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        window.history.replaceState({}, "", "/templates");
      });
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (session) loadTemplates();
  }, [session, loadTemplates]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <AmbientBackground />
      <h1 className="font-display text-2xl text-ink sm:text-4xl">Templates</h1>
      <p className="mt-2 font-sans text-sm text-muted">
        One message doesn&apos;t fit everyone &mdash; save a few for each vibe.
      </p>

      <div className="mt-8 sm:mt-10">
        {loading || !minDelayDone ? (
          <LoadingHourglass />
        ) : !session ? (
          <div className="rounded-2xl border border-(--color-border)/12 p-4 sm:p-6">
            <p className="mb-4 font-sans text-sm text-muted">
              Sign in to create and manage your templates.
            </p>
            <SignIn />
          </div>
        ) : (
          <>
            <AddTemplateForm onAdded={loadTemplates} />
            <div className="mt-10 space-y-3">
              <p className="font-sans text-xs tracking-[0.15em] text-muted">
                YOUR TEMPLATES
              </p>
              {templates.length === 0 ? (
                <NoTemplatesYet />
              ) : (
                templates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onDelete={() => handleDelete(t.id)}
                    onUpdated={loadTemplates}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
