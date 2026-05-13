import React from 'react';

const TaskGoCompact = () => {
  return (
    // Fondo gris claro característico de la app de escritorio de Teams
    <div className="w-screen h-screen bg-[#F5F5F5] flex items-center justify-center overflow-hidden font-sans">
      
      {/* Contenedor Principal con el estilo de la ventana de Teams */}
      <div className="w-[98%] h-[96%] bg-[#FFFFFF] rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.14)] border border-[#EDEBE9] relative overflow-hidden flex flex-col">
        
        {/* Barra de Título / Navbar estilo Teams */}
        <nav className="relative z-10 flex justify-between items-center px-6 py-2 bg-[#FFFFFF] border-b border-[#EDEBE9]">
          <div className="flex items-center gap-4">
            {/* Logo estilo Icono de App de Teams */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#5B5FC7] rounded flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-[14px] font-semibold text-[#242424]">TaskGo</span>
            </div>
            
            {/* Menú de navegación estilo Tabs de canal */}
            <div className="hidden md:flex items-center ml-4 gap-1 h-full">
              {['Home', 'Features', 'Why Choose', 'Pricing'].map((item, idx) => (
                <a 
                  key={item} 
                  href="#" 
                  className={`px-3 py-2 text-[14px] transition-all border-b-2 ${
                    idx === 0 ? 'border-[#5B5FC7] text-[#242424] font-semibold' : 'border-transparent text-[#616161] hover:bg-[#F0F0F0]'
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Botón de acción estilo Fluent UI */}
          <button className="bg-[#5B5FC7] text-white px-4 py-1.5 rounded-sm font-semibold text-[13px] hover:bg-[#4E52B1] transition-colors shadow-sm">
            Contact Us
          </button>
        </nav>

        {/* Hero Section - Estilo "Canvas" de Microsoft */}
        <main className="relative z-10 flex-1 flex flex-col items-center text-center pt-12 px-6 bg-[#FAF9F8]">
          
          {/* Etiquetas estilo "Badges" de Fluent UI */}
          <div className="absolute top-8 left-[15%] bg-[#E8EBFA] text-[#5B5FC7] px-3 py-1 rounded border border-[#D2D5FA] flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#5B5FC7]" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Analyst</span>
          </div>
          <div className="absolute top-20 right-[15%] bg-[#FDF3F4] text-[#C4314B] px-3 py-1 rounded border border-[#F9D9DE] flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#C4314B]" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Programmer</span>
          </div>

          {/* Tipografía alineada a Microsoft (Segoe UI style) */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#242424] leading-tight tracking-tight mb-4">
            Simplify Task Management <br />
            <span className="text-[#5B5FC7]">Boost Productivity</span>
          </h1>
          
          <p className="text-[#616161] text-[16px] mb-8 max-w-lg leading-relaxed">
            Easily manage tasks and enhance productivity from start to finish.
          </p>

          {/* Botones de acción estilo Teams (Primario y Contorno) */}
          <div className="flex gap-2 mb-12">
            <button className="bg-[#5B5FC7] text-white px-6 py-2 rounded-sm font-semibold text-sm hover:bg-[#4E52B1] shadow-sm">
              Get Started Free
            </button>
            <button className="bg-white border border-[#D1D1D1] text-[#242424] px-6 py-2 rounded-sm font-semibold text-sm hover:bg-[#F5F5F5] transition-all">
              Book a Demo
            </button>
          </div>

          {/* Visualizador de Dashboard estilo Contenedor de Teams */}
          <div className="w-full max-w-[900px] px-4">
            <div className="bg-[#FFFFFF] border border-[#EDEBE9] p-1 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
              <div className="bg-[#F3F2F1] rounded-sm overflow-hidden aspect-[16/9] flex items-center justify-center border border-[#EDEBE9]">
                <img 
                  src="/dataEJM_1.png" 
                  alt="My Mac Dashboard" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer estilo Barra de Estado de Aplicación */}
        <footer className="relative z-10 py-6 flex flex-col items-center bg-[#FFFFFF] border-t border-[#EDEBE9]">
          <div className="flex gap-12 items-center opacity-40 grayscale filter contrast-125 mb-2 scale-90">
            <span className="text-lg font-bold text-[#242424]">IPSUM</span>
            <span className="text-lg font-semibold text-[#242424]">logoipsum</span>
            <span className="text-lg font-mono text-[#242424]">000</span>
            <span className="text-lg font-bold text-[#242424]">LOCO</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TaskGoCompact;