import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-safe Supabase instance, scoped by row-level security to the
 * signed-in user. Never import the service-role key into client code.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
