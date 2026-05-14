'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
// Importamos la instancia y la función de Google desde el lib
import { supabase, signInWithGoogle } from '../lib/supabaseClient'; 
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa'; 
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const audio = new Audio('/tu-sonido.mp3');
        audio.play().catch(err => console.log("El navegador bloqueó el autoplay:", err));
        router.push('/panel');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        <div className="relative hidden md:flex flex-col justify-end p-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c7d2fe] via-[#ddd6fe] to-[#bfdbfe]" />
          <div className="relative z-10">
            <div className="text-4xl font-bold mb-4">*</div>
            <p className="text-sm opacity-80 mb-2">Centralized Data Control</p>
            <h2 className="text-2xl font-semibold leading-snug">
              Access the core engine to manage, edit, and orchestrate all 
              Servex product catalogs and data flows.
            </h2>
          </div>
        </div>

        <div className="flex flex-col px-8 py-10 md:px-14 h-full">
          <div className="mb-10 flex justify-center">
            <Image src="/logo.png" alt="SERVEX" width={140} height={40} priority />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Catalog Management System
            </h1>
            <p className="text-sm text-gray-500 mb-8 text-center leading-relaxed">
              Sign in to manage your product data. This workspace allows you to 
              update, edit, and synchronize every technical asset in the ecosystem.
              <br />
              <span className="font-medium text-gray-700">
                Authorized for {' '}
                <a 
                  href="https://servex-us.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold hover:text-blue-600 transition-colors underline decoration-gray-300 underline-offset-2"
                >
                  servex-us.com
                </a> 
                {' '} corporate identities only.
              </span>
            </p>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium"
            >
              <FaGoogle className="text-lg text-red-500" />
              Sign in with Corporate Google
            </button>

            <p className="text-xs text-gray-400 text-center mt-8">
              Data governance active. All catalog modifications are logged for security and integrity purposes.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}