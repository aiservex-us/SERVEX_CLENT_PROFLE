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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Pasa el array completo de archivos para soportar múltiples slots secuenciales
      onFileSelect(e.dataTransfer.files, index);
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
          ? 'border-[#107C41] bg-[#F3F9F5]' 
          : isDragActive 
            ? 'border-[#464775] bg-[#EEF0F8] scale-[1.01]' 
            : 'border-dashed border-[#D1D1D1] bg-[#FAF9F8] hover:bg-[#F3F2F1]' 
      }`}
    >
      <span className={`text-[9px] uppercase font-bold block mb-0.5 ${fileName ? 'text-[#107C41]' : 'text-[#616161]'}`}>
        Data Slot {index === 6 ? 8 : index + 1}
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
              multiple
              onChange={(e) => e.target.files && e.target.files.length > 0 && onFileSelect(e.target.files, index)}
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
        const { data: { user } } = await supabaseGoogle.auth.getUser();
        if (user) {
          const { data, error } = await supabaseGoogle
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

  // Modificado para aceptar una lista de archivos y distribuirlos en slots secuenciales
  const processFiles = (fileList, startIndex) => {
    const filesArray = Array.from(fileList);
    
    filesArray.forEach((file, offset) => {
      const targetIndex = startIndex + offset;
      
      // Controlar el límite de máximo 7 slots (0 a 6) debido a las restricciones del payload
      if (targetIndex >= 7) return;

      // Asegurarse de que existan las posiciones correspondientes en el estado si se arrastran más archivos de los slots actuales
      setJsonSlots((prevSlots) => {
        const updated = [...prevSlots];
        while (updated.length <= targetIndex) {
          updated.push(null);
        }
        return updated;
      });
      setFileNames((prevNames) => {
        const updated = [...prevNames];
        while (updated.length <= targetIndex) {
          updated.push('');
        }
        return updated;
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        setJsonSlots((prevSlots) => {
          const updated = [...prevSlots];
          // Relacionamos el nombre original directamente junto con los datos procesados en la posición del slot
          updated[targetIndex] = {
            file_name: file.name,
            data: json
          };
          return updated;
        });

        setFileNames((prevNames) => {
          const updated = [...prevNames];
          updated[targetIndex] = file.name;
          return updated;
        });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileRemove = (index) => {
    if (jsonSlots.length === 1) {
      setJsonSlots([null]);
      setFileNames(['']);
      return;
    }
    
    setJsonSlots((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSlot = () => {
    setJsonSlots((prev) => [...prev, null]);
    setFileNames((prev) => [...prev, '']);
  };

  // NUEVO: Envío asíncrono y optimizado al pipeline de base de datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jsonSlots.some(s => s !== null)) {
      showTeamsToast("Please upload at least one inventory file.", "error");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabaseGoogle.auth.getUser();
      
      const payload = {
        ...formData,
        user_id: user?.id,
        data_slot_1: jsonSlots[0] || null, 
        data_slot_2: jsonSlots[1] || null,
        data_slot_3: jsonSlots[2] || null, 
        data_slot_4: jsonSlots[3] || null,
        data_slot_5: jsonSlots[4] || null, 
        data_slot_6: jsonSlots[5] || null,
        data_slot_7: jsonSlots[6] || null,
        data_slot_8: jsonSlots[7] || null, 
        created_at: new Date().toISOString()
      };

      // 1. Inserción directa en la tabla client_submissions
      const { error: subError } = await supabaseGoogle
        .from('client_submissions')
        .insert([payload]);

      if (subError) {
        console.error("Error en el pipeline de inserción (client_submissions):", subError);
        throw new Error(subError.message);
      }

      // 2. Inserción directa del mismo objeto exacto en la tabla client_original
      const { error: origError } = await supabaseGoogle
        .from('client_original')
        .insert([payload]);

      if (origError) {
        console.error("Error en el pipeline de inserción (client_original):", origError);
        throw new Error(origError.message);
      }
      
      showTeamsToast("Information successfully uploaded to the system. Redirecting...");
    } catch (err) { 
      console.error("Pipeline Insertion Error:", err);
      showTeamsToast(`Error: ${err.message || "Could not establish verification pipeline."}`, "error"); 
    } finally { 
      setLoading(false); 
    }
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
                    <strong className="text-[#464775]">Why do we request this information?</strong> This data is essential to configure your core account parameters and feed our data pipeline.
                  </p>
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
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Company Name</label>
                  <div className="flex items-center justify-between mt-0.5">
                    <input 
                      required 
                      name="company_name" 
                      onChange={handleChange} 
                      className="bg-transparent w-full text-xs text-[#242424] font-medium placeholder-[#A19F9D] focus:outline-none" 
                      placeholder="e.g., Servex US Inc." 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Business Activity</label>
                    <input required name="business_activity" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="e.g., Supply Chain"/>
                  </div>
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Contact Phone</label>
                    <input required name="contact_phone" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="+1 (212) 555-0199"/>
                  </div>
                </div>

                <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Corporate Email Address</label>
                  <input required name="contact_email" type="email" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="operations@servexus.com"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Country</label>
                    <input required name="country" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="United States"/>
                  </div>
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">City</label>
                    <input required name="city" onChange={handleChange} className="bg-transparent w-full text-xs text-[#242424] focus:outline-none mt-0.5" placeholder="New York"/>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#8A8886] flex items-center space-x-1.5 mt-3">
              <svg className="w-3 h-3 text-[#464775] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>This configuration defines the baseline variables for the data pipeline core.</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 flex flex-col justify-between pt-1 md:pt-1 md:pl-2">
            <div>
              <h3 className="text-[#242424] text-xs font-semibold mb-2.5">Upload your catalog files here to manage within our ecosystem (Excel/CSV)</h3>
              <div className="space-y-2.5 max-h-[none] md:max-h-[45vh] overflow-y-visible md:overflow-y-auto pr-0 md:pr-2 custom-scrollbar mb-2.5">
                {jsonSlots.map((_, i) => (
                  <FileSlot
                    key={i}
                    index={i}
                    fileName={fileNames[i]}
                    onFileSelect={processFiles}
                    onFileRemove={handleFileRemove}
                  />
                ))}
              </div>

              {jsonSlots.length < 7 && (
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

      {isLogoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-xs transition-opacity duration-200">
          <div className="w-full max-w-[340px] bg-white rounded-[6px] border border-[#E0E0E0] shadow-xl overflow-hidden font-sans antialiased animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <div className="flex items-center space-x-1.5 text-[#464775]">
                <span className="text-[11px] font-bold uppercase tracking-wider">Confirm Action</span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-[13px] font-bold text-[#242424] leading-tight">Sign Out Corporate Session?</h4>
            </div>
            <div className="flex items-center justify-end space-x-2 px-4 py-3 bg-[#FAFAFA] border-t border-[#E0E0E0]">
              <button type="button" onClick={() => setIsLogoutOpen(false)} className="px-3 py-1.5 text-[11px] font-semibold text-[#616161] bg-white border border-[#D1D1D1] rounded-[4px]">Cancel</button>
              <button type="button" onClick={handleLogout} className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#464775] rounded-[4px]">Disconnect</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c8c8c8; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default TeamsForm;