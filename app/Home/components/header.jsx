'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseGoogle } from '../../lib/supabaseClient';
import { FaRobot, FaUserCircle } from 'react-icons/fa';

const TeamsFloatingHeader = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabaseGoogle.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkUser();

    const { data: authListener } = supabaseGoogle.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Variantes de animación para los botones
  const buttonVariants = {
    hover: { 
      scale: 1.05, 
      y: -1,
      boxShadow: "0px 8px 20px rgba(91, 95, 199, 0.2)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto flex justify-between items-center px-6 py-2 bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] max-w-7xl w-full"
      >
        
        {/* SECCIÓN 1: BRANDING */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <motion.div 
              whileHover={{ opacity: 0.8 }}
              className="flex items-center cursor-pointer"
            >
              <img 
                src="/logo.png" 
                alt="Logo"
                className="w-28 object-contain" 
              />
            </motion.div>
          </Link>
        </div>

        {/* SECCIÓN 3: ACCIONES DINÁMICAS */}
        <div className="flex items-center gap-3">
          
          {/* BOTÓN SERVEX COPILOTO - Estilo Glassmorphism */}
          <a 
            href="https://servex-ai-iota.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="group relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50/50 border border-slate-200 text-slate-600 font-medium text-[12px] backdrop-blur-sm transition-colors hover:bg-white hover:text-[#5B5FC7]"
            >
              <FaRobot className="text-[#5B5FC7] transition-transform group-hover:rotate-12" />
              <span>Servex Copiloto</span>
            </motion.button>
          </a>

          <AnimatePresence mode="wait">
            {!loading && (
              user ? (
                <Link href="/panel" key="panel-btn">
                  <motion.button
                    variants={buttonVariants}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    whileHover="hover"
                    whileTap="tap"
                    className="relative overflow-hidden bg-[#5B5FC7] text-white px-6 py-1.5 rounded-full font-semibold text-[12px] shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                  >
                    {/* Efecto de brillo interior */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    Panel
                  </motion.button>
                </Link>
              ) : (
                <Link href="/login" key="login-btn">
                  <motion.button
                    variants={buttonVariants}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-slate-900 text-white px-6 py-1.5 rounded-full font-semibold text-[12px] flex items-center gap-2 shadow-xl shadow-slate-900/10"
                  >
                    <FaUserCircle className="text-sm opacity-80" />
                    Login
                  </motion.button>
                </Link>
              )
            )}
          </AnimatePresence>
        </div>

      </motion.nav>
    </div>
  );
};

export default TeamsFloatingHeader;