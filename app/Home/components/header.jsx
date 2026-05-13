'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseGoogle } from '../../lib/supabaseClient';

const TeamsFloatingHeader = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión inicial
    const checkUser = async () => {
      const { data: { session } } = await supabaseGoogle.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    // 2. Escuchar cambios en la autenticación (login/logout)
    const { data: authListener } = supabaseGoogle.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 px-4 pointer-events-none">
      
      <nav className="pointer-events-auto flex justify-between items-center px-6 py-1.5 bg-[#FFFFFF] border border-[#EDEBE9] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-w-7xl w-full">
        
        {/* SECCIÓN 1: BRANDING */}
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

          {/* SECCIÓN 2: NAVEGACIÓN */}
          <div className="hidden md:flex items-center ml-2 gap-0.5 h-full">
            {['Home', 'Features', 'Why Choose', 'Pricing'].map((item, idx) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className={`px-3 py-1.5 rounded-full text-[13px] transition-all ${
                  idx === 0 
                    ? 'bg-[#E8EBFA] text-[#5B5FC7] font-semibold' 
                    : 'text-[#616161] hover:bg-[#F0F0F0] hover:text-[#242424]'
                }`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* SECCIÓN 3: ACCIONES DINÁMICAS */}
        <div className="flex items-center gap-3">
          {!loading && (
            user ? (
              // Si está logueado, muestra PANEL
              <Link href="/panel">
                <button className="bg-[#5B5FC7] text-white px-6 py-1.5 rounded-full font-semibold text-[12px] hover:bg-[#4E52B1] transition-all active:scale-95 shadow-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Panel
                </button>
              </Link>
            ) : (
              // Si NO está logueado, muestra LOGIN
              <Link href="/login">
                <button className="bg-[#5B5FC7] text-white px-6 py-1.5 rounded-full font-semibold text-[12px] hover:bg-[#4E52B1] transition-colors active:scale-95 shadow-sm">
                  Login
                </button>
              </Link>
            )
          )}
        </div>

      </nav>
    </div>
  );
};

export default TeamsFloatingHeader;