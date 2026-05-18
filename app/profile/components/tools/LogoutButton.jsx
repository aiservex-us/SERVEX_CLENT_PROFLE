'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function FileSlotsManager({ onSelectSlot }) {
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserSlots() {
      try {
        setLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) {
          setError('No se encontró una sesión activa o credenciales empresariales.');
          setLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase
          .from('client_submissions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (dbError && dbError.code !== 'PGRST116') { 
          throw dbError;
        }

        if (data) {
          setSubmissionData(data);
          
          const slots = [
            { key: 'data_slot_1', label: 'Slot 01', data: data.data_slot_1 },
            { key: 'data_slot_2', label: 'Slot 02', data: data.data_slot_2 },
            { key: 'data_slot_3', label: 'Slot 03', data: data.data_slot_3 },
            { key: 'data_slot_4', label: 'Slot 04', data: data.data_slot_4 },
            { key: 'data_slot_5', label: 'Slot 05', data: data.data_slot_5 },
            { key: 'data_slot_6', label: 'Slot 06', data: data.data_slot_6 },
            { key: 'data_slot_8', label: 'Slot 08', data: data.data_slot_8 },
          ];

          const activeFiles = slots.filter(slot => slot.data !== null);
          setAvailableFiles(activeFiles);
        }
      } catch (err) {
        console.error('Error cargando slots de datos en SVX:', err);
        setError('Error al sincronizar con la infraestructura de ingesta.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserSlots();
  }, []);

  const handleInspectSlot = (slotKey, slotContent) => {
    if (onSelectSlot) {
      onSelectSlot(slotContent);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 bg-[#FFF] rounded-sm border border-[#EDEBE9] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#616161] font-semibold tracking-wide">Mapeando infraestructura SVX Ingestion Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3.5 bg-[#FDE7E9] border border-[#F3B0B4] text-[#A80007] rounded-sm text-xs font-sans font-medium">
        <span className="font-bold">SVX Protocol Error:</span> {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F5F5] rounded-sm border border-[#E0E0E0] p-5 font-sans antialiased text-[#242424]">
      
      {/* Header Estilo Fluent Teams */}
      <div className="mb-5 pb-3 border-b border-[#E0E0E0] flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#242424] tracking-tight uppercase">
            {submissionData?.company_name || 'Datasets Corporativos'}
          </h2>
          <p className="text-[10px] text-[#616161] mt-0.5">
            Ecosistema de Orquestación y Transmisión de Catálogos Técnicos
          </p>
        </div>
        <div className="text-[10px] font-mono text-[#464775] bg-[#ECECFF] px-2 py-0.5 rounded-sm border border-[#D5D6E9]">
          SVX_COMMAND_MODE
        </div>
      </div>

      {availableFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-sm border border-[#E0E0E0] text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-xl mb-2">📊</span>
          <h3 className="text-xs font-bold text-[#242424]">Ningún slot cargado en memoria</h3>
          <p className="text-[10px] text-[#616161] max-w-xs mt-1">
            Los buffers JSONB del cliente están limpios. Inyecte un flujo estructurado desde los flujos de automatización.
          </p>
        </div>
      ) : (
        /* Grid de Slots */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableFiles.map((slot) => {
            const rawContent = slot.data;
            const fileName = rawContent?.fileName || 'Technical_Dataset_Ingested.csv';
            
            const rowCount = Array.isArray(rawContent) 
              ? rawContent.length 
              : (rawContent?.rows?.length || rawContent?.rowCount || 'N/A');
              
            const uploadDate = rawContent?.uploadedAt 
              ? new Date(rawContent.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
              : 'Indexación Reciente';

            return (
              <div 
                key={slot.key}
                className="group flex flex-col justify-between p-3.5 bg-white border border-[#E0E0E0] hover:border-[#464775] rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(70,71,117,0.12)] transition-all duration-150 relative"
              >
                <div>
                  {/* Metadata de Control */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#464775] bg-[#ECECFF] border border-[#D5D6E9] rounded-sm uppercase font-mono">
                      {slot.label}
                    </span>
                    <span className="text-[9px] font-medium text-[#878685] font-mono">{uploadDate}</span>
                  </div>

                  {/* Nombre del Archivo Indexado */}
                  <h4 
                    className="text-xs font-bold text-[#242424] truncate group-hover:text-[#464775] transition-colors font-mono"
                    title={fileName}
                  >
                    {fileName}
                  </h4>
                  
                  {/* Indicador de filas */}
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#616161]">
                    <span className="text-[#464775]">⚡</span>
                    <span className="font-medium text-[10px]">
                      Registros Procesados: <strong className="font-semibold text-[#242424] font-mono">{rowCount}</strong>
                    </span>
                  </div>
                </div>

                {/* Acción de Selección */}
                <div className="mt-4 pt-2.5 border-t border-[#F3F2F1] flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleInspectSlot(slot.key, slot.data)}
                    className="w-full sm:w-auto px-3 py-1 bg-white hover:bg-[#464775] text-[#464775] hover:text-white border border-[#464775] text-[11px] font-semibold rounded-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    Examinar E Inyectar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}