'use client';

import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';
import { 
  ChevronLeft, 
  Headphones, 
  Settings,
  Menu,
  X 
} from 'lucide-react';

// =========================================================================
// COMPONENTE 1: CLIENT PROFILE CARD (Fluent Full-Width Integration)
// =========================================================================
const ClientProfileCard = ({ isCollapsed, profileData, loading, hasError }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[140px]">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6264A7]"></div>
      </div>
    );
  }

  if (!profileData || isCollapsed) return null;

  return (
    <div className="w-full bg-white font-sans antialiased border-b border-[#E0E0E0] pb-4 overflow-hidden transition-all duration-300">
      
      {/* Portada a Sangre */}
      <div className="relative h-24 w-full bg-[#6264A7] overflow-hidden">
      <div className="relative h-24 w-full bg-[#6264A7] overflow-hidden">
  <div 
    className="absolute inset-0 bg-cover bg-center"
    style={{ 
      backgroundImage: "url('/fndPrfile.jpg')",
      opacity: 0.8 // Subimos la opacidad para probar si se ve
    }}
  />
</div>
      
      </div>

      {/* Avatar Centrado */}
      <div className="flex justify-center -mt-10 mb-2.5 relative z-10">
        <div className="p-[2px] rounded-full bg-[#6264A7] shadow-md">
          <div className="rounded-full p-[2px] bg-white">
            {profileData.avatar ? (
              <img 
                src={profileData.avatar} 
                alt={profileData.name} 
                className="w-16 h-16 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#E1DFDD] text-[#6264A7] flex items-center justify-center text-base font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute bottom-0.5 right-1/2 translate-x-9 w-4 h-4 bg-[#92C353] border-2 border-white rounded-full"></div>
        </div>
      </div>

      {/* Bloque Informativo */}
      <div className="text-center px-4 mb-4">
        <h3 className="text-[14px] font-bold text-[#242424] tracking-tight truncate" title={profileData.name}>
          {profileData.name}
        </h3>
        <p className="text-[11px] text-[#616161] font-normal mt-0.5 truncate" title={profileData.email}>
          {profileData.email}
        </p>
        <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-[2px] bg-[#F0F0F0] text-[9px] font-medium text-[#616161] border border-[#E0E0E0]">
          REG: {profileData.joinedDate}
        </span>
      </div>

      {/* Gestión de Excepciones */}
      {hasError && (
        <div className="mx-4 mb-3 p-2 text-[10px] text-[#A80000] bg-[#FDE7E9] rounded-[2px] border border-[#F3B0B4] flex items-start space-x-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#A80000] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-tight font-medium">Session / submission parameters unresolved.</span>
        </div>
      )}

      {/* Metadata Panel */}
      <div className="mx-4 px-3 py-2.5 bg-[#FAFAFA] rounded-[4px] border border-[#E0E0E0] space-y-2">
        <div className="flex items-center justify-between min-w-0">
          <span className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Company</span>
          <span className="text-[11px] font-medium text-[#242424] truncate max-w-[140px]" title={profileData.companyName}>
            {profileData.companyName}
          </span>
        </div>

        <div className="flex items-center justify-between min-w-0 pt-2 border-t border-[#E0E0E0]">
          <span className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Corporate</span>
          <span className="text-[11px] font-medium text-[#242424] truncate max-w-[140px]" title={profileData.submissionEmail}>
            {profileData.submissionEmail}
          </span>
        </div>

        <div className="flex items-center justify-between min-w-0 pt-2 border-t border-[#E0E0E0]">
          <span className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Region</span>
          <span className="text-[11px] font-medium text-[#242424] truncate max-w-[140px]" title={profileData.location}>
            {profileData.location}
          </span>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="flex justify-center items-center gap-5 mt-3.5">
        {/* ...Iconos de redes mapeados de tu código original... */}
        <button className="text-[#616161] hover:text-[#6264A7] transition-colors p-0.5">
          <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        </button>
        <button className="text-[#616161] hover:text-[#6264A7] transition-colors p-0.5">
          <svg className="w-[13px] h-[13px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// COMPONENTE CONTENEDOR PRINCIPAL: SIDEBAR SYSTEM (MOBILE FULL-WIDTH OPTIMIZED)
// =========================================================================
export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Estado del perfil elevado al contenedor principal para compartirlo con el Footer
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [hasErrorProfile, setHasErrorProfile] = useState(false);

  useEffect(() => {
    const fetchProfileAndSubmission = async () => {
      try {
        setLoadingProfile(true);
        setHasErrorProfile(false);
        
        const { data: { user }, error: authError } = await supabaseGoogle.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const userAvatar = user.user_metadata?.avatar_url || '';
          const userName = user.user_metadata?.full_name || 'User Name';
          const userEmail = user.email || '';
          
          const registrationDate = new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          const { data: submission, error: dbError } = await supabaseGoogle
            .from('client_submissions')
            .select('company_name, contact_email, country, city')
            .eq('user_id', user.id)
            .maybeSingle();

          if (dbError) throw dbError;

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
        setLoadingProfile(false);
      }
    };

    const loadFallbackData = () => {
      setHasErrorProfile(true);
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

  return (
    <div className="flex min-h-screen w-full bg-[#FFF] text-[#242424] antialiased overflow-hidden relative">
      
      {/* BOTÓN DISPARADOR MÓVIL (Burger Menu) */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border border-[#E0E0E0] rounded-[4px] text-[#616161] hover:text-[#6264A7] shadow-xs active:scale-95"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* MENÚ LATERAL INTERACTIVO */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col bg-[#F5F5F5] border-r border-[#E0E0E0]
          transition-all duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]
          w-full -translate-x-full md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:sticky md:h-screen md:shrink-0 md:top-0
          ${isCollapsed ? 'md:w-[50px]' : 'md:w-[305px]'} 
        `}
      >
        {/* HEADER CONTROL */}
        <div className="h-0 flex items-center justify-end px-4 shrink-0 relative  bg-white">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-3.5 w-6 h-6 bg-white border border-[#E0E0E0] rounded-full items-center justify-center shadow-xs hover:shadow-sm hover:text-[#6264A7] text-[#616161] transition-all z-50 active:scale-95"
          >
            <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="md:hidden w-full flex justify-start items-center pl-10">
            <span className="text-[11px] font-bold uppercase text-[#616161] tracking-wider">Menú de Navegación</span>
          </div>
        </div>

        {/* ÁREA CENTRAL A SANGRE */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar bg-white">
          <div className={`
            w-full transition-all duration-[300ms] origin-top
            ${isCollapsed ? 'md:opacity-0 md:scale-95 md:pointer-events-none md:max-h-0 md:overflow-hidden' : 'opacity-100 scale-100'}
          `}>
            <ClientProfileCard 
              isCollapsed={isMobileOpen ? false : isCollapsed} 
              profileData={profileData}
              loading={loadingProfile}
              hasError={hasErrorProfile}
            />
          </div>
        </div>

        {/* FOOTER CORPORATIVO */}
        <div className="p-3 border-t border-[#E0E0E0] bg-[#F5F5F5] space-y-1 shrink-0">
          
          {/* BOTÓN DINÁMICO DE PERFIL (Solo visible en Desktop cuando está Colapsado) */}
          {isCollapsed && profileData && !loadingProfile && (
            <button
              onClick={() => setIsCollapsed(false)} // Permite expandir el menú al hacer click en su foto
              className="hidden md:flex w-full items-center justify-center h-10 rounded-[4px] hover:bg-[#E0E0E0] transition-all duration-150 mb-2"
              title={profileData.name}
            >
              <div className="w-5 h-5 rounded-full p-[1px] bg-[#6264A7] flex items-center justify-center shadow-xs">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Mini Profile" 
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#E1DFDD] text-[#6264A7] flex items-center justify-center text-[9px] font-bold">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </button>
          )}

          {/* SOPORTE Y CONFIGURACIÓN */}
          {[
            { label: 'Support', icon: Headphones },
            { label: 'Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const collapsedClasses = isCollapsed ? 'md:justify-center md:h-10' : 'px-3 py-2';
            const collapsedLabelClasses = isCollapsed ? 'md:max-w-0 md:opacity-0 md:ml-0' : 'max-w-[200px] opacity-100 ml-3';
            
            return (
              <button
                key={item.label}
                onClick={() => { if(isMobileOpen) setIsMobileOpen(false); }}
                className={`
                  w-full flex items-center rounded-[4px] text-[#616161] hover:bg-[#E0E0E0] hover:text-[#242424] transition-all duration-150
                  ${collapsedClasses} px-3 py-2
                `}
              >
                <Icon size={(isCollapsed) ? 16 : 14} className="shrink-0" />
                <div className={`
                  overflow-hidden transition-all duration-[300ms]
                  ${collapsedLabelClasses} max-w-[200px] opacity-100 ml-3
                `}>
                  <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* COMPONENTE CORPORATIVO: SVX COPILOT */}
          <div className={`
            mt-2 flex items-center rounded-[4px] transition-all duration-300
            ${isCollapsed ? 'md:justify-center md:h-10 md:bg-transparent' : 'p-2.5 bg-[#6264A7] text-white shadow-sm'}
            p-2.5 bg-[#6264A7] text-white
          `}>
            <div className="relative shrink-0">
              <div className={`rounded-[2px] flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'md:w-8 md:h-8 md:p-1.5 md:bg-[#6264A7] md:hover:scale-105 md:shadow-sm' : 'w-7 h-7 p-1.5 bg-white/20 backdrop-blur-md'} w-7 h-7 p-1.5 bg-white/20 backdrop-blur-md`}>
                <img
                  src="/logo2.png" 
                  alt="Svx"
                  className="w-full h-full object-contain brightness-200"
                />
              </div>
            </div>
            
            <div className={`
              overflow-hidden transition-all duration-[300ms]
              ${isCollapsed ? 'md:max-w-0 md:opacity-0 md:ml-0' : 'max-w-[200px] opacity-100 ml-3'}
              max-w-[200px] opacity-100 ml-3
            `}>
              <div className="flex flex-col leading-none text-white">
                <p className="text-[10px] font-black tracking-tight uppercase">
                  Svx Copilot
                </p>
                <p className="text-[7.5px] opacity-80 font-medium whitespace-nowrap mt-0.5">
                  Next-gen Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* COPYRIGHT LEGAL */}
          <div className={`
            transition-all duration-[300ms] overflow-hidden pt-1.5 text-center
            ${isCollapsed ? 'md:max-h-0 md:opacity-0' : 'max-h-6 opacity-100'}
            max-h-6 opacity-100
          `}>
            <p className="text-[7px] text-[#616161] leading-none tracking-tight uppercase font-bold">
              © 2026 GLYNNE S.A.S
            </p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DE LA APP */}
      <main className="flex-1 p-6 pt-16 md:pt-6">
        {/* Tu contenido principal aquí */}
  
      </main>

    </div>
  );
}