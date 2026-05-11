// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jktxlojmqxkitnagljwz.supabase.co';
const supabaseAnonKey = 'sb_publishable_ErJWTHF6NQzrqzKj9HIw2w_68qijBMn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-worker-session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const supabaseGoogle = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-customer-session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

export async function signInWithGoogle() {
  const { error } = await supabaseGoogle.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // URL ACTUALIZADA SEGÚN TU LOG DE VERCEL
      redirectTo: 'https://servex-clent-profle.vercel.app/', 
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    console.error('❌ Error login Google:', error);
    throw error;
  }
}

export async function signInWithAzure() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: 'https://servex-clent-profle.vercel.app/',
    }
  });

  if (error) {
    console.error('❌ Error login Azure:', error);
    throw error;
  }
}