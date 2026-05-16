'use client';

import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';

const ClientProfileCard = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchProfileAndSubmission = async () => {
      try {
        setLoading(true);
        setHasError(false);
        
        // 1. Obtener la identidad e información de autenticación de Google
        const { data: { user }, error: authError } = await supabaseGoogle.auth.getUser();
        if (authError) throw authError;

        if (user) {
          // Extraer metadatos nativos de la cuenta de Google
          const userAvatar = user.user_metadata?.avatar_url || '';
          const userName = user.user_metadata?.full_name || 'User Name';
          const userEmail = user.email || '';
          
          // Formatear la fecha de creación/registro en el ecosistema
          const registrationDate = new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          // 2. Consultar la tabla client_submissions para traer la metadata empresarial
          const { data: submission, error: dbError } = await supabaseGoogle
            .from('client_submissions')
            .select('company_name, contact_email, country, city')
            .eq('user_id', user.id)
            .maybeSingle();

          if (dbError) throw dbError;

          // Consolidar toda la información real en el estado local
          setProfileData({
            avatar: userAvatar,
            name: userName,
            email: userEmail,
            joinedDate: registrationDate,
            companyName: submission?.company_name || 'Not Configured',
            submissionEmail: submission?.contact_email || 'Not Configured',
            location: submission?.country && submission?.city 
              ? `${submission.city}, ${submission.country}` 
              : 'Location Pending'
          });
        } else {
          loadFallbackData();
        }
      } catch (error) {
        console.error('Error fetching ecosystem profile data:', error);
        loadFallbackData();
      } finally {
        // CORREGIDO: Usar el actualizador del estado de React correctamente
        setLoading(false);
      }
    };

    const loadFallbackData = () => {
      setHasError(true);
      setProfileData({
        avatar: '', 
        name: 'Demo Client Profile',
        email: 'demo.user@servex.ai',
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        companyName: 'Example Corp LLC',
        submissionEmail: 'corporate@example.com',
        location: 'Silicon Valley, US'
      });
    };

    fetchProfileAndSubmission();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3 min-h-[120px]">
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#6264A7]"></div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="bg-[#FFF]  w-[300px] rounded-[4px] -ml-[20px] font-sans antialiased mx-auto">
      
      {/* Contenedor principal ultracompacto */}
      <div className="bg-white rounded-[4px]  border border-[#E0E0E0] shadow-sm pb-2.5">
        
        {/* Portada Fija Altura Reducida */}
        <div className="relative h-24 w-full bg-[#6264A7] overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=400&auto=format&fit=crop')` }}
          />
          
          {/* Botón de acción minimalista */}
          <button className="absolute top-2 right-2 w-6 h-6 rounded-[4px] bg-white/90 flex items-center justify-center text-[#424242] hover:bg-white hover:text-[#6264A7] transition-all active:scale-95 shadow-xs border border-[#E0E0E0]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Avatar Miniaturizado */}
        <div className="relative flex justify-center -mt-9 mb-2">
          <div className="relative p-[2px] rounded-full bg-[#6264A7] shadow-sm">
            <div className="rounded-full p-[1.5px] bg-white">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt={profileData.name} 
                  className="w-14 h-14 rounded-full object-cover border border-[#EDEBE9]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#E1DFDD] text-[#6264A7] flex items-center justify-center text-sm font-bold border border-[#EDEBE9]">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Indicador de Estado Disponible típico de Teams */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#92C353] border-2 border-white rounded-full"></div>
          </div>
        </div>

        {/* Textos Principales Ajustados */}
        <div className="text-center px-3 mb-3">
          <h3 className="text-[14px] font-semibold text-[#242424] tracking-tight truncate" title={profileData.name}>
            {profileData.name}
          </h3>
          <p className="text-[11px] text-[#616161] font-normal mt-0.5 truncate" title={profileData.email}>
            {profileData.email}
          </p>
          <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-[2px] bg-[#F0F0F0] text-[9px] font-normal text-[#616161] border border-[#E0E0E0]">
            Reg: {profileData.joinedDate}
          </span>
        </div>

        {/* Alerta de sesión armónica compacta */}
        {hasError && (
          <div className="mx-2.5 mb-2.5 p-1.5 text-[9px] text-[#A80000] bg-[#FDE7E9] rounded-[2px] border border-[#F3B0B4] flex items-start space-x-1">
            <svg className="w-3 h-3 flex-shrink-0 text-[#A80000] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-tight font-medium">Session / submission parameters unresolved.</span>
          </div>
        )}

        {/* Sección de Metadata Densificada */}
        <div className="mx-2.5 px-2.5 py-2 bg-[#FAFAFA] rounded-[4px] border border-[#E0E0E0] space-y-1.5">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-[10px] font-semibold text-[#616161] uppercase tracking-wider">Company</span>
            <span className="text-[11px] font-normal text-[#242424] truncate max-w-[120px]" title={profileData.companyName}>
              {profileData.companyName}
            </span>
          </div>

          <div className="flex items-center justify-between min-w-0 pt-1.5 border-t border-[#E0E0E0]">
            <span className="text-[10px] font-semibold text-[#616161] uppercase tracking-wider">Corporate</span>
            <span className="text-[11px] font-normal text-[#242424] truncate max-w-[120px]" title={profileData.submissionEmail}>
              {profileData.submissionEmail}
            </span>
          </div>

          <div className="flex items-center justify-between min-w-0 pt-1.5 border-t border-[#E0E0E0]">
            <span className="text-[10px] font-semibold text-[#616161] uppercase tracking-wider">Region</span>
            <span className="text-[11px] font-normal text-[#242424] truncate max-w-[120px]" title={profileData.location}>
              {profileData.location}
            </span>
          </div>
        </div>

        {/* Redes Sociales Redimensionadas */}
        <div className="flex justify-center items-center gap-4 mt-2.5 pt-2 border-t border-[#E0E0E0]">
          <button className="text-[#616161] hover:text-[#6264A7] transition-colors p-0.5">
            <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </button>
          <button className="text-[#616161] hover:text-[#6264A7] transition-colors p-0.5">
            <svg className="w-[13px] h-[13px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
          <button className="text-[#616161] hover:text-[#6264A7] transition-colors p-0.5">
            <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-7.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 15c-5.24 0-9.5-4.26-9.5-9.5S6.76 2.5 12 2.5s9.5 4.26 9.5 9.5-4.26 9.5-9.5 9.5zm0-20C5.66 1.5.5 6.66.5 13S5.66 24.5 12 24.5 23.5 19.34 23.5 13 18.34 1.5 12 1.5z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientProfileCard;