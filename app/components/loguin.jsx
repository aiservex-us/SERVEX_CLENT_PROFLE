'use client';

import { signInWithGoogle, signInWithAzure } from '@/app/lib/supabaseClient';

export default function LoginComponent() {
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error Google Login:", error);
    }
  };

  const handleAzureLogin = async () => {
    try {
      await signInWithAzure();
    } catch (error) {
      console.error("Error Azure Login:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white">
      <div className="w-full">
        <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-4">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              SERVEX<span className="text-indigo-600">_AI</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">Auth Portal</p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm bg-white text-slate-700 hover:bg-slate-50 transition-all font-semibold text-sm active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span>Acceso Clientes</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]"><span className="px-3 bg-white text-slate-300">Corporativo</span></div>
          </div>

          <button
            onClick={handleAzureLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200 font-semibold text-sm active:scale-95"
          >
            <img src="https://authjs.dev/img/providers/azure.svg" className="w-5 h-5 invert" alt="Azure" />
            <span>Staff Servex US</span>
          </button>
        </div>
      </div>
    </div>
  );
}