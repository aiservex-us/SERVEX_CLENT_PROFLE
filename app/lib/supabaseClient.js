// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Datos de tu proyecto proporcionados
const supabaseUrl = 'https://jktxlojmqxkitnagljwz.supabase.co';
const supabaseAnonKey = 'sb_publishable_ErJWTHF6NQzrqzKj9HIw2w_68qijBMn';

/**
 * CLIENTE PARA TRABAJADORES (Azure / Microsoft)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-worker-session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

/**
 * CLIENTE PARA CLIENTES (Google Cloud)
 */
export const supabaseGoogle = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-customer-session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

// --- FUNCIONES PARA GOOGLE (CLIENTES) ---

export async function signInWithGoogle() {
  const { error } = await supabaseGoogle.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://servex-ai-iota.vercel.app/', // URL de tu sitio en Vercel
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

// --- FUNCIONES PARA AZURE (TRABAJADORES) ---

export async function signInWithAzure() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: 'https://servex-ai-iota.vercel.app/',
    }
  });

  if (error) {
    console.error('❌ Error login Azure:', error);
    throw error;
  }
}

// --- UTILIDADES DE SESIÓN ---

export async function signOutAll() {
  await supabase.auth.signOut();
  await supabaseGoogle.auth.signOut();
}