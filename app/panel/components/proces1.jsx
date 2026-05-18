import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 1. Importamos ambos clientes con alias descriptivos para conectar a los dos proyectos
import { supabaseGoogle as supabaseProject1 } from '@/app/lib/supabaseClient';
import { supabaseGoogle as supabaseProject2 } from '@/app/lib/supabaseClient2'; 
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
            <svg className="w-3.5 h-3.5 text-[#107C41] shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm10.707 5.707a1 1 0 00-1.414-1.414L9 13.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l6-6z" clipRule="evenodd"/>
            </svg>
            <span className="text-[11px] text-[#242424] font-medium truncate" title={fileName}>
              {fileName}
            </span>
          </div>
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
  const [hasData, setHasData] = useState(null); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    company_name: '', business_activity: '', contact_phone: '',
    website_url: '', contact_email: '', country: '', city: ''
  });
  
  const [jsonSlots, setJsonSlots] = useState([null]);
  const [fileNames, setFileNames] = useState(['']);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSignOutSubmitting, setIsSignOutSubmitting] = useState(false);

  useEffect(() => {
    const checkExistingData = async () => {
      try {
        // Validamos la sesión usando el proyecto 1 primario
        const { data: { user } } = await supabaseProject1.auth.getUser();
        if (user) {
          const { data, error } = await supabaseProject1
            .from('client_submissions')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          
          if (data) {
            setHasData(true);
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
      const { data: { user } } = await supabaseProject1.auth.getUser();
      
      // Payload base para el Primer Proyecto (Sin id_original_cliente)
      const basePayload = {
        ...formData,
        user_id: user?.id,
        data_slot_1: jsonSlots[0] || null, 
        data_slot_2: jsonSlots[1] || null,
        data_slot_3: jsonSlots[2] || null, 
        data_slot_4: jsonSlots[3] || null,
        data_slot_5: jsonSlots[4] || null, 
        data_slot_6: jsonSlots[5] || null,
        data_slot_7: jsonSlots[6] || null, // Aseguramos slot 7 mapeado por si acaso
        data_slot_8: jsonSlots[7] || null, 
        created_at: new Date().toISOString()
      };

      // 1. Insertamos de forma paralela en las dos tablas del PROYECTO 1 
      // (.select() es vital para extraer el ID generado por la base de datos)
      const [resSubmissionsP1, resOriginalP1] = await Promise.all([
        supabaseProject1.from('client_submissions').insert([basePayload]).select('id').single(),
        supabaseProject1.from('client_original').insert([basePayload]).select('id').single()
      ]);

      if (resSubmissionsP1.error) throw resSubmissionsP1.error;
      if (resOriginalP1.error) throw resOriginalP1.error;

      // Extraemos el id autogenerado del primer proyecto para usarlo de referencia externa
      const idOriginalSubmissions = resSubmissionsP1.data.id;
      const idOriginalCliente = resOriginalP1.data.id;

      // Payload adaptado para las tablas del PROYECTO 2 (Incluye la clave foránea e indicadores de sincronización)
      const payloadProject2Submissions = {
        ...basePayload,
        id_original_cliente: idOriginalSubmissions,
        sync_at: new Date().toISOString(),
        sync_source: 'CUSTOMER_PORTAL_PROFILE'
      };

      const payloadProject2Original = {
        ...basePayload,
        id_original_cliente: idOriginalCliente,
        sync_at: new Date().toISOString(),
        sync_source: 'CUSTOMER_PORTAL_PROFILE'
      };

      // 2. Insertamos de forma paralela en las dos tablas del PROYECTO 2
      const [resSubmissionsP2, resOriginalP2] = await Promise.all([
        supabaseProject2.from('client_submissions').insert([payloadProject2Submissions]),
        supabaseProject2.from('client_original').insert([payloadProject2Original])
      ]);

      if (resSubmissionsP2.error) throw resSubmissionsP2.error;
      if (resOriginalP2.error) throw resOriginalP2.error;
      
      showTeamsToast("Information successfully uploaded to all systems. Redirecting...");
    } catch (err) { 
      console.error("Pipeline insert error: ", err);
      showTeamsToast("Connection error. Verification pipeline could not be established.", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = async () => {
    try {
      setIsSignOutSubmitting(true);
      await supabaseProject1.auth.signOut();
      setIsLogoutOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    } finally {
      setIsSignOutSubmitting(false);
    }
  };

  if (hasData === null) {
    return <div className="min-h-[80vh] md:h-[90vh] bg-[#FFF]" />;
  }

  if (hasData === true) {
    return null;
  }

  return (
    <div className="flex items-center justify-center bg-transparent font-sans antialiased p-2 sm:p-4 min-h-[80vh] md:h-[90vh]">
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
          
          <div className="col-span-12 md:col-span-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EDEBE9] pb-5 md:pb-0 md:pr-5 md:py-1">
            <div>
              <div className="mb-5 pb-4 border-b border-[#EDEBE9]">
                <div className="flex items-center mb-2.5">
                  <img src="/logo.png" alt="Svx Command Logo" className="h-6 w-auto object-contain"/>
                </div>
                <h1 className="text-sm font-bold text-[#242424] mb-1">Welcome to Svx Command</h1>
                <div className="space-y-2 text-[11px] text-[#616161] leading-normal font-normal">
                  <p>To activate your operating environment, we need to link your corporate identity along with your source inventory files.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-4 h-4 text-[#464775]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-[#242424] text-base font-bold tracking-tight">Client Information</h2>
              </div>

              <div className="space-y-3.5">
                <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Company Name</label>
                  <input required name="company_name" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] font-medium placeholder-[#A19F9D] focus:outline-none mt-0.5" placeholder="e.g., Servex US Inc." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Business Activity</label>
                    <input required name="business_activity" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="e.g., Logistics" />
                  </div>
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Contact Phone</label>
                    <input required name="contact_phone" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="+1 (212) 555-0199" />
                  </div>
                </div>

                <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Corporate Email Address</label>
                  <input required name="contact_email" type="email" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="operations@servexus.com" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">Country</label>
                    <input required name="country" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="e.g., United States" />
                  </div>
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">City</label>
                    <input required name="city" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="e.g., New York" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action Block */}
            <div className="mt-5 pt-4 border-t border-[#EDEBE9] flex items-center justify-between">
              <button type="button" onClick={() => setIsLogoutOpen(true)} className="text-xs text-[#616161] hover:text-[#A80000] font-medium transition-colors px-2 py-1.5 rounded hover:bg-[#F3F2F1]">
                Sign Out
              </button>
              <button type="submit" disabled={loading} className={`text-xs text-white font-semibold px-5 py-2 rounded shadow-sm transition-all ${loading ? 'bg-[#7a7b9a] cursor-not-allowed' : 'bg-[#464775] hover:bg-[#3b3c66] active:scale-[0.98]'}`}>
                {loading ? 'Processing Pipeline...' : 'Initialize Environment'}
              </button>
            </div>
          </div>

          {/* Right Column: Files Inventory slots */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-between overflow-y-auto pr-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#107C41]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-[#242424] text-base font-bold tracking-tight">Data Inventories</h2>
                </div>
                <button type="button" onClick={handleAddSlot} className="text-[11px] text-[#464775] hover:text-[#3b3c66] font-bold flex items-center space-x-1 px-2 py-1 rounded hover:bg-[#F3F2F1] transition-colors">
                  <span>+ Add Slot</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[50vh] md:max-h-[72vh] overflow-y-auto pr-1">
                {jsonSlots.map((slot, index) => (
                  <FileSlot key={index} index={index} fileName={fileNames[index]} onFileSelect={processFile} onFileRemove={handleFileRemove} />
                ))}
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TeamsForm;