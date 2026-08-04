import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://jbgzbwkgzlicdmohieux.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZ3pid2tnemxpY2Rtb2hpZXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTM0NTUsImV4cCI6MjEwMTQyOTQ1NX0.2ij5Nvs0gJ0zLeChGft3H8cQEtvnYY-oHaSCo6y1mRg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
