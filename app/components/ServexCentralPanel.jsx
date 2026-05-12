'use client';

import React, { useState } from 'react';
import LoginComponent from './loguin'; 
import { 
  X,
  ChevronRight,
  Sparkles,
  Database,
  ShieldCheck,
  LayoutPanelLeft,
  MousePointerClick,
  LineChart,
  Grid,
  Layers,
  Settings
} from 'lucide-react';

const ServexCentralPanel = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    // Fondo inspirado en el tema claro de Teams (Gris muy sutil)
    <div className="h-[100vh] w-full bg-[#F5F5F5] p-4 md:p-6 font-sans flex items-center justify-center relative overflow-hidden">
      
      {/* Background Decor - Tonos Púrpura de Microsoft */}
      <div className="absolute top-[-5%] left-[-2%] w-72 h-72 bg-[#6264A7] rounded-full blur-[120px] opacity-10"></div>
      <div className="absolute bottom-[-5%] right-[-2%] w-[400px] h-[400px] bg-[#464775] rounded-full blur-[120px] opacity-10"></div>

      {/* --- MODAL DE AUTENTICACIÓN (Estilo Teams) --- */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-[#E1E1E1]">
            <div className="bg-[#6264A7] p-4 flex justify-between items-center">
                <span className="text-white text-sm font-semibold">Iniciar sesión</span>
                <button 
                  onClick={() => setShowLogin(false)}
                  className="p-1 hover:bg-white/10 rounded text-white transition-colors"
                >
                  <X size={18} />
                </button>
            </div>
            <div className="p-8">
                <LoginComponent />
            </div>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL: Estructura de Plataforma Colaborativa */}
      <div className="w-full max-w-5xl h-full max-h-[600px] grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10 shadow-2xl rounded-xl overflow-hidden border border-[#E1E1E1] bg-white">
        
        {/* SIDEBAR IZQUIERDO: Estilo Navegación Teams */}
        <div className="md:col-span-1 bg-[#EBEBEB] border-r border-[#D1D1D1] flex flex-col items-center py-6 gap-6">
            <div className="w-10 h-10 bg-[#6264A7] rounded-lg flex items-center justify-center text-white font-bold shadow-md">SV</div>
            <div className="flex flex-col gap-4 text-[#616161]">
                <Layers size={20} className="hover:text-[#6264A7] cursor-pointer transition-colors" />
                <Grid size={20} className="text-[#6264A7]" />
                <LineChart size={20} className="hover:text-[#6264A7] cursor-pointer transition-colors" />
                <Settings size={20} className="hover:text-[#6264A7] cursor-pointer transition-colors" />
            </div>
        </div>

        {/* COLUMNA DE CONTENIDO: Mensaje Central */}
        <div className="md:col-span-5 bg-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-2 bg-[#92C353] rounded-full"></div>
                <span className="text-[#616161] font-bold tracking-tight text-[10px] uppercase">Servex Hub | Online</span>
            </div>

            <h1 className="text-3xl font-semibold text-[#242424] mb-4 tracking-tight leading-tight">
                Gestión Centralizada <br/><span className="text-[#6264A7]">de Catálogos</span>
            </h1>

            <p className="text-[#424242] mb-8 text-sm leading-relaxed">
                Transforme sus flujos de trabajo de **Servex US**. Una plataforma robusta diseñada para eliminar la dependencia de archivos locales y potenciar la colaboración.
            </p>

            <div className="space-y-2">
              <div className="bg-[#F0F0F0] rounded-md px-4 py-3 flex items-center gap-3 border-l-4 border-[#6264A7] shadow-sm">
                <Database size={16} className="text-[#6264A7]" />
                <span className="text-[#242424] font-semibold text-[11px]">Sincronización en la Nube</span>
              </div>
              <div className="bg-[#F0F0F0] rounded-md px-4 py-3 flex items-center gap-3 border-l-4 border-[#D1D1D1]">
                <Sparkles size={16} className="text-[#616161]" />
                <span className="text-[#242424] font-semibold text-[11px]">Motor de Auditoría IA</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F5F5F5] rounded-lg p-5 border border-[#E1E1E1]">
            <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={18} className="text-[#6264A7]" />
                <span className="text-[#242424] text-xs font-bold uppercase">Seguridad Azure OAuth</span>
            </div>
            <p className="text-[#616161] text-[10px]">Infraestructura de nivel empresarial validada por ingeniería senior.</p>
          </div>
        </div>

        {/* PANEL DERECHO: Workspace & Action Area */}
        <div className="md:col-span-6 bg-[#FBFBFB] p-8 flex flex-col justify-between relative border-l border-[#E1E1E1]">
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C43E1C] rounded-full flex items-center justify-center text-[10px] text-white font-bold">ES</div>
                <div>
                    <p className="text-[#242424] font-bold text-xs">ESMO Client</p>
                    <p className="text-[#616161] text-[9px]">Validado por Servex US</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[#616161] font-bold text-[9px] uppercase tracking-wider">Última Actualización</p>
                <p className="text-[#242424] font-bold text-xs">Mayo 12, 2026</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E1E1E1] p-6 shadow-sm relative z-20">
            <h3 className="text-xl font-semibold text-[#242424] mb-6 flex items-center gap-2">
                <LayoutPanelLeft size={18} className="text-[#6264A7]" />
                Workspace Directo
            </h3>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] rounded-md transition-colors border-b border-[#F0F0F0] cursor-pointer group">
                    <div className="flex items-center gap-3 text-[#424242]">
                      <MousePointerClick size={16} className="text-[#6264A7]" />
                      <span className="text-[12px] font-medium tracking-tight">Editar Catálogos Activos</span>
                    </div>
                    <ChevronRight size={14} className="text-[#D1D1D1] group-hover:text-[#6264A7]" />
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] rounded-md transition-colors border-b border-[#F0F0F0] cursor-pointer group">
                    <div className="flex items-center gap-3 text-[#424242]">
                      <LineChart size={16} className="text-[#6264A7]" />
                      <span className="text-[12px] font-medium tracking-tight">Reportes de Discrepancias</span>
                    </div>
                    <ChevronRight size={14} className="text-[#D1D1D1] group-hover:text-[#6264A7]" />
                </div>
            </div>
          </div>

          {/* Botón de Acción Principal (Púrpura Teams) */}
          <div className="mt-8 relative z-20">
            <button 
              onClick={() => setShowLogin(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#6264A7] text-white px-6 py-3 rounded-md font-semibold text-sm shadow-md hover:bg-[#464775] transition-all active:scale-95"
            >
                <span>Acceder a la Plataforma</span>
                <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServexCentralPanel;