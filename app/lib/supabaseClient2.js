import { createClient } from '@supabase/supabase-js';

//
// =======================
// CONFIGURACIÓN SUPABASE
// =======================
//

const supabaseUrl = 'https://zotgxyupuiifnbuwwjkl.supabase.co';
const supabaseAnonKey = 'sb_publishable_usgTKwhsIpmNIiGa_F4tiw_ah3THCTJ';

/**
 * 💡 SOLUCIÓN PARA SEPARAR SESIONES:
 * Creamos dos clientes con diferentes 'storageKey'. 
 * Esto hace que el navegador guarde los tokens en lugares distintos.
 */

// Cliente para Trabajadores / Internos
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-worker-session', // Llave única para trabajadores
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Cliente para Clientes externos / Google Portal
export const supabaseGoogle = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-customer-session', // Llave única para clientes externos
    persistSession: true,
    autoRefreshToken: true,
  }
});

//
// =======================
// AUTH GENERAL & SESIONES
// =======================
//

// Obtener usuario autenticado de la sesión por defecto (supabase)
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (error.message.includes('Auth session missing')) {
        return null; 
    }
    console.error('❌ Error fetching user:', error);
    return null;
  }

  if (!data?.user) return null;

  const user = data.user;
  const email = user.email || user.user_metadata?.email || user.user_metadata?.preferred_username || null;
  const provider = user.app_metadata?.provider;

  return {
    id: user.id,
    email,
    provider,
    raw: user,
  };
}

// Escuchar cambios de sesión del cliente base
export function subscribeToAuthState(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return subscription;
}

// Logout General (supabase)
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Error al cerrar sesión:', error);
  }
}

//
// =======================
// PERSISTENCIA DE DATOS
// =======================
//

export async function saveAuditToSupabase({ audit_content, user }) {
  if (!user?.id) {
    console.warn('⚠️ Auditoría sin usuario válido');
    return { data: null, error: 'NO_USER' };
  }

  const { data, error } = await supabase
    .from('auditorias')
    .insert([
      {
        audit_content: JSON.stringify(audit_content),
        user_id: user.id,
        user_email: user.email,
        provider: user.provider || 'unknown',
      },
    ])
    .select();

  if (error) {
    console.error('❌ Error saving audit:', error);
    return { data: null, error };
  }

  return { data, error: null };
}