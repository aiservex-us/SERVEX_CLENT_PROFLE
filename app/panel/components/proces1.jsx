import React, { useState } from 'react';
import { supabaseGoogle } from '@/app/lib/supabaseClient';
import * as XLSX from 'xlsx';

// Subcomponente interactivo para cada Slot de archivo (Estilo Fluent / Teams)
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
          ? 'border-[#107C41] bg-[#F3F9F5]' // Estado: Cargado con éxito (Verde Excel)
          : isDragActive 
            ? 'border-[#464775] bg-[#EEF0F8] scale-[1.01]' // Estado: Arrastrando archivo
            : 'border-dashed border-[#D1D1D1] bg-[#FAF9F8] hover:bg-[#F3F2F1]' // Estado: Vacío
      }`}
    >
      <span className={`text-[9px] uppercase font-bold block mb-0.5 ${fileName ? 'text-[#107C41]' : 'text-[#616161]'}`}>
        Espacio de datos {index + 1}
      </span>

      {fileName ? (
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center space-x-2 truncate">
            {/* Icono de archivo exitoso */}
            <svg className="w-3.5 h-3.5 text-[#107C41] shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm10.707 5.707a1 1 0 00-1.414-1.414L9 13.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l6-6z" clipRule="evenodd"/>
            </svg>
            <span className="text-[11px] text-[#242424] font-medium truncate" title={fileName}>
              {fileName}
            </span>
          </div>
          {/* Botón interactivo para remover el archivo */}
          <button
            type="button"
            onClick={() => onFileRemove(index)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616161] hover:text-[#A80000] p-1 rounded hover:bg-[#FDE7E9] transition-colors"
            title="Quitar archivo"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ) : (
        <>
          <label className="text-[11px] text-[#616161] cursor-pointer flex items-center justify-between">
            <span className="truncate">Arrastra un archivo o <span className="text-[#464775] font-semibold underline">examina</span></span>
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '', business_activity: '', contact_phone: '',
    website_url: '', contact_email: '', country: '', city: ''
  });
  
  const [jsonSlots, setJsonSlots] = useState([null]);
  const [fileNames, setFileNames] = useState(['']);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    if (!jsonSlots.some(s => s !== null)) return alert("Carga al menos un archivo.");
    setLoading(true);
    try {
      const { data: { user } } = await supabaseGoogle.auth.getUser();
      const { error } = await supabaseGoogle.from('client_submissions').insert([{
        ...formData, user_id: user?.id,
        data_slot_1: jsonSlots[0] || null, 
        data_slot_2: jsonSlots[1] || null,
        data_slot_3: jsonSlots[2] || null, 
        data_slot_4: jsonSlots[3] || null,
        data_slot_5: jsonSlots[4] || null, 
        data_slot_6: jsonSlots[5] || null,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      alert("Datos guardados en el ecosistema.");
    } catch (err) { alert("Error de conexión."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center bg-[#FFF] font-sans antialiased p-2 sm:p-4 min-h-[80vh] md:h-[90vh]">
      <div className="bg-white w-full max-w-5xl h-full md:h-full rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.14)] flex flex-col border border-[#E1E1E1] overflow-y-auto md:overflow-hidden">
        
        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-5 grid grid-cols-12 gap-5 overflow-y-auto md:overflow-hidden">
          
          {/* Columna Datos Generales */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EDEBE9] pb-5 md:pb-0 md:pr-5 md:py-1">
            <div>
              {/* Encabezado de Sección con Icono */}
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-4 h-4 text-[#464775]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-[#242424] text-base font-bold tracking-tight">Información del Cliente</h2>
              </div>

              <div className="space-y-3.5">
                {/* Bloque Principal: Identidad */}
                <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Nombre de la compañía</label>
                  <div className="flex items-center justify-between mt-0.5">
                    <input 
                      required 
                      name="company_name" 
                      onChange={handleChange} 
                      className="bg-transparent w-full text-xs text-[#242424] font-medium placeholder-[#A19F9D] focus:outline-none" 
                      placeholder="Ej: Glynne S.A.S" 
                    />
                    <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                {/* Agrupación funcional: Actividad y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Actividad Comercial */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Actividad comercial</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="business_activity" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="Ej: Desarrollo de Software"
                      />
                      <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Teléfono de contacto</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="contact_phone" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="+57 300 000 0000"
                      />
                      <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Correo Electrónico Corporativo */}
                <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                  <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Correo electrónico corporativo</label>
                  <div className="flex items-center justify-between mt-0.5">
                    <input 
                      required 
                      name="contact_email" 
                      type="email" 
                      onChange={handleChange} 
                      className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                      placeholder="corporativo@empresa.com"
                    />
                    <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                </div>

                {/* Ubicación Geográfica */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* País */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">País</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="country" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="Ej: Colombia"
                      />
                      <svg className="w-3.5 h-3.5 text-[#8A8886] group-focus-within:text-[#464775] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2 2 0 002-2V7.5a2.5 2.5 0 00-2.5-2.5h-1.5a2 2 0 01-2-2V3.07M12 21a9 9 0 100-18 9 9 0 000 18z" />
                      </svg>
                    </div>
                  </div>

                  {/* Ciudad */}
                  <div className="flex flex-col relative group bg-[#F3F2F1] hover:bg-[#EDEBE9] p-2 rounded-md border border-[#E1E1E1] focus-within:ring-2 focus-within:ring-[#464775] focus-within:border-transparent focus-within:bg-[#FFFFFF] transition-all duration-200 shadow-sm">
                    <label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider transition-colors group-focus-within:text-[#464775]">Ciudad</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <input 
                        required 
                        name="city" 
                        onChange={handleChange} 
                        className="bg-transparent w-full text-xs text-[#242424] focus:outline-none" 
                        placeholder="Ej: Bogotá"
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

            {/* Micro-copy informativo al pie */}
            <div className="text-[10px] text-[#8A8886] flex items-center space-x-1.5 mt-3">
              <svg className="w-3 h-3 text-[#464775] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Esta configuración define las variables del core del pipeline de datos.</span>
            </div>
          </div>

          {/* Columna Archivos Optimizada (Dinámica con Botón +) */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-between pt-1 md:pt-1 md:pl-2">
            <div>
              <h3 className="text-[#242424] text-xs font-semibold mb-2.5">Adjuntos de Datos (Excel/CSV)</h3>
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

              {/* Botón interactivo "+" para agregar otro slot debajo */}
              {jsonSlots.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full py-1.5 border border-dashed border-[#464775] text-[#464775] rounded text-[11px] font-semibold hover:bg-[#EEF0F8] transition-colors flex items-center justify-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Añadir otro archivo</span>
                </button>
              )}
            </div>

            <div className="flex space-x-2.5 pt-4 md:pt-3 border-t border-[#EDEBE9] mt-5 md:mt-0">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-[#464775] text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-[#3b3c61] transition-colors active:scale-[0.98]"
              >
                {loading ? 'Guardando...' : 'Cargar información'}
              </button>
              <button type="button" className="px-3 py-1.5 border border-[#D1D1D1] rounded text-xs text-[#242424] font-semibold hover:bg-[#F3F2F1]">Cancelar</button>
            </div>
          </div>
        </form>
      </div>

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
      `}</style>
    </div>
  );
};

export default TeamsForm;