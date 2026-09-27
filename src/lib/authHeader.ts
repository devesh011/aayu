// lib/authHeader.ts
//
// Client-side helper. Gets the current session's access token and
// returns it as a fetch-ready headers object. Used by every call to a
// protected API route (send-email, send-intro-email, compose-photo) so
// the server can verify the request is really coming from a signed-in
// user — see lib/requireUser.ts for the server side of this.

import { supabase } from "./supabase";

export async function getAuthHeader(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}
