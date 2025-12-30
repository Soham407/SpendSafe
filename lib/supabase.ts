import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For use in client components (hook-based)
export const createClientComponent = () => createBrowserClient(supabaseUrl, supabaseAnonKey);

// Plain client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
