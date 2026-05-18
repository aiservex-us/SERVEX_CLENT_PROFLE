import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseGoogle } from '@/app/lib/supabaseClient';
import * as XLSX from 'xlsx';

// Interactive subcomponent for each File Slot (Fluent / Teams Style)
const FileSlot = ({ index, fileName, onFileSelect, onFileRemove }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0], index);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`p-3 border-2 rounded transition-all relative flex flex-col justify-center min-h-[64px] ${
        fileName 
          ? 'border-[#107C41] bg-[#F3F9F5]' // State: Successfully loaded (Excel Green)
          : isDragActive 
            ? 'border-[#464775] bg-[#EEF0F8] scale-[1.01]' // State: Dragging file
            : 'border-dashed border-[#D1D1D1] bg-[#FAF9F8] hover:bg-[#F3F2F1]' // State: Empty
      }`}
    >
      <span className={`text-[9px] uppercase font-bold block mb-0.5 ${fileName ? 'text-[#107C41]' : 'text-[#616161]'}`}>
        Data Slot {index + 1}
      </span>

      {fileName ? (
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center space-x-2 truncate">
            {/* Success file icon */}
            <svg className="w-3.5 h-3.5 text-[#107C41] shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm10.707 5.707a1 1 0 00-1.414-1.414L9 13.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l6-6z" clipRule="evenodd"/>
            </svg>
            <span className="text-[11px] text-[#242424] font-medium truncate" title={fileName}>
              {fileName}
            </span>
          </div>
          {/* Interactive button to remove file */}
          <button
            type="button"
            onClick={() => onFileRemove(index)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616161] hover:text-[#A80000] p-1 rounded hover:bg-[#FDE7E9] transition-colors"
            title="Remove file"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ) : (
        <>
          <label className="text-[11px] text-[#616161] cursor-pointer flex items-center justify-between">
            <span className="truncate">Drag a file here or <span className="text-[#464775] font-semibold underline">browse</span></span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0], index)}
              className="hidden"
            />
          </label>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#464775]">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

const TeamsForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(null); // State to evaluate database record existence
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    company_name: '', business_activity: '', contact_phone: '',
    website_url: '', contact_email: '', country: '', city: ''
  });
  
  const [jsonSlots, setJsonSlots] = useState([null]);
  const [fileNames, setFileNames] = useState(['']);

  // Logout Modal States
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSignOutSubmitting, setIsSignOutSubmitting] = useState(false);

  // Effect to verify if user record already exists in database
  useEffect(() => {
    const checkExistingData = async () => {
      try {
        const { data: { user }, error: authError } = await supabaseGoogle.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data, error } = await supabaseGoogle
            .from('client_submissions')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          
          if (data) {
            setHasData(true);
            // Redirección directa e inmediata al perfil si ya hay datos en la DB
            router.push('/profile');
          } else {
            setHasData(false);
          }
        } else {
          setHasData(false);
        }
      } catch (err) {
        console.error("Error checking baseline records:", err);
        setHasData(false);
      }
    };

    checkExistingData();
  }, [router]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showTeamsToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    if (type === 'success') {
      // Breve espera de 1.5s para que alcancen a ver la confirmación y directo a /profile
      setTimeout(() => {
        setHasData(true);
        setToast({ show: false, message: '', type: 'success' });
        router.push('/profile');
      }, 1500);
    } else {
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
    }
  };

  const processFile = (file, index) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      const newSlots = [...jsonSlots];
      newSlots[index] = json;
      setJsonSlots(newSlots);

      const newNames = [...fileNames];
      newNames[index] = file.name;
      setFileNames(newNames);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileRemove = (index) => {
    if (jsonSlots.length === 1) {
      setJsonSlots([null]);
      setFileNames(['']);
      return;
    }
    
    const newSlots = jsonSlots.filter((_, i) => i !== index);
    const newNames = fileNames.filter((_, i) => i !== index);
    setJsonSlots(newSlots);
    setFileNames(newNames);
  };

  const handleAddSlot = () => {
    setJsonSlots([...jsonSlots, null]);
    setFileNames([...fileNames, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jsonSlots.some(s => s !== null)) {
      showTeamsToast("Please upload at least one inventory file.", "error");
      return;
    }
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabaseGoogle.auth.getUser();
      if (authError) throw authError;
      
      if (!user) {
        showTeamsToast("Authentication context loss. Please log in again.", "error");
        setLoading(false);
        return;
      }

      // Creamos la estructura unificada del payload para mantener la misma información
      const payload = {
        ...formData,
        user_id: user.id,
        data_slot_1: jsonSlots[0] || null, 
        data_slot_2: jsonSlots[1] || null,
        data_slot_3: jsonSlots[2] || null, 
        data_slot_4: jsonSlots[3] || null,
        data_slot_5: jsonSlots[4] || null, 
        data_slot_6: jsonSlots[5] || null,
        data_slot_8: jsonSlots[7] || null, // Se añade explícitamente data_slot_8 mapeado
        created_at: new Date().toISOString()
      };

      // Ejecución paralela y simultánea en ambas bases de datos independientes
      const [resSubmissions, resOriginal] = await Promise.all([
        supabaseGoogle.from('client_submissions').insert([payload]),
        supabaseGoogle.from('client_original').insert([payload])
      ]);

      if (resSubmissions.error) throw resSubmissions.error;
      if (resOriginal.error) throw resOriginal.error;
      
      showTeamsToast("Information successfully uploaded to the system. Redirecting...");
    } catch (err) { 
      // Desglose extendido para capturar el error exacto de base de datos en la consola
      console.error("====== PIPELINE INSERT ERROR ======");
      if (err.code) console.error("PostgreSQL Error Code:", err.code);
      if (err.message) console.error("Error Message:", err.message);
      if (err.details) console.error("Error Details:", err.details);
      if (err.hint) console.error("Database Hint:", err.hint);
      console.error("Full error object:", err);
      console.error("===================================");

      showTeamsToast(`Connection error: ${err.message || "Verification pipeline could not be established."}`, "error"); 
    }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try {
      setIsSignOutSubmitting(true);
      const { error } = await supabaseGoogle.auth.signOut();
      if (error) throw error;
      
      setIsLogoutOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    } finally {
      setIsSignOutSubmitting(false);
    }
  };

  // Prevent flash effect while checking authentication and database records
  if (hasData === null) {
    return <div className="min-h-[80vh] md:h-[90vh] bg-[#FFF]" />;
  }

  // Si se detecta que ya hay datos en la base de datos, no renderiza el formulario ni el contenedor principal
  if (hasData === true) {
    return null;
  }

  return (
    <div className="flex items-center justify-center bg-transparent font-sans antialiased p-2 sm:p-4 min-h-[80vh] md:h-[90vh]">
      
      {/* Fluent / Microsoft Teams Style Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full bg-white rounded-md border-b-2 border-[#107C41] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-3.5 flex items-start space-x-3 transition-all duration-300 transform translate-y-0 animate-fade-in border border-[#EDEBE9]">
          {toast.type === 'success' ? (
            <div className="p-1 rounded bg-[#F3F9F5] shrink-0">
              <svg className="w-4 h-4 text-[#107C41]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="p-1 rounded bg-[#FDE7E9] shrink-0">
              <svg className="w-4 h-4 text-[#A80000]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-[12px] font-bold text-[#242424] mb-0.5">
              {toast.type === 'success' ? 'Svx Command Execution' : 'System Alert'}
            </h4>
            <p className="text-[11px] text-[#616161] leading-normal font-normal">
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast({ ...toast, show: false })} 
            className="text-[#616161] hover:text-[#242424] p-0.5 rounded transition-colors shrink-0"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white w-full max-w-5xl h-[90vh] md:h-full rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.14)] flex flex-col border border-[#E1E1E1] overflow-y-auto md:overflow-hidden">
        
        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-5 grid grid-cols-12 gap-5 overflow-y-auto md:overflow-hidden">
          
          {/* General Data Column */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EDEBE9] pb-5 md:pb-0 md:pr-5 md:py-1">
            <div>
              {/* Svx Command Welcome Section */}
              <div className="mb-5 pb-4 border-b border-[#EDEBE9]">
                <div className="flex items-center mb-2.5">
                  <img 
                    src="/logo.png" 
                    alt="Svx Command Logo" 
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <h1 className="text-sm font-bold text-[#242424] mb-1">
                  Welcome to Svx Command
                </h1>
                <div className="space-y-2 text-[11px] text-[#616161] leading-normal font-normal">
                  <p>
                    To activate your operating environment, we need to link your corporate identity (contact details and location) along with your source inventory files (Excel or CSV).
                  </p>
                  <p>
                    <strong className="text-[#464775]">Why do we request this information?</strong> This data is essential to configure your core account parameters and feed our data pipeline. Without it, the system cannot establish personalized business rules or map the necessary columns to process your inventories.
                  </p>
                </div>
              </div>

              {/* Section Header with Icon */}
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-4 h-4 text-[#464775]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-[#242424] text-base font-bold tracking-tight">Client Information</h2>
              </div>

              <div className="space-y-3.5">
                {/* Main Block: Identity */}
                <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Company Name</label>
                  <div className="flex items-center justify-between mt-0.5">
                    <input 
                      required 
                      name="company_name" 
                      onChange={handleChange} 
                      className="bg-transparent w-full text-xs text-[#242424] font-medium placeholder-[#A19F9D] focus:outline-none" 
                      placeholder="e.g., Servex US Inc." 
                    />
                    <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                {/* Functional grouping: Activity and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Business Activity */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Business Activity</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="business_activity" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="e.g., Supply Chain & Logistics"
                      />
                      <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Contact Phone</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="contact_phone" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="+1 (212) 555-0199"
                      />
                      <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Corporate Email */}
                <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Corporate Email Address</label>
                  <div className="flex items-center justify-between mt-0.5">
                    <input 
                      required 
                      name="contact_email" 
                      type="email" 
                      onChange={handleChange} 
                      className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                      placeholder="operations@servexus.com"
                    />
                    <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                </div>

                {/* Geographic Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Country */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Country</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="country" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="e.g., United States"
                      />
                      <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2 2 0 002-2V7.5a2.5 2.5 0 00-2.5-2.5h-1.5a2 2 0 01-2-2V3.07M12 21a9 9 0 100-18 9 9 0 000 18z" />
                      </svg>
                    </div>
                  </div>

                  {/* City */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">City</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="city" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="e.g., New York"
                      />
                      <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer informational micro-copy */}
            <div className="text-[10px] text-[#8A8886] flex items-center space-x-1.5 mt-3">
              <svg className="w-3 h-3 text-[#464775] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>This configuration defines the baseline variables for the data pipeline core.</span>
            </div>
          </div>

          {/* Optimized Files Column (Dynamic with + Button) */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-between pt-1 md:pt-1 md:pl-2">
            <div>
              <h3 className="text-[#242424] text-xs font-semibold mb-2.5">Upload your catalog files here to manage within our ecosystem (Excel/CSV)</h3>
              <div className="space-y-2.5 max-h-[none] md:max-h-[45vh] overflow-y-visible md:overflow-y-auto pr-0 md:pr-2 custom-scrollbar mb-2.5">
                {jsonSlots.map((_, i) => (
                  <FileSlot
                    key={i}
                    index={i}
                    fileName={fileNames[i]}
                    onFileSelect={processFile}
                    onFileRemove={handleFileRemove}
                  />
                ))}
              </div>

              {/* Interactive "+" button to add another file slot underneath */}
              {jsonSlots.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full py-1.5 border border-dashed border-[#464775] text-[#464775] rounded text-[11px] font-semibold hover:bg-[#EEF0F8] transition-colors flex items-center justify-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add another file</span>
                </button>
              )}
            </div>

            <div className="flex space-x-2.5 pt-4 md:pt-3 border-t border-[#EDEBE9] mt-5 md:mt-0">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-[#464775] text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-[#3b3c61] transition-colors active:scale-[0.98]"
              >
                {loading ? 'Saving...' : 'Upload Information'}
              </button>
              
              {/* Updated Cancel Button triggers custom Fluent Sign Out Overlay */}
              <button 
                type="button" 
                onClick={() => setIsLogoutOpen(true)}
                className="px-3 py-1.5 border border-[#D1D1D1] rounded text-xs text-[#242424] font-semibold hover:bg-[#F3F2F1]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Integrated Fluent Overlay Custom Modal */}
      {isLogoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-xs transition-opacity duration-200">
          
          {/* Modal Container */}
          <div className="w-full max-w-[340px] bg-white rounded-[6px] border border-[#E0E0E0] shadow-xl overflow-hidden font-sans antialiased animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <div className="flex items-center space-x-1.5 text-[#464775]">
                {/* Warning / Alert Triangle SVG */}
                <svg className="w-3.5 h-3.5 text-[#E0A75E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[11px] font-bold uppercase tracking-wider">Confirm Action</span>
              </div>
              <button 
                onClick={() => !isSignOutSubmitting && setIsLogoutOpen(false)}
                className="text-[#616161] hover:text-[#242424] transition-colors focus:outline-none"
                disabled={isSignOutSubmitting}
              >
                {/* Close X SVG */}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <h4 className="text-[13px] font-bold text-[#242424] leading-tight">
                Sign Out Corporate Session?
              </h4>
              <p className="text-[11px] text-[#616161] font-normal mt-1.5 leading-normal">
                You will be redirected to the landing page. Private configurations for <span className="font-semibold text-[#464775]">SVX Copilot</span> won't be accessible until you log back in.
              </p>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end space-x-2 px-4 py-3 bg-[#FAFAFA] border-t border-[#E0E0E0]">
              <button
                type="button"
                onClick={() => setIsLogoutOpen(false)}
                disabled={isSignOutSubmitting}
                className="px-3 py-1.5 text-[11px] font-semibold text-[#616161] bg-white border border-[#D1D1D1] rounded-[4px] hover:bg-[#F3F2F1] hover:text-[#242424] transition-all duration-150 focus:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                disabled={isSignOutSubmitting}
                className="flex items-center justify-center min-w-[80px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-[#464775] rounded-[4px] hover:bg-[#3b3c63] border border-transparent shadow-xs transition-all duration-150 focus:outline-none disabled:opacity-50"
              >
                {isSignOutSubmitting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c8c8c8;
          border-radius: 10px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TeamsForm;