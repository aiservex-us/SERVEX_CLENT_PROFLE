'use client';
import Table from './table'
import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';
import LogoutButton from './LogoutButton';

// =========================================================================
// COMPONENT 1: CLIENT PROFILE SECTION (Full-Height Solid Section)
// =========================================================================
const ClientProfileSection = ({ profileData, loading, hasError }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px] w-full bg-white rounded-xl border border-[#E0E0E0]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6264A7]"></div>
        <p className="text-xs text-[#616161] mt-3 animate-pulse">Cargando credenciales de operador...</p>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="w-full h-[85vh] bg-white font-sans antialiased border border-[#E0E0E0] rounded-xl overflow-hidden shadow-xs transition-all duration-300 flex flex-col">
      
      {/* Full-bleed Cover con un degradado sutil corporativo */}
      <div className="relative h-28 w-full bg-gradient-to-r from-[#4F5188] to-[#6264A7] overflow-hidden shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/fndPrfile.jpg')",
            opacity: 0.4
          }}
        />
        <div className="absolute top-3 right-3">
          <span className="text-[9px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-white/10">
            {profileData.environment}
          </span>
        </div>
      </div>

      {/* Centered Avatar & Status */}
      <div className="flex justify-center -mt-10 mb-2 relative z-10 shrink-0">
        <div className="p-[2px] rounded-full bg-white shadow-md">
          <div className="rounded-full relative">
            {profileData.avatar ? (
              <img 
                src={profileData.avatar} 
                alt={profileData.name} 
                className="w-16 h-16 rounded-full object-cover border border-[#E0E0E0]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#F3F2F1] text-[#6264A7] flex items-center justify-center text-lg font-bold border border-[#E0E0E0]">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#107C41] border-2 border-white rounded-full" title="Operador Activo"></div>
          </div>
        </div>
      </div>

      {/* Information Block */}
      <div className="text-center px-6 mb-4 shrink-0">
        <h3 className="text-sm font-bold text-[#242424] tracking-tight truncate" title={profileData.name}>
          {profileData.name}
        </h3>
        <p className="text-[11px] text-[#616161] font-mono mt-0.5 truncate" title={profileData.email}>
          {profileData.email}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className="px-2 py-0.5 rounded-sm bg-[#E4E4E7] text-[9px] font-bold text-[#3F3F46] tracking-wide uppercase">
            {profileData.role}
          </span>
          <span className="px-2 py-0.5 rounded-sm bg-[#E2F1FF] text-[9px] font-bold text-[#0066CC] tracking-wide uppercase">
            AUTH: {profileData.provider}
          </span>
        </div>
      </div>

      {/* Exception Management */}
      {hasError && (
        <div className="mx-5 mb-3 p-2.5 text-[11px] text-[#A80000] bg-[#FDE7E9] rounded-md border border-[#F3B0B4] flex items-start space-x-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#A80000] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-tight font-medium">Parámetros de sesión locales o fallback activos.</span>
        </div>
      )}

      {/* SEGMENTO DE ALTA CALIDAD: METADATOS TÉCNICOS Y DEL SISTEMA */}
      <div className="mx-5 px-3 py-2.5 bg-[#FAFAFA] rounded-xl border border-[#E0E0E0] space-y-2.5 flex-1 overflow-y-auto min-h-[140px]">
        <div>
          <span className="text-[9px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">Ecosistema & Organización</span>
          <div className="bg-white border border-[#E5E5E7] rounded-lg p-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#616161]">Compañía</span>
              <span className="font-semibold text-[#242424] truncate max-w-[140px]">{profileData.companyName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#616161]">ID Operador</span>
              <span className="font-mono text-[10px] text-[#616161] select-all truncate max-w-[120px]" title={profileData.uid}>
                {profileData.uid}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#616161]">Ubicación</span>
              <span className="text-[#242424] font-medium">{profileData.location}</span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-[9px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">Métricas de Integración (CET)</span>
          <div className="bg-white border border-[#E5E5E7] rounded-lg p-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#616161]">Último Acceso</span>
              <span className="font-mono text-[#242424]">{profileData.lastSignIn}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#616161]">Pipelines Activos</span>
              <span className="font-bold text-[#107C41] bg-[#DFF6DD] px-1.5 py-0.2 rounded-sm text-[10px]">
                {profileData.activePipelines}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#616161]">Auditorías Ejecutadas</span>
              <span className="font-mono font-medium text-[#242424]">{profileData.auditCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Access Section - SVX Copilot & Logout Container */}
      <div className="mt-3 mx-5 mb-5 p-4 border border-[#E0E0E0] bg-[#FAFAFA] rounded-xl text-center shrink-0 flex flex-col justify-between items-center min-h-[180px]">
        
        <div className="w-full">
          <h3 className="text-[10px] font-bold text-[#292929] mb-2 tracking-tight uppercase">
            Svx Copilot System
          </h3>

          <div className="inline-block relative">
            <div className="relative group inline-block">
              <a 
                href="https://servex-ai-iota.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-1.5 rounded-md hover:bg-[#F3F2F1] transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <img 
                  src="/logo2.png" 
                  alt="SVX Copilot" 
                  className="h-5 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </a>

        
              
            </div>
          </div>

          <p className="text-[10px] text-[#616161] mt-1 max-w-[200px] mx-auto leading-relaxed">
            Data Orchestration Engine para la gestión inteligente de catálogos técnicos.
          </p>
        </div>

        {/* Logout Button */}
        <div className="w-full pt-3 mt-3 border-t border-[#E0E0E0]/60">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MAIN CONTAINER COMPONENT: FULL SECTOR LAYOUT
// =========================================================================
export default function Home() {
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [hasErrorProfile, setHasErrorProfile] = useState(false);

  useEffect(() => {
    const fetchProfileAndSubmission = async () => {
      try {
        setLoadingProfile(true);
        setHasErrorProfile(false);
        
        // 1. Obtener la sesión real de Supabase
        const { data: { user }, error: authError } = await supabaseGoogle.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const userAvatar = user.user_metadata?.avatar_url || '';
          const userName = user.user_metadata?.full_name || 'SVX Operator';
          const userEmail = user.email || '';
          
          // Formatear fechas desde los claims nativos
          const registrationDate = new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
          const lastLogin = user.last_sign_in_at 
            ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Just now';

          // Detectar el proveedor de autenticación de forma dinámica
          const authProvider = user.app_metadata?.provider || 'Google/Azure';

          // 2. Traer información de la base de datos empresarial
          const { data: submission, error: dbError } = await supabaseGoogle
            .from('client_submissions')
            .select('company_name, country, city')
            .eq('user_id', user.id)
            .maybeSingle();

          if (dbError) throw dbError;

          // NOTA: Estas métricas de pipelines se pueden conectar a tu tabla de logs o auditoría real mediante un conteo simple.
          setProfileData({
            uid: user.id.substring(0, 18) + '...', // Evitar IDs excesivamente largos en UI
            avatar: userAvatar,
            name: userName,
            email: userEmail,
            joinedDate: registrationDate,
            lastSignIn: lastLogin,
            provider: authProvider.toUpperCase(),
            role: userEmail.endsWith('@servex.us') || userEmail.endsWith('.ai') ? 'SYSTEM_ADMIN' : 'EXTERNAL_CLIENT',
            environment: process.env.NODE_ENV === 'production' ? 'PROD_ENV' : 'DEV_DEV',
            companyName: submission?.company_name || 'Servex US Partner',
            location: submission?.country && submission?.city 
              ? `${submission.city}, ${submission.country}` 
              : 'Bogotá, CO', // Fallback dinámico regional
            activePipelines: '4 Active', // Mock de alta calidad convertible a un .select('count') real
            auditCount: '142 Runs'
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
        uid: 'usr_clnt_98234x711',
        avatar: '', 
        name: 'Demo Command Operator',
        email: 'operator@servex.ai',
        joinedDate: 'May 2026',
        lastSignIn: 'May 17, 10:26 AM',
        provider: 'AZURE_OAUTH',
        role: 'SYS_ARCHITECT',
        environment: 'STAGING_ENV',
        companyName: 'Servex Enterprise',
        location: 'Bogotá, CO',
        activePipelines: 'Beta Mode',
        auditCount: '0 Total'
      });
    };

    fetchProfileAndSubmission();
  }, []);

  return (
    <div className="h-[75vh] w-full bg-[#FAFAFA] text-[#242424] antialiased p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE NEW TECH-READY PROFILE */}
        <section className="lg:col-span-4 w-full lg:sticky lg:top-8 space-y-4">
          <ClientProfileSection 
            profileData={profileData}
            loading={loadingProfile}
            hasError={hasErrorProfile}
          />
        </section>

        {/* RIGHT COLUMN: MAIN CONTENT & DATA MANAGEMENT */}
        <main className="lg:col-span-8 w-full bg-white border border-[#E0E0E0] rounded-xl p-4 md:p-6 shadow-xs h-[85vh]">
          <p>hola</p>
        </main>

      </div>
    </div>
  );
}