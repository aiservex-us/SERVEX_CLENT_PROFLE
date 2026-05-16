import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';

const ClientProfileCard = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndSubmission = async () => {
      try {
        setLoading(true);
        
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
            month: 'long',
            day: 'numeric'
          });

          // 2. Consultar la tabla client_submissions para traer la metadata empresarial
          const { data: submission, error: dbError } = await supabaseGoogle
            .from('client_submissions')
            .select('company_name, contact_email, country, city')
            .eq('user_id', user.id)
            .maybeSingle();

          if (dbError) throw dbError;

          // Consolidar toda la información en el estado local
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
        }
      } catch (error) {
        console.error('Error fetching ecosystem profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSubmission();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[200px]">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#464775]"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-4 text-xs text-[#A80000] bg-[#FFF] rounded border border-[#E1E1E1] font-sans">
        Active session parameters or submission data could not be resolved.
      </div>
    );
  }

  return (
    <div className="bg-white max-w-md w-full rounded-lg border border-[#E1E1E1] shadow-[0_4px_12px_rgba(0,0,0,0.06)] font-sans antialiased overflow-hidden">
      {/* Profile Header Block */}
      <div className="p-4 flex items-center space-x-3.5 border-b border-[#EDEBE9] bg-[#FAF9F8]">
        {profileData.avatar ? (
          <img 
            src={profileData.avatar} 
            alt={profileData.name} 
            className="w-12 h-12 rounded-full object-cover border border-[#D1D1D1]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#E3E4F3] text-[#464775] flex items-center justify-center text-sm font-bold border border-[#C8C6C4]">
            {profileData.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#242424] truncate" title={profileData.name}>
            {profileData.name}
          </h3>
          <p className="text-[11px] text-[#616161] truncate">
            {profileData.email}
          </p>
          <div className="flex items-center space-x-1 mt-1 text-[10px] text-[#8A8886]">
            <svg className="w-3 h-3 text-[#616161]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Registered: {profileData.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Client Submissions Ecosystem Parameters */}
      <div className="p-4 space-y-3 bg-[#FFFFFF]">
        <div className="flex items-center space-x-1.5 pb-1 border-b border-[#F3F2F1]">
          <svg className="w-3.5 h-3.5 text-[#464775]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Ecosystem Profile Metadata</span>
        </div>

        {/* Dynamic Fields Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F3F2F1] p-2 rounded border border-[#EDEBE9]">
            <span className="text-[9px] font-bold text-[#616161] uppercase block mb-0.5">Company Name</span>
            <span className="text-xs font-semibold text-[#242424] block truncate">
              {profileData.companyName}
            </span>
          </div>

          <div className="bg-[#F3F2F1] p-2 rounded border border-[#EDEBE9]">
            <span className="text-[9px] font-bold text-[#616161] uppercase block mb-0.5">Corporate Email</span>
            <span className="text-xs font-semibold text-[#242424] block truncate" title={profileData.submissionEmail}>
              {profileData.submissionEmail}
            </span>
          </div>

          <div className="col-span-2 bg-[#F3F2F1] p-2 rounded border border-[#EDEBE9] flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-[#616161] uppercase block mb-0.5">Operation Region</span>
              <span className="text-xs font-semibold text-[#242424] block">
                {profileData.location}
              </span>
            </div>
            <svg className="w-4 h-4 text-[#8A8886]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileCard;