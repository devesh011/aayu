// lib/requireUser.ts
//
// Server-only. Verifies the Bearer token sent by the client against
// Supabase Auth, so API routes can confirm a request actually comes from
// a signed-in user — not just anyone who found the route's URL.
//
// The client attaches its current session's access_token as an
// Authorization header on every call to a protected route (see
// getAuthHeader in lib/supabase.ts). This function checks that token
// server-side using the admin client, which can validate any user's
// token regardless of who issued it.

import { supabaseAdmin } from "./supabaseAdmin";

export async function requireUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return { user: null, error: "Missing Authorization header" };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return { user: null, error: "Invalid or expired session" };
  }

  return { user: data.user, error: null };
}
