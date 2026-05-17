'use client';
import Table from './components/table'
import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';
import { 
  ChevronLeft, 
  Headphones, 
  Settings,
  Menu,
  X,
  LogOut // Imported the icon for logging out
} from 'lucide-react';

import LogoutButton from './components/LogoutButton'; // Importación del componente creado en la carpeta components

// =========================================================================
// COMPONENT 1: CLIENT PROFILE CARD (Fluent Full-Width Integration)
// =========================================================================
const ClientProfileCard = ({ isCollapsed, profileData, loading, hasError }) => {
  
  // Toda la lógica interna de handleLogout fue removida de aquí sin alterar el flujo original

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
      
      {/* Full-bleed Cover */}
      <div className="relative h-24 w-full bg-[#6264A7] overflow-hidden">
        <div className="relative h-24 w-full bg-[#6264A7] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('/fndPrfile.jpg')",
              opacity: 0.8 // Raised opacity to test visibility
            }}
          />
        </div>
      </div>

      {/* Centered Avatar */}
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

      {/* Information Block */}
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

      {/* Exception Management */}
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

      {/* Internal Access Section - SVX Copilot */}
      <div className="flex justify-center items-center mt-3.5">
  <div className="relative group">
    
    {/* Internal Access Section - SVX Copilot */}
    {/* Contenedor principal para darle cuerpo al perfil y evitar que se vea vacío */}
    <div className="flex flex-col justify-center items-center mt-3.5 p-6 border border-[#E0E0E0] bg-[#FAFAFA] rounded-xl shadow-xs max-w-xs text-center">
      
      {/* Título sobre el logo */}
      <h3 className="text-xs font-semibold text-[#292929] mb-3 tracking-tight">
        Svx Copilot System
      </h3>

      <div className="relative group">
        
        {/* Access Link with Logo (Opens in new tab) */}
        <a 
          href="https://servex-ai-iota.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 rounded-md hover:bg-[#F3F2F1] transition-all duration-200 cursor-pointer focus:outline-none"
        >
          <img 
            src="/logo2.png" 
            alt="SVX Copilot" 
            className="h-5 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
          />
        </a>

        {/* Tooltip (Informative popup) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#292929]/95 backdrop-blur-sm text-white text-[11px] rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 border border-[#424242]">
          
          {/* Tooltip Content */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 border-b border-[#424242] pb-1">
              <span className="font-semibold text-[#464775]">Svx Copilot</span>
              <span className="text-[9px] bg-[#464775] text-white px-1 py-0.2 rounded font-medium tracking-wide uppercase">
                XML DATA MANAGER
              </span>
            </div>
            
            <p className="text-[#D1D1D1] leading-normal">
              Data science for catalog integration into <span className="font-semibold text-white">CET</span>.
            </p>
            
            {/* Restricted access notice */}
            <div className="pt-1 flex items-center gap-1 text-[10px] text-[#E0A75E] font-medium border-t border-[#424242]/40 mt-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Exclusive for Servex collaborators and experts</span>
            </div>
          </div>

          {/* Tooltip bottom arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#292929]/95" />
        </div>

      </div>

      {/* Texto corto debajo del logo */}
      <p className="text-[8px] text-[#616161] mt-2 mb-4 max-w-[200px] leading-relaxed">
        Plataforma automatizada para la gestión inteligente y análisis de datos XML de catálogos.
      </p>

      {/* Logout Button colocado en la misma posición, funcionando exactamente igual */}
      <LogoutButton />
    </div>
  </div>
</div>
    </div>
  );
};

// =========================================================================
// MAIN CONTAINER COMPONENT: SIDEBAR SYSTEM (MOBILE FULL-WIDTH OPTIMIZED)
// =========================================================================
export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Profile state lifted to main container to share with the Footer
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
      
      {/* MOBILE TRIGGER BUTTON (Burger Menu) */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border border-[#E0E0E0] rounded-[4px] text-[#616161] hover:text-[#6264A7] shadow-xs active:scale-95"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* INTERACTIVE SIDEBAR */}
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
            <span className="text-[11px] font-bold uppercase text-[#616161] tracking-wider">Navigation Menu</span>
          </div>
        </div>

        {/* FULL-BLEED CENTRAL AREA */}
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

        {/* CORPORATE FOOTER */}
        <div className="p-3 border-t border-[#E0E0E0] bg-[#F5F5F5] space-y-1 shrink-0">
          
          {/* DYNAMIC PROFILE BUTTON (Only visible on Desktop when Collapsed) */}
          {isCollapsed && profileData && !loadingProfile && (
            <button
              onClick={() => setIsCollapsed(false)} // Allows expanding the menu by clicking on the photo
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

          

          {/* CORPORATE COMPONENT: SVX COPILOT */}
          <div className={`
            mt-2 flex items-center rounded-[4px] transition-all duration-300
            ${isCollapsed ? 'md:justify-center md:h-10 md:bg-transparent' : 'p-2.5 bg-[#464775] text-white shadow-sm'}
            p-2.5 bg-[#464775] text-white
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
                  Svx Command
                </p>
                <p className="text-[6px] opacity-80 font-medium whitespace-nowrap mt-0.5">
                  Next-gen Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* LEGAL COPYRIGHT */}
          <div className={`
            transition-all duration-[300ms] overflow-hidden pt-1.5 text-center
            ${isCollapsed ? 'md:max-h-0 md:opacity-0' : 'max-h-6 opacity-100'}
            max-h-6 opacity-100
          `}>
            <p className="text-[6px] text-[#616161] leading-none tracking-tight uppercase font-bold">
              © 2026 GLYNNE S.A.S
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN APP CONTENT */}
      <main className="flex-1 min-w-0 p-6 pt-16 md:pt-6">
        {/* Your main content here */}
  <Table />
      </main>

    </div>
  );
}