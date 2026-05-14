'use client';

import React from 'react';
import { FaArrowRight, FaStar } from 'react-icons/fa';

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] w-full flex flex-col justify-end overflow-hidden bg-white px-6 pb-20 pt-32 md:px-16">
      
      {/* 1. IMAGEN DE FONDO BASE */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/fondo.jpg" 
 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/35" />
      </div>

      {/* 2. CAPA DE DEGRADADOS Y PANELES */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-blue-100/15 to-orange-100/15" />
        
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/15 to-transparent border-l border-white/40 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
        </div>
        <div className="absolute top-[5%] right-[15%] w-[40%] h-[100%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/10 to-transparent border-l border-white/40" />
        </div>
        <div className="absolute top-[-20%] left-[10%] w-[30%] h-[80%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-100/15 to-transparent border-l border-white/40" />
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="relative z-20 max-w-7xl mx-auto w-full">
        
        {/* Título Principal */}
        <h1 className="text-4xl md:text-[300%] font-light text-[#1a1a1a] leading-[1.1] tracking-tighter max-w-2xl">
       
        <span className="font-bold">Welcome to Svx Command:</span> <br />
  The new standard in Servex catalog management.
        </h1>

        {/* Texto Descriptivo - Ajustado a tamaños más pequeños y responsivos */}
        <p className="text-s md:text-base lg:text-lg font-light text-gray-500 mb-12 max-w-xl md:max-w-2xl leading-relaxed">
          Transcend the limitations of legacy spreadsheets with an <span className="text-black font-normal">ultra-sophisticated ecosystem</span> designed for Servex AI and CET Designer partners. 
          Centralize, orchestrate, and refine complex data through a professional architecture that replaces manual Excel workflows with <span className="text-black font-normal">intelligent automation and high-level analytical tools.</span>
        </p> 

        {/* Footer del Hero */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-t border-gray-900/10 pt-10 font-sans">
          
          {/* Subtexto Izquierdo */}
          <div className="md:col-span-4 flex items-start gap-4">
            <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
              Ditch rudimentary manual workflows. Deploy automated <br className="hidden md:block" />
              ETL pipelines for high-integrity catalog orchestration.
            </p>
            <div className="mt-0.5">
              <FaArrowRight className="text-gray-400 text-[10px]" />
            </div>
          </div>

          {/* Subtexto Central */}
          <div className="md:col-span-4">
            <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed uppercase tracking-wider font-medium opacity-70">
              Advanced Neural Processing to audit, synchronize, <br className="hidden md:block" />
              and validate complex data structures instantly.
            </p>
          </div>

          {/* Ratings / Trust */}
          <div className="md:col-span-4 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-900 mr-2 uppercase tracking-tighter">Enterprise Grade</span>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-red-600 text-[8px]" />
              ))}
            </div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Secure Data Management for <span className="text-gray-900">GLYNNE Partners</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;