
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and key from the integrations file
const supabaseUrl = "https://vljkbatorrdukqqthhrg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsamtiYXRvcnJkdWtxcXRoaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NTQwMTEsImV4cCI6MjA2MDUzMDAxMX0.NXIry5CJHZr94S7PjqkDtSOBQZ-fMn1DwiRkS4A_A5k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    debug: true, // Enable debugging in development
    detectSessionInUrl: true, // Important for handling redirect URLs
    flowType: 'pkce' // Use PKCE flow which is more secure
  }
});

// Helper function to handle verification URLs
export const handleAuthRedirect = () => {
  const url = window.location.href;
  if (url.includes('#access_token=') || url.includes('type=recovery') || url.includes('type=signup')) {
    // Let Supabase handle the redirect
    const { data, error } = supabase.auth.getSession();
    console.log("Handling auth redirect, session:", data, "error:", error);
    
    // Remove hash fragment if present
    if (window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }
};
