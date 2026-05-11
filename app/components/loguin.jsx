// components/LoginComponent.js
'use client';

import { signInWithGoogle, signInWithAzure } from '@/app/lib/supabaseClient';

export default function LoginComponent() {
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert("Error al conectar con Google");
    }
  };

  const handleAzureLogin = async () => {
    try {
      await signInWithAzure();
    } catch (error) {
      alert("Error al conectar con Microsoft");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          SERVEX_AI - Acceso
        </h1>
        
        <div className="space-y-4">
          {/* Botón para Clientes / Externos */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span>Acceso Clientes con Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Uso Interno</span></div>
          </div>

          {/* Botón para Staff (Azure) */}
          <button
            onClick={handleAzureLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#2F2F2F] text-white rounded-md hover:bg-black transition-colors"
          >
            <img src="https://authjs.dev/img/providers/azure.svg" className="w-5 h-5" alt="Azure" />
            <span>Acceso Staff (Servex US)</span>
          </button>
        </div>
      </div>
    </div>
  );
}