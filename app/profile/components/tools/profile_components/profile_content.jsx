'use client';
import React, { useState } from 'react';
import { 
  Bell, Sparkles, Layers, Cpu, 
  ShieldCheck, HelpCircle, Database, LogOut
} from 'lucide-react';

export default function SVXCommandsDashboard() {
  const [activeTab, setActiveTab] = useState('On Going');

  const tabs = ['On Going', 'Up Coming', 'Ended', 'Canceled'];

  // ==========================================
  // CONFIGURACIÓN DINÁMICA CON TEXTO RESPONSIVO (Doble propósito)
  // ==========================================
  const bannerContent = {
    'On Going': {
      title: 'SVX Central Ingestion Engine',
      description: {
        short: 'Infraestructura de SVX Command para la ingesta masiva e inteligente de catálogos técnicos e inventarios desde formatos XML, CSV y PDF en un único flujo estandarizado.',
        p1: 'Esta infraestructura representa el núcleo de recepción masiva de datos de la plataforma, diseñada específicamente para resolver el caos operativo derivado de múltiples fuentes heterogéneas. El motor unifica de manera absoluta la ingesta de catálogos técnicos e inventarios corporativos de gran volumen, procesando arquitecturas de datos complejas como archivos XML profundamente anidados, esquemas CSV masivos y documentos PDF no estructurados en un único flujo de entrada estandarizado y de alta disponibilidad.',
        p2: 'Bajo el monitoreo en tiempo real de SVX Command, esta fase de ingesta asegura una tasa de transferencia óptima y una latencia mínima mediante colas de procesamiento asíncronas. SVX Command supervisa activamente el estado de los canales de entrada, gestionando las asignaciones de memoria y garantizando que el aprovisionamiento de información sea continuo, seguro y completamente transparente antes de ser derivado a las capas de transformación.'
      },
      buttonText: 'Ver Estado de Ingesta',
      icon: <Layers className="w-3.5 h-3.5 text-[#484B97]" />,
      // Degradado sutil neutro-púrpura que emula el header de tu tabla
   gradient: 'bg-gradient-to-r from-white via-[#F5F7FF] to-[#EDF2FF] border-[#D2D6E8]',
      textColor: 'text-[#242424]',
      btnBg: 'bg-[#484B97] hover:bg-[#5B5FC7] text-white transition-all rounded-sm',
    },
    'Up Coming': {
      title: 'Automated ETL Pipelines',
      description: {
        short: 'Consola unificada en SVX Command para la ejecución automática de pipelines en tiempo real, procesando flujos ETL para eliminar la manipulación manual de datos.',
        p1: 'La fase de orquestación automatizada representa la maduración del flujo de datos a través de pipelines de extracción, transformación y limpieza profunda (ETL) que operan en tiempo real. Este sistema se encarga de aplicar reglas de negocio sumamente estrictas, normalizar unidades de medida, enriquecer atributos técnicos y eliminar registros duplicados o corruptos, erradicando por completo la intervención manual y mitigando el riesgo de errores operativos en las bases de datos corporativas.',
        p2: 'Toda esta secuencia es gobernada de forma centralizada por SVX Command, el cual actúa como la consola maestra de administración. Desde SVX Command se configuran los desencadenadores automáticos, se gestiona la concurrencia de las tareas y se optimiza la carga de trabajo de los agentes de procesamiento, garantizando que los datos purificados estén disponibles de manera predictiva para su posterior análisis o sincronización externa.'
      },
      buttonText: 'Monitorear Pipelines',
      icon: <Cpu className="w-3.5 h-3.5 text-[#5B5FC7]" />,
      // Transición limpia hacia un azul pastel muy suave
      gradient: 'bg-gradient-to-r from-white via-[#F5F7FF] to-[#EDF2FF] border-[#D2D6E8]',
      textColor: 'text-[#242424]',
      btnBg: 'bg-[#484B97] hover:bg-[#5B5FC7] text-white transition-all rounded-sm',
    },
    'Ended': {
      title: 'CET Intelligent Auditing',
      description: {
        short: 'Auditorías automáticas gestionadas mediante SVX Copilot y visualizadas en SVX Command para validar la integridad semántica y taxonómica de los catálogos.',
        p1: 'Esta sección se enfoca en el aseguramiento de la calidad, la gobernanza de datos y la validación rigurosa mediante algoritmos avanzados de Inteligencia Artificial. Cada catálogo técnico y estructura de datos que finaliza el procesamiento es sometido a una auditoría automatizada impulsada por SVX Copilot, evaluando la consistencia taxonómica, la integridad de los enlaces y el cumplimiento estricto de los estándares corporativos globales exigidos por Servex US antes de autorizar su consolidación.',
        p2: 'SVX Command consolida el historial completo de estas auditorías inteligentes, sirviendo como el panel definitivo de visibilidad operativa y auditoría forense. Al interactuar con SVX Command, los ingenieros pueden analizar las métricas de precisión emitidas por el Copilot, revisar las discrepancias corregidas automáticamente y validar los reportes de conformidad, garantizando que solo la información con un nivel de confianza absoluto sea inyectada en el entorno productivo.'
      },
      buttonText: 'Revisar Auditorías',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#616161]" />,
      // Eliminado el verde. Ahora usa un gris quirúrgico de alta fidelidad, minimalista
      gradient: 'bg-gradient-to-r from-white via-[#FAF9F8] to-[#F3F2F1] border-[#E0E0E0]',
      textColor: 'text-[#242424]',
      btnBg: 'bg-[#616161] hover:bg-[#484848] text-white transition-all rounded-sm',
    },
    'Canceled': {
      title: 'Operational Support & Control',
      description: {
        short: 'Centro de control de excepciones en SVX Command protegido por Azure OAuth para mitigar riesgos, rastrear logs de errores y recuperar flujos interrumpidos.',
        p1: 'El módulo de soporte y control operativo está dedicado a la resiliencia del ecosistema, la seguridad empresarial y la mitigación proactiva de riesgos técnicos. Implementa una arquitectura de seguridad robusta basada en la autenticación perimetral vía Azure OAuth para restringir los accesos, además de proveer un soporte de nivel experto para aislar fallas críticas en transmisiones no resueltas, previniendo que incidentes aislados comprometan la estabilidad del sistema.',
        p2: 'A través de SVX Command, los administradores del sistema disponen de un centro de control de excepciones altamente avanzado que centraliza los logs de errores structured, trazas de depuración y alertas de seguridad. SVX Command permite realizar un seguimiento minucioso de los procesos cancelados o interrumpidos, facilitando herramientas de reintento inteligente y análisis de causa raíz para garantizar un control total y un retorno rápido al estado operativo óptimo.',
      },
      buttonText: 'Ver Logs de Excepciones',
      icon: <HelpCircle className="w-3.5 h-3.5 text-[#7A7574]" />,
      // Eliminado el rojo de alerta. Transición mate ultra limpia hacia un gris topo/cálido corporativo
      gradient: 'bg-gradient-to-r from-white via-[#FBFBFA] to-[#F5F4F3] border-[#E1DFDD]',
      textColor: 'text-[#242424]',
      btnBg: 'bg-[#7A7574] hover:bg-[#615E5C] text-white transition-all rounded-sm',
    }
  };

  const currentBanner = bannerContent[activeTab] || bannerContent['On Going'];

  const analyticsMetrics = [
    { label: 'Manual Excel Interventions', value: '0 Pending', change: '-180h/mo manual labor', changeColor: 'text-[#107C41]', icon: <Database className="w-3.5 h-3.5 text-[#025A9E]" /> },
    { label: 'Automated ETL Volume', value: '4.2 TB Ingested', change: 'XML • CSV • PDF unified', changeColor: 'text-[#464775]', icon: <Cpu className="w-3.5 h-3.5 text-[#464775]" /> },
    { label: 'AI Audited Compliance', value: '99.8% Perfect', change: '0 structural anomalies', changeColor: 'text-[#107C41]', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#107C41]" /> },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full h-auto bg-[#FFF] font-sans antialiased text-[#242424] p-4 space-y-4">
      
      {/* HEADER DINÁMICO RESPONSIVO (< 700px) */}
      <header className="flex items-center justify-between max-[700px]:justify-end bg-white border border-[#E0E0E0] rounded-md p-4 shadow-2xs">
        
        {/* LOGO Y TEXTOS: Se borran por completo si la pantalla mide menos de 700px */}
        <div className="flex items-center gap-3 max-[700px]:hidden">
          <img src="/logo.png" alt="SVX Commands Logo" className="h-7 w-auto object-contain" />
          <div className="flex flex-col border-l border-[#E0E0E0] pl-3">
            <span className="text-xs font-bold text-[#242424]">Svx Copilot System</span>
            <span className="text-[10px] text-[#616161]">Gestión inteligente de catálogos técnicos.</span>
          </div>
        </div>

        {/* CONTROLES / BOTÓN SIGN OUT */}
        <div className="flex items-center gap-2">
          {/* Tag de Cluster: Se oculta en móvil para dar prioridad al botón */}
          <span className="text-[10px] font-mono font-bold bg-[#EDEBE9] text-[#242424] px-2 py-1 rounded-sm border border-[#D2D0CE] max-[700px]:hidden">
            CLUSTER: PROD-US-EAST
          </span>


        </div>
      </header>

      {/* ANALYTICS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analyticsMetrics.map((metric, i) => (
          <div key={i} className="bg-white border border-[#E0E0E0] rounded-md p-2.5 flex items-center justify-between shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-[#616161] uppercase tracking-wider">{metric.label}</span>
              <div className="text-xs font-bold text-[#242424] tracking-tight">{metric.value}</div>
            </div>
            <div className="text-right flex flex-col items-end gap-0.5">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm border border-[#EDEBE9]">{metric.icon}</div>
              <span className={`text-[9px] font-medium ${metric.changeColor}`}>{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-12 space-y-4">
          
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

          {/* DYNAMIC AI BANNER RESPONSIVO */}
          <section className={`w-full rounded-md border p-4 transition-all duration-300 shadow-2xs ${currentBanner.gradient}`}>
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-sm bg-[#242424]/5 flex items-center justify-center shrink-0">
                    {currentBanner.icon}
                  </div>
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${currentBanner.textColor}`}>
                    {currentBanner.title}
                  </h2>
                </div>
                
                <div className="text-[11px] text-[#505050] font-light leading-relaxed">
                  <p className="block md:hidden text-justify italic">
                    {currentBanner.description.short}
                  </p>
                  <div className="hidden md:block space-y-3">
                    <p className="text-justify">{currentBanner.description.p1}</p>
                    <p className="text-justify">{currentBanner.description.p2}</p>
                  </div>
                </div>

              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors duration-150 focus:outline-none shadow-3xs ${currentBanner.btnBg}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {currentBanner.buttonText}
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* POPUP COMPLETAMENTE VACÍO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-[70vw] h-[70vh] bg-white border border-[#E0E0E0] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border border-slate-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1 w-full h-full overflow-y-auto p-6"></div>
          </div>
        </div>
      )}

    </div>
  );
}