"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import {
  renderTemplate,
  type Contact,
  type Template,
  type Vibe,
} from "@/types";
import { getEmailTemplate } from "@/lib/emailTemplates";
import {
  FONT_OPTIONS,
  DEFAULT_POSTER_FONT,
  type PosterFont,
} from "@/lib/posterFonts";
import {
  POSTER_STYLES,
  DEFAULT_POSTER_STYLE,
  type PosterStyle,
} from "@/lib/posterStyles";
import { getAuthHeader } from "@/lib/authHeader";

const STYLES: { value: Vibe; label: string }[] = [
  { value: "warm-family", label: "Warm / Family" },
  { value: "funny-close", label: "Funny / Close friend" },
  { value: "sweet", label: "Sweet" },
  { value: "formal", label: "Formal" },
  { value: "minimal", label: "Minimal" },
  { value: "photo-poster", label: "Photo Poster (Polaroid)" },
];

function buildWhatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function WishModal({
  contact,
  onClose,
}: {
  contact: Contact;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailStyle, setEmailStyle] = useState<Vibe>(contact.vibe);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [includePhoto, setIncludePhoto] = useState(true);

  const [posterStyle, setPosterStyle] =
    useState<PosterStyle>(DEFAULT_POSTER_STYLE);
  const [posterFont, setPosterFont] = useState<PosterFont>(DEFAULT_POSTER_FONT);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  // AI-generated background (Polaroid poster style only). The real photo
  // is never touched by this — it's just the decorative layer behind it.
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [generatingBackground, setGeneratingBackground] = useState(false);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const mapped: Template[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          vibe: row.vibe,
          subject: row.subject,
          body: row.body,
        }));
        setTemplates(mapped);
        const match = mapped.find((t) => t.vibe === contact.vibe) ?? mapped[0];
        if (match) selectTemplate(match);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.vibe]);

  function selectTemplate(t: Template) {
    setSelectedId(t.id);
    setSubject(renderTemplate(t.subject, contact));
    setBody(renderTemplate(t.body, contact));
  }

  const recipientName = contact.nickname || contact.name;
  const isPosterVibe = emailStyle === "photo-poster";

  function handleStyleChange(value: string) {
    setPosterStyle(value as PosterStyle);
    setPosterUrl(null);
    if (value !== "polaroid") {
      setBackgroundUrl(null);
      setBackgroundPrompt("");
    }
  }

  async function generateBackground() {
    if (!backgroundPrompt.trim()) return;
    setGeneratingBackground(true);
    setBackgroundError(null);
    try {
      const res = await fetch("/api/generate-poster-background", {
        method: "POST",
        headers: await getAuthHeader(),
        body: JSON.stringify({ prompt: backgroundPrompt }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Failed to generate background");
      setBackgroundUrl(data.backgroundUrl);
      setPosterUrl(null); // stale poster used the old (or no) background
    } catch (err) {
      setBackgroundError(
        err instanceof Error ? err.message : "Failed to generate background",
      );
    } finally {
      setGeneratingBackground(false);
    }
  }

  function handleFontChange(value: string) {
    setPosterFont(value as PosterFont);
    setPosterUrl(null);
  }

  async function generatePoster() {
    if (!contact.photoUrl) return;
    setComposing(true);
    setComposeError(null);
    try {
      const res = await fetch("/api/compose-photo", {
        method: "POST",
        headers: await getAuthHeader(),
        body: JSON.stringify({
          photoUrl: contact.photoUrl,
          recipientName,
          fontFamily: posterFont,
          posterStyle,
          backgroundUrl: posterStyle === "polaroid" ? backgroundUrl : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate poster");
      setPosterUrl(data.imageUrl);
    } catch (err) {
      setComposeError(
        err instanceof Error ? err.message : "Failed to generate poster",
      );
    } finally {
      setComposing(false);
    }
  }

  const effectivePhotoUrl = isPosterVibe
    ? (posterUrl ?? undefined)
    : includePhoto && contact.photoUrl
      ? contact.photoUrl
      : undefined;

  async function sendEmail() {
    if (!contact.email) return;
    if (isPosterVibe && !posterUrl) {
      setStatus("Generate the poster before sending.");
      return;
    }
    setSending(true);
    setStatus(null);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: await getAuthHeader(),
      body: JSON.stringify({
        to: contact.email,
        subject,
        body,
        recipientName,
        vibe: emailStyle,
        photoUrl: effectivePhotoUrl,
      }),
    });
    setSending(false);
    if (res.ok) setStatus("Email sent.");
    else {
      const data = await res.json().catch(() => ({}));
      setStatus(`Failed: ${data.error ?? "unknown error"}`);
    }
  }

  function openWhatsApp() {
    if (!contact.phone) return;
    window.open(buildWhatsAppLink(contact.phone, body), "_blank");
  }

  async function copyAndOpen(url: string) {
    await navigator.clipboard.writeText(body);
    window.open(url, "_blank");
    setStatus("Message copied — paste it once the app opens.");
  }

  const matching = templates.filter((t) => t.vibe === contact.vibe);
  const others = templates.filter((t) => t.vibe !== contact.vibe);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-(--color-border)/10 px-6 py-4">
          <h2 className="font-display text-2xl text-ink">
            Wish {recipientName}
          </h2>
          <button onClick={onClose} className="font-sans text-sm text-muted">
            Close
          </button>
        </div>

        {templates.length === 0 ? (
          <p className="p-6 font-sans text-sm text-muted">
            No templates yet &mdash; add one on the Templates page first.
          </p>
        ) : (
          <>
            <div className="aayu-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <p className="mb-2 font-sans text-xs tracking-widest text-muted">
                TEMPLATE
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {[...matching, ...others].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className="rounded-full border px-3 py-1.5 font-sans text-xs transition-colors"
                    style={{
                      borderColor:
                        selectedId === t.id
                          ? "#A68E5A"
                          : "var(--color-border)33",
                      background:
                        selectedId === t.id ? "#A68E5A" : "transparent",
                      color:
                        selectedId === t.id
                          ? "var(--color-paper)"
                          : "var(--color-ink)",
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              <label className="mb-1 block font-sans text-xs tracking-widest text-muted">
                EMAIL STYLE
              </label>
              <select
                className="mb-4 w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust"
                value={emailStyle}
                onChange={(e) => setEmailStyle(e.target.value as Vibe)}
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {!isPosterVibe && contact.photoUrl && (
                <label className="mb-4 flex items-center gap-2 font-sans text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={includePhoto}
                    onChange={(e) => setIncludePhoto(e.target.checked)}
                    className="h-4 w-4 accent-gold"
                  />
                  Include {recipientName}&apos;s photo in this email
                </label>
              )}

              {isPosterVibe && (
                <div className="mb-4 rounded-xl border border-(--color-border)/15 p-4">
                  {!contact.photoUrl ? (
                    <p className="font-sans text-xs text-muted">
                      No photo saved for {recipientName} yet &mdash; add one on
                      the Photos page first.
                    </p>
                  ) : (
                    <>
                      <label className="mb-1 block font-sans text-xs tracking-widest text-muted">
                        POSTER DESIGN
                      </label>
                      <select
                        className="mb-3 w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust"
                        value={posterStyle}
                        onChange={(e) => handleStyleChange(e.target.value)}
                      >
                        {POSTER_STYLES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>

                      <label className="mb-1 block font-sans text-xs tracking-widest text-muted">
                        FONT
                      </label>
                      <select
                        className="mb-3 w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust"
                        value={posterFont}
                        onChange={(e) => handleFontChange(e.target.value)}
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      {posterStyle === "polaroid" && (
                        <div className="mb-4 rounded-lg border border-(--color-border)/12 p-3">
                          <label className="mb-1 block font-sans text-xs tracking-widest text-muted">
                            AI BACKGROUND (OPTIONAL)
                          </label>
                          <p className="mb-2 font-sans text-[11px] text-muted">
                            Describe a background style — the real photo still
                            gets placed on top by code, this only replaces the
                            plain color behind it.
                          </p>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              className="w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust"
                              value={backgroundPrompt}
                              onChange={(e) =>
                                setBackgroundPrompt(e.target.value)
                              }
                              placeholder={`e.g. "soft pastel confetti", "watercolor floral"`}
                            />
                            <button
                              type="button"
                              onClick={generateBackground}
                              disabled={
                                generatingBackground || !backgroundPrompt.trim()
                              }
                              className="shrink-0 rounded-full bg-gold px-4 py-2 font-sans text-xs text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                              {generatingBackground
                                ? "Generating..."
                                : "Generate background"}
                            </button>
                          </div>
                          {backgroundError && (
                            <p className="mt-2 font-sans text-xs text-red-700">
                              {backgroundError}
                            </p>
                          )}
                          {backgroundUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <img
                                src={backgroundUrl}
                                alt="Generated background"
                                className="h-14 w-14 rounded-md border border-(--color-border)/15 object-cover"
                              />
                              <p className="font-sans text-[11px] text-muted">
                                Background ready — will be used next time you
                                generate the poster.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {posterUrl ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={posterUrl}
                            alt="Generated poster"
                            className="h-20 w-auto rounded-md border border-(--color-border)/15"
                          />
                          <div>
                            <p className="mb-1 font-sans text-xs text-muted">
                              Poster ready.
                            </p>
                            <button
                              type="button"
                              onClick={generatePoster}
                              disabled={composing}
                              className="font-sans text-xs text-rust hover:underline disabled:opacity-50"
                            >
                              {composing ? "Regenerating..." : "Regenerate"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={generatePoster}
                          disabled={composing}
                          className="rounded-full bg-gold px-4 py-1.5 font-sans text-xs text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          {composing ? "Generating..." : "Generate poster"}
                        </button>
                      )}
                    </>
                  )}
                  {composeError && (
                    <p className="mt-2 font-sans text-xs text-red-700">
                      {composeError}
                    </p>
                  )}
                </div>
              )}

              <label className="mb-1 block font-sans text-xs tracking-widest text-muted">
                SUBJECT
              </label>
              <input
                className="mb-3 w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <label className="mb-1 block font-sans text-xs tracking-widest text-muted">
                MESSAGE
              </label>
              <textarea
                rows={4}
                className="mb-3 w-full rounded-lg border border-(--color-border)/20 bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-rust"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />

              {contact.email && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className="font-sans text-xs text-rust hover:underline"
                  >
                    {showPreview ? "Hide email preview" : "Show email preview"}
                  </button>
                  {showPreview && (
                    <iframe
                      title="Email preview"
                      srcDoc={getEmailTemplate(emailStyle)(
                        recipientName,
                        body,
                        undefined,
                        effectivePhotoUrl,
                      )}
                      className="mt-2 h-75 w-full rounded-xl border border-(--color-border)/12"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-(--color-border)/10 px-6 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={sendEmail}
                  disabled={
                    !contact.email || sending || (isPosterVibe && !posterUrl)
                  }
                  className="rounded-full bg-gold px-5 py-2.5 font-sans text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {sending ? "Sending..." : "Send email"}
                </button>
                <button
                  onClick={openWhatsApp}
                  disabled={!contact.phone}
                  className="rounded-full border border-(--color-border)/30 px-5 py-2.5 font-sans text-sm text-ink disabled:opacity-40"
                >
                  Open WhatsApp
                </button>
                <button
                  onClick={() =>
                    copyAndOpen("https://instagram.com/direct/inbox")
                  }
                  className="rounded-full border border-(--color-border)/30 px-5 py-2.5 font-sans text-sm text-ink"
                >
                  Copy + Instagram
                </button>
                <button
                  onClick={() => copyAndOpen("https://web.snapchat.com")}
                  className="rounded-full border border-(--color-border)/30 px-5 py-2.5 font-sans text-sm text-ink"
                >
                  Copy + Snapchat
                </button>
              </div>

              {status && (
                <p className="mt-3 font-sans text-xs text-muted">{status}</p>
              )}
              {!contact.email && (
                <p className="mt-3 font-sans text-xs text-muted">
                  No email on file for {contact.name} &mdash; add one to enable
                  sending.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
