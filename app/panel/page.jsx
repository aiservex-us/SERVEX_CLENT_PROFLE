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

  // Evitamos flashes visuales asíncronos mientras Supabase responde
  if (isProcessing === null) {
    return <div className="min-h-screen w-full bg-white" />;
  }

  return (
    <div className="relative min-h-[99vh] w-full bg-transparent overflow-x-hidden">
      
 

      {/* 
        CONDITIONAL OVERLAY LAYER
        Solo se renderiza y aplica el blur si el usuario realmente necesita configurar su entorno.
        Cuando 'isProcessing' pasa a false, todo este nodo del DOM se destruye liberando el <Profile />.
      */}
      {isProcessing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-none pointer-events-auto">
          <div className="w-full max-w-4xl h-[95vh] overflow-y-auto p-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Le pasamos la función para apagar el overlay desde adentro si es necesario */}
            <Proces1 onComplete={() => setIsProcessing(false)} />
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL LIBRE */}
      <div className="min-h-screen w-full bg-white">
        <Profile />
      </div>

    </div>
  );
}