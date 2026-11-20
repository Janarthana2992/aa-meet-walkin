import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gvzmpdjxwrxbvwfllylm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_8FdgpryZp6Ckv_PVYrQxJg_BYPCYvB9";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client for general public / authenticated browser and server operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

// Admin client for backend operations requiring elevated privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
