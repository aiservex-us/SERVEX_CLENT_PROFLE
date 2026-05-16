'use client';

import React, { useState } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabaseGoogle } from '@/app/lib/supabaseClient';

const LogoutButton = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabaseGoogle.auth.signOut();
      if (error) throw error;
      
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Botón de activación original */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider text-[#464775] hover:bg-[#c7c7df] border border-transparent hover:border-[#53548b] transition-all duration-200 focus:outline-none"
        title="Sign out corporate session"
      >
        <LogOut size={11} className="shrink-0" />
        <span>Sign Out</span>
      </button>

      {/* Modal Personalizado (Fluent Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4  backdrop-blur-xs transition-opacity duration-200">
          
          {/* Contenedor del Modal */}
          <div className="w-full max-w-[340px] bg-white rounded-[6px] border border-[#E0E0E0] shadow-xl overflow-hidden font-sans antialiased animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <div className="flex items-center gap-1.5 text-[#464775]">
                <AlertTriangle size={14} className="text-[#E0A75E]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Confirm Action</span>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="text-[#616161] hover:text-[#242424] transition-colors focus:outline-none"
                disabled={isSubmitting}
              >
                <X size={14} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-4">
              <h4 className="text-[13px] font-bold text-[#242424] leading-tight">
                Sign Out Corporate Session?
              </h4>
              <p className="text-[11px] text-[#616161] font-normal mt-1.5 leading-normal">
                You will be redirected to the landing page. Private configurations for <span className="font-semibold text-[#464775]">SVX Copilot</span> won't be accessible until you log back in.
              </p>
            </div>

            {/* Footer de Acciones */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#FAFAFA] border-t border-[#E0E0E0]">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-[11px] font-semibold text-[#616161] bg-white border border-[#D1D1D1] rounded-[4px] hover:bg-[#F3F2F1] hover:text-[#242424] transition-all duration-150 focus:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleLogout}
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[80px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-[#464775] rounded-[4px] hover:bg-[#3b3c63] border border-transparent shadow-xs transition-all duration-150 focus:outline-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;