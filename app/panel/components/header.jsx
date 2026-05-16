'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseGoogle } from '../../lib/supabaseClient'; 
import { HiShieldCheck } from 'react-icons/hi';
import { FaUserCircle } from 'react-icons/fa';
import Profile from '../../profile/page'

const TeamsFloatingHeader = () => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabaseGoogle.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabaseGoogle.auth.signOut();
      if (error) throw error;
      router.push('/');
      router.refresh(); 
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  };

  // Extraer nombre o usar parte del email como fallback
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <>
      {/* HEADER PRINCIPAL - Cambiado a bloque normal con espacio propio */}
      <div className="w-full flex justify-center py-4 px-4">
        <nav className="flex justify-between items-center px-6 py-2 bg-white border border-[#EDEBE9] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-7xl w-full">
          
          <div className="flex items-center gap-4">
            <img src="/logo2.png" alt="Logo" className="w-8 object-contain" />
            
            {/* MENSAJE DE BIENVENIDA Y NOMBRE */}
            {user && (
              <div className="hidden md:flex items-center gap-2 border-l border-[#EDEBE9] pl-4 ml-2">
                <span className="text-[#616161] text-[12px]">Bienvenido,</span>
                <span className="text-[#242424] font-bold text-[12px] capitalize">
                  {userName}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowConfirm(true)}
              className="bg-[#F1F1F1] text-[#C42B1C] border border-[#E0E0E0] px-5 py-1.5 rounded-full font-semibold text-[12px] hover:bg-[#FCE9E9] hover:border-[#F1C8C8] transition-all active:scale-95 shadow-sm"
            >
              Sign out
            </button>
          </div>
        </nav>
      </div>

      {/* MODAL ESTILO MICROSOFT TEAMS */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setShowConfirm(false)}
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-[#FFFFFF] rounded-lg shadow-[0_32px_64px_rgba(0,0,0,0.3)] max-w-[420px] w-full overflow-hidden border border-[#EDEBE9]"
            >
              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  
                  {/* Avatar dinámico en el Alert */}
                  <div className="relative mb-6">
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute inset-0  rounded-full blur-2xl"
                    />
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        className="relative w-16 h-16 rounded-full border-2 border-white shadow-md"
                        alt="Profile"
                      />
                    ) : (
                      <div className="relative bg-[#F3F2F1] p-4 rounded-full">
                        <FaUserCircle className="text-[#464775] text-4xl" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-[#242424] text-xl font-bold mb-2">
                    ¿Confirmas el cierre de sesión?
                  </h3>
                  <p className="text-[#424242] text-[14px] leading-relaxed mb-8">
                    Hola <span className="font-bold text-[#464775]">{userName}</span>, al cerrar sesión se detendrán tus procesos actuales en el ecosistema **SERVEX AI**.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 order-2 sm:order-1 bg-white text-[#242424] border border-[#D1D1D1] px-4 py-2.5 rounded font-semibold text-[13px] hover:bg-[#F5F5F5] transition-colors"
                    >
                      Seguir trabajando
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 order-1 sm:order-2 bg-[#464775] text-white px-4 py-2.5 rounded font-semibold text-[13px] hover:bg-[#3a3b61] transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <HiShieldCheck className="text-lg" />
                      Cerrar sesión
                    </button>
                    <Profile   />
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-[#464775] via-[#6d6e9c] to-[#464775]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeamsFloatingHeader;