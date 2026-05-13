'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// Importamos la instancia de Supabase desde tu lib
import { supabaseGoogle } from '../../lib/supabaseClient'; 

const TeamsFloatingHeader = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Llamamos al método signOut de Supabase
      const { error } = await supabaseGoogle.auth.signOut();
      
      if (error) throw error;

      // 2. Redirigimos al usuario al login o home tras cerrar sesión
      router.push('/login');
      // Opcional: recargar la página para limpiar estados globales
      router.refresh(); 
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error.message);
    }
  };

  return (
    // Contenedor de posicionamiento fijo
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 px-4 pointer-events-none">
      
      {/* El Header como Isla Flotante */}
      <nav className="pointer-events-auto flex justify-between items-center px-6 py-1.5 bg-[#FFFFFF] border border-[#EDEBE9] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-w-7xl w-full">
        
        {/* SECCIÓN 1: BRANDING / LOGO */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo"
                className="w-32 object-contain" 
              />
            </div>
          </div>

        </div>

        {/* SECCIÓN 3: ACCIÓN - CERRAR SESIÓN */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="bg-[#F1F1F1] text-[#C42B1C] border border-[#E0E0E0] px-5 py-1.5 rounded-full font-semibold text-[12px] hover:bg-[#FCE9E9] hover:border-[#F1C8C8] transition-all active:scale-95 shadow-sm"
          >
            Sign out
          </button>
        </div>

      </nav>
    </div>
  );
};

export default TeamsFloatingHeader;