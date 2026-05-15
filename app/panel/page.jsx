'use client';

import Image from "next/image";
import Header from './components/header';
import Proces1 from './components/proces1';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#FFF] flex flex-col antialiased">
      
      {/* Sección Superior: Header Corporativo */}
      <header className="w-full shrink-0 border-b border-[#EBEBEB] bg-white z-50">
        <Header />
      </header>

      {/* Contenedor Principal: Centrado dinámico del Formulario */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* Sección del Proceso de Onboarding / Formulario (80% Viewport óptimo) */}
        <section className="w-full h-[80vh] flex flex-col justify-center items-center bg-white rounded-xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-10 md:px-12 md:py-16 transition-all duration-300">
          
          {/* Logo Dinámico de Entrada */}
          <div className="mb-8 select-none shrink-0 animate-[fadeInUp_0.5s_ease-out]">
            <Image 
              src="/logo.png" 
              alt="SVX Logo" 
              width={130} 
              height={45} 
              priority
              className="object-contain"
            />
          </div>

          {/* Componente del Formulario / Flujo por Pasos */}
          <div className="w-fullflex flex-col items-stretch">
            <Proces1 />
          </div>

        </section>

      </main>

    </div>
  );
}