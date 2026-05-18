import React, { useState, useEffect } from 'react';

const WelcomeScreen = () => {
  // Estado para controlar cuándo arranca la animación de entrada del logo
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Un micro-delay para asegurar que el DOM registró el estado inicial (hidden/scaled down)
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[90vh] bg-slate-50/50 px-6 select-none font-sans">
      <div className="flex flex-col items-center max-w-sm text-center space-y-6 animate-fade-in">
        
        {/* Contenedor del Logo con animación de lujo (Smooth Scale + Fade In) */}
        <div 
          className={`
            transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]
            hover:opacity-100 table-cell
            ${isLoaded ? 'opacity-90 scale-100 blur-0' : 'opacity-0 scale-75 blur-[2px]'}
          `}
        >
          <img 
            src="/logo.png" 
            alt="Servex Logo" 
            className="h-8 w-auto object-contain mix-blend-multiply"
            draggable="false"
          />
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;