
import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables in your Supabase project
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
