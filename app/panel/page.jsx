'use client';

import Image from "next/image";
import Header from './components/header';
import Proces1 from './components/proces1';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col antialiased">
      
      {/* Sección Superior: Header Corporativo */}
      <header className="w-full shrink-0 border-b border-[#EBEBEB] bg-white sticky top-0 z-50">
        <Header />
      </header>

      {/* Contenedor Principal: Centrado dinámico del Formulario */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-7xl mx-auto">
        
        {/* Sección del Proceso de Onboarding / Formulario (Ancho controlado y responsivo) */}
        <section className="w-full max-w-[900px] bg-white rounded-xl border border-[#EBEBEB] shadow-[0_4px_16px_rgba(0,0,0,0.04)] px-4 py-8 md:px-12 md:py-12 flex flex-col items-center transition-all duration-300">
          
          {/* Logo Dinámico de Entrada */}
          <div className="mb-6 select-none shrink-0 animate-[fadeInUp_0.5s_ease-out]">
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
          <div className="w-full flex flex-col items-stretch">
            <Proces1 />
          </div>

        </section>

      </main>

    </div>
  );
}