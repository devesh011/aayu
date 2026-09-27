import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-only Supabase client. Bypasses row-level security entirely —
 * never import this into any client component or expose it to the browser.
 * Used only by the cron job, which has no signed-in user of its own and
 * needs to read across every user's contacts and subscriptions.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
