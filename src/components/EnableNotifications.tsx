"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "unsupported" | "loading" | "off" | "on" | "denied";

function BellIcon({ className }: { className?: string }) {
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
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function EnableNotifications() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      queueMicrotask(() => setStatus("unsupported"));
      return;
    }

    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setStatus("on");
      } else if (Notification.permission === "denied") {
        setStatus("denied");
      } else {
        setStatus("off");
      }
    });
  }, []);

  async function enable() {
    setError(null);
    setEnabling(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setError("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      const json = subscription.toJSON();
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      if (!user_id) {
        setError("Sign in first, then enable notifications.");
        return;
      }

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
        },
        { onConflict: "endpoint" },
      );

      if (error) {
        setError(error.message);
        return;
      }

      setStatus("on");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setEnabling(false);
    }
  }

  if (status === "loading" || status === "unsupported") return null;

  if (status === "on") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-rust/20 bg-rust/6 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rust/12 text-rust">
          <BellIcon className="h-4 w-4" />
        </span>
        <p className="font-sans text-sm text-ink">
          Reminders are on for this device.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-(--color-border)/12 bg-paper px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay/10 text-rust">
          <BellIcon className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="font-sans text-sm text-ink">
            {status === "denied"
              ? "Notifications are blocked"
              : "Get a nudge before each birthday"}
          </p>
          <p className="mt-0.5 font-sans text-xs text-muted">
            {status === "denied"
              ? "Allow notifications for this site in your browser settings, then reload."
              : "A quiet reminder a few days ahead, and again on the day."}
          </p>
        </div>
      </div>

      {status !== "denied" && (
        <button
          onClick={enable}
          disabled={enabling}
          className="w-full shrink-0 rounded-full bg-gold px-5 py-2 font-sans text-xs text-paper transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {enabling ? "Turning on..." : "Turn on reminders"}
        </button>
      )}

      {error && (
        <p className="font-sans text-xs text-red-700 sm:basis-full">{error}</p>
      )}
    </div>
  );
}
