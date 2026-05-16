'use client';

import { useState, useEffect } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';
import Header from './components/header';
import Proces1 from './components/proces1';
import Profile from './components/profile/page';

export default function Home() {
  // Estado para controlar si el onboarding/proces1 está activo
  const [isProcessing, setIsProcessing] = useState(null);
  // Estado para la animación de transición intermedia entre Proces1 y Profile
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Handler que se ejecuta de inmediato al terminar Proces1 de forma exitosa
  const handleOnboardingComplete = () => {
    // 1. Desmontamos el overlay de Proces1 y el fondo blur al instante
    setIsProcessing(false);
    // 2. Activamos la pantalla blanca intermedia con logo2.png
    setIsTransitioning(true);

    // 3. Ejecutamos sonido corporativo idéntico al ecosistema guía
    const audio = new Audio('/tono1.mp3');
    audio.play().catch(error => console.log("Audio pipeline interaction restricted:", error));

    // 4. Temporizador exacto de 3 segundos antes de revelar <Profile />
    setTimeout(() => {
      setIsTransitioning(false);
      audio.pause();
    }, 3000);
  };

  // Evitamos flashes visuales asíncronos mientras Supabase responde en la carga inicial
  if (isProcessing === null) {
    return <div className="min-h-screen w-full bg-white" />;
  }

  // PANTALLA INTERMEDIA DE TRANSICIÓN (Estilo Puro Fluent / Reveal Logo)
  if (isTransitioning) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center">
        <div className="animate-in fade-in zoom-in duration-1000">
          <img 
            src="/logo2.png" 
            alt="Loading Ecosystem Blueprint" 
            className="w-48 h-auto object-contain animate-pulse" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[99vh] w-full bg-transparent overflow-x-hidden">
      
      {/* 
        CONDITIONAL OVERLAY LAYER
        Solo se renderiza y aplica el blur si el usuario realmente necesita configurar su entorno.
        Al finalizar, muta los estados liberando el árbol de renderizado.
      */}
      {isProcessing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#292929]/20 backdrop-blur-xs pointer-events-auto">
          <div className="w-full max-w-4xl h-[95vh] overflow-y-auto p-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Escucha el evento de completado e inicia la secuencia intermedia */}
            <Proces1 onComplete={handleOnboardingComplete} />
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL LIBRE (Se muestra únicamente cuando termina Proces1 y la transición) */}
      <div className="min-h-screen w-full bg-white">
        <Profile />
      </div>

    </div>
  );
}