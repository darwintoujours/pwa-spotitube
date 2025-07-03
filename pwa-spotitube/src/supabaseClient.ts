import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,        // garde la session dans localStorage
      detectSessionInUrl: true,    // récupère automatiquement le token depuis l’URL de redirection
      autoRefreshToken: true,      // rafraîchit automatiquement le token quand il expire
    },
  }
);
