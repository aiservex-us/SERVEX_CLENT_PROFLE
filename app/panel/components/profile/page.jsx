'use client';

import React, { useState } from 'react';
import {
  SearchCode,
  ChevronLeft,
  Headphones,
  Settings
} from 'lucide-react';
import Panel1 from './components/panel1';

export default function Home() {
  // Estado para controlar si el menú lateral está colapsado o expandido
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex min-h-screen w-full bg-[#FFF] text-[#242424] antialiased overflow-hidden">
      
      {/* ========================================================================= */}
      {/* MENÚ LATERAL CONTENEDOR DESPLEGABLE                                        */}
      {/* ========================================================================= */}
      <aside
        className={`
          h[90vh] shrink-0 bg-white border-r border-slate-100/80 flex flex-col sticky top-0 left-0 z-40
          transition-all duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isCollapsed ? 'w-[70px]' : 'w-[300px] md:w-[300px]'} 
        `}
      >
        {/* HEADER: LOGO & BOTÓN DE TOGGLE */}
        <div className="h-16 flex items-center px-4 shrink-0 relative">
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors">
              <img
                src="/logosEmpresas/lesro.png"
                alt="Logo"
                className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'}`}
              />
            </div>
            
         
          </div>

          {/* Botón flotante para colapsar/expandir */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-slate-400 hover:text-[#464775]"
          >
            <ChevronLeft className={`w-3 h-3 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

      

        {/* ========================================================================= */}
        {/* PANEL1 METIDO DENTRO DEL MENÚ (Se oculta suavemente al colapsar)          */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0 transition-all duration-[400ms] ease-in-out">
          <div className={`
            transition-all duration-[400ms] origin-left
            ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 scale-100 ml-2 mt-2'}
          `}>
            <Panel1 />
          </div>
        </div>

        {/* FOOTER: ACCIONES (Support, Settings & Copilot Profile) */}
        <div className="p-3 border-t border-slate-50 bg-white/50 space-y-2 shrink-0">
          {[
            { label: 'Support', icon: Headphones },
            { label: 'Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`
                  w-full flex items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#464775] transition-all duration-200
                  ${isCollapsed ? 'justify-center h-10' : 'px-3 py-2'}
                `}
              >
                <Icon size={isCollapsed ? 14 : 16} className="shrink-0" />
                <div className={`
                  overflow-hidden transition-all duration-[400ms]
                  ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
                `}>
                  <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* TARJETA SVX COPILOT (Icono de perfil persistente) */}
          <div className={`
            mt-2 flex items-center rounded-xl transition-all duration-300
            ${isCollapsed ? 'justify-center h-10 bg-transparent' : 'p-2 bg-[#464775] text-white shadow-lg shadow-[#464775]/20'}
          `}>
            <div className="relative shrink-0">
              <div className={`rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${isCollapsed ? 'w-8 h-8 p-1.5 bg-[#464775] hover:scale-105' : 'w-7 h-7 p-1.5 bg-white/20 backdrop-blur-sm'}`}>
                <img
                  src="/logo2.png" 
                  alt="Svx"
                  className="w-full h-full object-contain brightness-200"
                />
              </div>
            </div>
            
            <div className={`
              overflow-hidden transition-all duration-[400ms]
              ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
            `}>
              <div className="flex flex-col leading-tight text-white">
                <p className="text-[10px] font-black tracking-tight uppercase">
                  Svx Copilot
                </p>
                <p className="text-[7.5px] opacity-70 font-medium whitespace-nowrap">
                  Next-gen Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* LEYENDA DE COPYRIGHT */}
          <div className={`
            transition-all duration-[400ms] overflow-hidden pt-1
            ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'}
          `}>
            <p className="text-[7px] text-slate-400 leading-tight tracking-tight px-1 uppercase font-medium">
              © 2026 GLYNNE S.A.S
            </p>
          </div>
        </div>
      </aside>

      {/* VISTA PRINCIPAL (Resto de la pantalla de la app) */}
      <main className="flex-1 h-screen bg-[#F8FAFC]">
        {/* Aquí puedes colocar el contenido del dashboard principal o dejarlo vacío */}
      </main>

    </div>
  );
}