
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and key from the integrations file
const supabaseUrl = "https://vljkbatorrdukqqthhrg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsamtiYXRvcnJkdWtxcXRoaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NTQwMTEsImV4cCI6MjA2MDUzMDAxMX0.NXIry5CJHZr94S7PjqkDtSOBQZ-fMn1DwiRkS4A_A5k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
