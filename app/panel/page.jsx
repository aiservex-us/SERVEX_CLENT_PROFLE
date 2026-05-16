'use client';

import { useState, useEffect } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';
import Header from './components/header';
import Proces1 from './components/proces1';
import Profile from './components/profile/page';

export default function Home() {
  // Estado para controlar si el onboarding/proces1 está activo
  const [isProcessing, setIsProcessing] = useState(null);

  useEffect(() => {
    const checkBaseline = async () => {
      try {
        const { data: { user } } = await supabaseGoogle.auth.getUser();
        if (user) {
          // Validamos si ya tiene registro en la base de datos
          const { data, error } = await supabaseGoogle
            .from('client_submissions')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          
          // Si YA tiene datos, NO mostramos el proceso (isProcessing = false)
          // Si NO tiene datos, debe completarlo (isProcessing = true)
          setIsProcessing(!data);
        } else {
          // Si ni siquiera hay sesión activa, no mostramos el flujo interno
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Error verifying system setup state:", err);
        setIsProcessing(false);
      }
    };

    checkBaseline();
  }, []);

  // Controlar el overflow del body dinámicamente para evitar bloqueos de scroll
  useEffect(() => {
    if (isProcessing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Limpieza al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isProcessing]);

  // Evitamos flashes visuales asíncronos mientras Supabase responde
  if (isProcessing === null) {
    return <div className="min-h-screen w-full bg-white" />;
  }

  return (
    <div className="relative min-h-screen w-full bg-transparent overflow-x-hidden">
      
      {/* 
        CONDITIONAL OVERLAY LAYER
        Cuando 'isProcessing' pasa a false, React destruye este nodo inmediatamente.
      */}
      {isProcessing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#292929]/20 backdrop-blur-sm pointer-events-auto">
          <div className="w-full max-w-4xl h-[95vh] overflow-y-auto p-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Forzamos que al terminar cambie el estado firmemente */}
            <Proces1 onComplete={() => setIsProcessing(false)} />
          </div>
        </div>
      )}

      {/* 
        CONTENEDOR PRINCIPAL LIBRE 
        Añadimos clases dinámicas para asegurarnos de que si está procesando, el fondo no interfiera 
        con los clics ni el enfoque, y cuando termine, recupere el control total.
      */}
      <div className={`min-h-screen w-full bg-white ${isProcessing ? 'pointer-events-none select-none' : 'pointer-events-auto'}`}>
        <Profile />
      </div>

    </div>
  );
}