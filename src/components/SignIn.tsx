"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { beastOfRage } from "@/lib/fonts";
import { HourglassIcon } from "@/components/LoadingHourglass";

// Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local (country code + number, no + or spaces)
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const WHATSAPP_MESSAGE = "Hey, can I get access to Aayu?";

function D3v8ll({ className = "" }: { className?: string }) {
  return (
    <span
      className={`${beastOfRage.className} text-base tracking-wide ${className}`}
    >
      D3v8ll
    </span>
  );
}

function getSignInErrorMessage(message: string): React.ReactNode {
  const isInviteOnly =
    /signup|sign.?up/i.test(message) && /not allowed|disabled/i.test(message);
  if (isInviteOnly) {
    return (
      <>
        This one&apos;s invite-only — links only go out to people close to{" "}
        <D3v8ll />. Reach out to him if you&apos;d like in.
      </>
    );
  }
  return message;
}

export function SignIn({ redirectPath }: { redirectPath: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
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
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
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
      </div>
      {error && (
        <div className="animate-fade-up motion-reduce:animate-none">
          <p className="font-sans text-xs text-red-700">{error}</p>
          {WHATSAPP_NUMBER && (
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-2 inline-flex items-center gap-2 font-sans text-xs text-rust"
            >
              {/* Underline that grows from left on hover */}
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_1px] bg-bottom-left bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-out group-hover:bg-size-[100%_1px]">
                Message{" "}
                <D3v8ll className="inline-block transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110" />{" "}
                on WhatsApp
              </span>

              {/* Hourglass replaces the arrow. aria-hidden so screen readers
                  don't announce "Loading" inside a link. */}
              <span
                aria-hidden="true"
                className="inline-flex shrink-0 transition-transform duration-300 group-hover:scale-125"
              >
                <HourglassIcon size={16} strokeWidth={10} />
              </span>
            </a>
          )}
        </div>
      )}
    </form>
  );
}
