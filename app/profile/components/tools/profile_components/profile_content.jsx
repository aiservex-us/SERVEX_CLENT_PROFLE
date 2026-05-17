'use client';
import React, { useState } from 'react';
import { 
  Bell, Sparkles, ChevronUp, Video, Layers, Cpu, 
  ShieldCheck, HelpCircle, Database, RefreshCw, 
  FileCode, Terminal, AlertTriangle, CheckCircle2, Clock 
} from 'lucide-react';

export default function SVXCommandsDashboard() {
  const [activeTab, setActiveTab] = useState('On Going');

  const tabs = ['On Going', 'Up Coming', 'Ended', 'Canceled'];

  // ==========================================
  // CONFIGURACIÓN DINÁMICA: PROPÓSITO DE SVX COMMANDS
  // ==========================================
  const bannerContent = {
    'On Going': {
      title: 'SVX Central Ingestion Engine',
      description: 'Centralización absoluta del caos de datos. Unificamos la ingesta de catálogos masivos e inventarios corporativos provenientes de múltiples formatos como XML complejos, CSV y PDF en una sola infraestructura.',
      buttonText: 'Ver Estado de Ingesta',
      icon: <Layers className="w-3.5 h-3.5 text-[#464775]" />,
      gradient: 'bg-[#F3F2F1] border-[#E0E0E0]',
      textColor: 'text-[#242424]',
      btnBg: 'bg-[#464775] hover:bg-[#3b3c63] text-white',
    },
    'Up Coming': {
      title: 'Automated ETL Pipelines',
      description: 'Orquestación y procesamiento en tiempo real. Ejecución automatizada de pipelines de extracción, transformación y limpieza profunda de datos, eliminando la manipulación manual y los errores operativos.',
      buttonText: 'Monitorear Pipelines',
      icon: <Cpu className="w-3.5 h-3.5 text-[#0078D4]" />,
      gradient: 'bg-[#EFF6FC] border-[#DEECF9]',
      textColor: 'text-[#001829]',
      btnBg: 'bg-[#0078D4] hover:bg-[#005A9E] text-white',
    },
    'Ended': {
      title: 'CET Intelligent Auditing',
      description: 'Gobernanza y validación con Inteligencia Artificial. Auditorías automáticas ejecutadas mediante SVX Copilot para asegurar que cada catálogo técnico cumpla con los estándares de Servex US antes de su integración final.',
      buttonText: 'Revisar Auditorías',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#107C41]" />,
      gradient: 'bg-[#F1F9F5] border-[#DFF6DD]',
      textColor: 'text-[#107C41]',
      btnBg: 'bg-[#107C41] hover:bg-[#0B5930] text-white',
    },
    'Canceled': {
      title: 'Operational Support & Control',
      description: 'Seguridad corporativa y gestión de excepciones. Soporte de nivel experto con autenticación Azure OAuth para mitigar fallos en transmisiones no resueltas y garantizar control total del ecosistema.',
      buttonText: 'Ver Logs de Excepciones',
      icon: <HelpCircle className="w-3.5 h-3.5 text-[#A80000]" />,
      gradient: 'bg-[#FDE7E9] border-[#F3B0B4]',
      textColor: 'text-[#A80000]',
      btnBg: 'bg-[#A80000] hover:bg-[#740000] text-white',
    }
  };

  const currentBanner = bannerContent[activeTab] || bannerContent['On Going'];

  // Data Real de alto impacto adaptada al ecosistema operativo SVX
  const analyticsMetrics = [
    { 
      label: 'Manual Excel Interventions', 
      value: '0 Pending', 
      change: '-180h/mo manual labor', 
      changeColor: 'text-[#107C41]', 
      icon: <Database className="w-3.5 h-3.5 text-[#025A9E]" /> 
    },
    { 
      label: 'Automated ETL Volume', 
      value: '4.2 TB Ingested', 
      change: 'XML • CSV • PDF unified', 
      changeColor: 'text-[#464775]', 
      icon: <Cpu className="w-3.5 h-3.5 text-[#464775]" /> 
    },
    { 
      label: 'AI Audited Compliance', 
      value: '99.8% Perfect', 
      change: '0 structural anomalies', 
      changeColor: 'text-[#107C41]', 
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#107C41]" /> 
    },
  ];

  const ongoingPipelines = [
    { id: 'PIPE-XML-092', catalog: 'Industrial Tools Corp', format: 'XML', size: '42.1 MB', progress: 85, status: 'Processing' },
    { id: 'PIPE-CSV-114', catalog: 'Automotive Fasteners LLC', format: 'CSV', size: '128.5 MB', progress: 40, status: 'Transforming' },
  ];

  const systemLogs = [
    { timestamp: '11:32:15', type: 'SUCCESS', message: 'Auth session tokens renewed via GOOGLE Cloud Console OAuth provider.' },
  ];

  return (
    <div className="w-full h-[70vh] bg-[#FFF] font-sans antialiased text-[#242424] p-4 space-y-4">
      
      {/* ==========================================
          HEADER SECTION (Fluent Style)
         ========================================== */}
      <header className="flex items-center justify-between bg-white border border-[#E0E0E0] rounded-md p-4 shadow-2xs">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="SVX Commands Logo" 
            className="h-7 w-auto object-contain"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-[#EDEBE9] text-[#242424] px-2 py-1 rounded-sm border border-[#D2D0CE]">
            CLUSTER: PROD-US-EAST
          </span>
          <button className="p-2 rounded-md hover:bg-[#F3F2F1] text-[#616161] hover:text-[#242424] transition-colors relative focus:outline-none">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#A80000] rounded-full"></span>
          </button>
        </div>
      </header>

      {/* ==========================================
          ANALYTICS COUNTER BAR
         ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analyticsMetrics.map((metric, i) => (
          <div key={i} className="bg-white border border-[#E0E0E0] rounded-md p-2.5 flex items-center justify-between shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-[#616161] uppercase tracking-wider">{metric.label}</span>
              <div className="text-xs font-bold text-[#242424] tracking-tight">{metric.value}</div>
            </div>
            <div className="text-right flex flex-col items-end gap-0.5">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm border border-[#EDEBE9]">{metric.icon}</div>
              <span className={`text-[9px] font-medium ${metric.changeColor || 'text-[#107C41]'}`}>{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================
          MASTER TWO-COLUMN GRID WORKSPACE
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COMPACT WORKSPACE: CONFIGURATION & NOTIFICATIONS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* TABS FILTER */}
          <div className="w-full flex gap-1 border-b border-[#E0E0E0] bg-white px-2 rounded-t-md pt-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs font-medium shrink-0 transition-all duration-150 relative focus:outline-none
                    ${isActive 
                      ? 'text-[#464775] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#464775]' 
                      : 'text-[#616161] hover:text-[#242424] hover:bg-[#F3F2F1] rounded-t-md'
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC AI BANNER */}
          <section className={`w-full rounded-md border p-4 transition-all duration-300 shadow-2xs ${currentBanner.gradient}`}>
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm bg-[#242424]/5 flex items-center justify-center shrink-0">
                    {currentBanner.icon}
                  </div>
                  <h2 className={`text-xs font-normal uppercase tracking-wider ${currentBanner.textColor}`}>
                    {currentBanner.title}
                  </h2>
                </div>
                <p className="text-[11px] text-[#505050] font-light leading-relaxed pt-1.5">
                  {currentBanner.description}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors duration-150 focus:outline-none shadow-3xs ${currentBanner.btnBg}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {currentBanner.buttonText}
              </button>
            </div>
          </section>

          {/* MEETING CARD (Ecosystem Pipeline Room) */}
          <div className="w-full bg-white border border-[#E0E0E0] hover:border-[#C8C8C8] rounded-md p-4 transition-all duration-200 shadow-2xs relative">
            <div className="flex items-center justify-between pt-2 border-t border-[#F3F2F1]">
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                <div className="h-6 w-6 rounded-full bg-[#464775] text-white flex items-center justify-center text-[9px] font-bold border border-white">AM</div>
                <div className="h-6 w-6 rounded-full bg-[#107C41] text-white flex items-center justify-center text-[9px] font-bold border border-white">JV</div>
                <div className="h-6 w-6 rounded-full bg-[#F3F2F1] text-[#616161] flex items-center justify-center text-[9px] font-bold border border-[#E0E0E0]">+3</div>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#464775] hover:bg-[#3b3c63] text-white text-xs font-semibold rounded-sm transition-colors focus:outline-none">
                <span>Coordination</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COMPLEX WORKSPACE: ACTIVE PIPELINES & TELEMETRY LOGS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* COMPONENTE: PIPELINES ACTIVOS EN TIEMPO REAL */}
          <div className="bg-white border border-[#E0E0E0] rounded-md shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-[#E0E0E0] bg-[#FAFAFA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#464775]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#242424]">Live ETL Trackers</h3>
              </div>
              <button className="p-1 hover:bg-[#EDEBE9] rounded-sm transition-colors text-[#616161] hover:text-[#242424]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              </button>
            </div>
            
            <div className="divide-y divide-[#E0E0E0]">
              {ongoingPipelines.map((pipe, idx) => (
                <div key={idx} className="p-4 space-y-2 hover:bg-[#FFFA] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold bg-[#F3F2F1] px-1.5 py-0.5 rounded-sm border border-[#E0E0E0] text-[#242424]">{pipe.id}</span>
                      <span className="font-semibold text-[#242424]">{pipe.catalog}</span>
                    </div>
                    <span className="text-[10px] text-[#A80000] bg-[#FDE7E9] px-2 py-0.5 rounded-full font-medium animate-pulse">{pipe.status}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="w-full bg-[#EDEBE9] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#464775] h-full transition-all duration-500" style={{ width: `${pipe.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#616161] font-mono">
                      <span>Format: {pipe.format} • Size: {pipe.size}</span>
                      <span>{pipe.progress}% Transformed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPONENTE: CONSOLA DE TELEMETRÍA Y LOGS DEL SISTEMA */}
          <div className="bg-white border border-[#E0E0E0] rounded-md shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-[#E0E0E0] bg-[#FAFAFA] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#242424]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#242424]">Core System Telemetry</h3>
            </div>
            <div className="p-3 bg-[#111111] font-mono text-[11px] leading-relaxed text-[#D4D4D4] h-20 overflow-y-auto space-y-2 rounded-b-md">
              {systemLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 border-b border-[#292929] pb-1.5 last:border-0">
                  <span className="text-[#858585] shrink-0">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 ${
                    log.type === 'SUCCESS' ? 'text-[#57F287]' : log.type === 'WARNING' ? 'text-[#FEE75C]' : 'text-[#3498DB]'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-[#E5E5E5]">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}