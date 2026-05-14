import React from 'react';

const StatsSection = () => {
  const stats = [
    {
      value: "100%",
      label: "Centralized and organized data for Servex AI & CD Sign clients",
    },
    {
      value: "100%",
      label: "You’ll be able to edit, update, add, delete, and maintain full control of all your catalogs.",
    },
    {
      value: "80%",
      label: "Less friction between your company’s processes and Servex in catalog updates",
    },
    {
      value: "24/7",
      label: "Real-time visibility into your product and data ecosystem",
    },
  ];

  return (
    <section className="relative py-24 px-6 md:px-12 bg-[#fff] overflow-hidden font-sans">
      {/* Gradientes pasteles sutiles de fondo */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-gradient-to-br from-blue-50 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-gradient-to-tl from-purple-50 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Lado Izquierdo: Explicación de Valor Técnico */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-[300%] font-light text-[#1a1a1a] leading-[1.1] tracking-tighter max-w-2xl">
              <span className="font-bold">Exponential Optimization:</span> <br />
              The AI-driven core of Servex catalog operations.
            </h1>
            <p className="text-lg text-gray-500 font-light max-w-md leading-relaxed">
              We empower our collaborators by replacing cumbersome Excel workflows with a centralized ecosystem for data analysis, comparison, and intelligent AI assistance.
            </p>
          </div>
          
          <button className="group relative bg-[#1a1a1a] text-white px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#ff4d29] overflow-hidden">
            <span className="relative z-10">View Technical Workflow</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-[#ff4d29] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Lado Derecho: Grid de Estadísticas (Ref: Screenshot 2026-05-14 at 09.24.43_2.png) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <span className="text-6xl md:text-7xl font-light text-[#1a1a1a] tracking-tighter">
                {stat.value}
              </span>
              <p className="text-[13px] uppercase tracking-wider text-gray-400 font-medium leading-tight max-w-[220px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StatsSection;