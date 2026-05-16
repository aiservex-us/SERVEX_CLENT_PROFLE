'use client';

import Image from "next/image";
import Header from './components/header'
import Proces1 from './components/proces1'


export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-white overflow-x-hidden">
      
      {/* 
        CAPA SUPERPUESTA (OVERLAY) PARA PROCES1
        - 'fixed inset-0': Ocupa toda la pantalla sin importar el scroll.
        - 'z-[90]': Se posiciona por encima de la estructura de la aplicación.
        - 'bg-[#292929]/20 backdrop-blur-xs': Agrega un fondo sutil Fluent para enfocar el formulario.
      */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#FFF]  pointer-events-auto">
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