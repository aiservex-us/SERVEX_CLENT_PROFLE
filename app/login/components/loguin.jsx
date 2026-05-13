'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, signInWithGoogle } from '@/app/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error Google Login:", error);
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
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F9] px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-[90%] max-w-[1200px] h-[650px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex p-6"
      >
        {/* Panel Izquierdo - 50% con Imagen Blur y Texto Gris */}
        <div className="hidden md:flex w-1/2 rounded-[32px] relative overflow-hidden flex-col justify-end p-10 bg-[#F3F4F9]">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/ff.jpg" 
              alt="Background"
              fill
              className="object-cover blur-md scale-110 opacity-60" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
          </div>

          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#B4B6E5] rounded-full blur-[80px] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="mb-6">
               <span className="text-4xl text-[#5B5FC7] font-bold opacity-40">*</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">
              You can easily
            </p>
            <h2 className="text-3xl font-bold text-gray-600 leading-tight">
              Get access your personal hub for clarity and productivity
            </h2>
          </div>
        </div>

        {/* Panel Derecho - 50% */}
        <div className="flex flex-col w-full md:w-1/2 px-8 md:px-16 justify-center">
          <div className="mb-8">
             <span className="text-3xl text-[#5B5FC7] font-bold">*</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Access SERVEX AI Platform
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              This platform provides secure access to the SERVEX artificial intelligence ecosystem.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
               <label className="text-sm font-bold text-gray-700 ml-1">Corporate Authorization</label>
               <div className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 text-xs leading-relaxed italic">
                 Only users with a @servex-us.com corporate email are authorized to sign in.
               </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full max-w-[320px] mx-auto flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#5B5FC7] hover:bg-[#464775] transition-all duration-300 text-white font-bold text-sm shadow-[0_10px_20px_-5px_rgba(91,95,199,0.4)] transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.8"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.8"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.8"/>
              </svg>
              Get Started with Google
            </button>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-[1px] bg-gray-100"></div>
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Secure Access</span>
              <div className="flex-1 h-[1px] bg-gray-100"></div>
            </div>
            
            <div className="flex justify-center">
              <Image src="/logo.png" alt="SERVEX" width={100} height={28} className="grayscale opacity-50" />
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-auto pb-4 leading-relaxed">
            Unauthorized access is restricted. <br />
            All activity is monitored for security purposes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}