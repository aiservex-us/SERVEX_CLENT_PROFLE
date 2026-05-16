'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from './components/header';
import Proces1 from './components/proces1';

export default function Home() {
  // Estado para controlar si se muestra la pantalla blanca de carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporizador para cambiar el estado después de 3 segundos (3000 ms)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Limpieza del temporizador si el componente se desmonta
    return () => clearTimeout(timer);
  }, []);

  // 1. PANTALLA DE CARGA: Se muestra solo durante los primeros 3 segundos
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <div className="relative w-18 h-18 animate-pulse"> {/* Puedes ajustar el tamaño aquí */}
          <Image 
            src="/logo2.png" 
            alt="Logo" 
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // 2. CONTENIDO PRINCIPAL: Se muestra automáticamente después de los 3 segundos
  return (
    <div className="relative min-h-screen w-full bg-white overflow-x-hidden">
      
      {/* 
        CAPA SUPERPUESTA (OVERLAY) PARA PROCES1
        - 'fixed inset-0': Ocupa toda la pantalla sin importar el scroll.
        - 'z-[90]': Se posiciona por encima de la estructura de la aplicación.
        - 'bg-[#292929]/20 backdrop-blur-xs': Agrega un fondo sutil Fluent para enfocar el formulario.
      */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#FFF] pointer-events-auto">
        <div className="w-full max-w-4xl max-h-[100vh] overflow-y-auto p-4 animate-in fade-in zoom-in-95 duration-200">
          <Proces1 />
        </div>
      </div>

      {/* 
        CONTENEDOR PRINCIPAL DEL PERFIL / SIDEBAR SYSTEM
        - Corregido el background color inválido 'bg-[ff8f]' a la estructura limpia.
      */}
  
    </div>
  );
}