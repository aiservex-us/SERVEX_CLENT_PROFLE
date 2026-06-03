'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function FileSlotsManager({ onSelectSlot }) {
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [error, setError] = useState(null);
  const [processingSlot, setProcessingSlot] = useState(null);
  
  // Estados para el control del Popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotData, setSelectedSlotData] = useState(null);
  const [selectedSlotLabel, setSelectedSlotLabel] = useState('');

  const ALL_SLOTS = [
    { key: 'data_slot_1', label: 'Slot 01' },
    { key: 'data_slot_2', label: 'Slot 02' },
    { key: 'data_slot_3', label: 'Slot 03' },
    { key: 'data_slot_4', label: 'Slot 04' },
    { key: 'data_slot_5', label: 'Slot 05' },
    { key: 'data_slot_6', label: 'Slot 06' },
    { key: 'data_slot_8', label: 'Slot 08' },
  ];

  const fetchUserSlots = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setError('No se encontró una sesión activa o credenciales empresariales.');
        return;
      }

      const { data, error: dbError } = await supabase
        .from('client_submissions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (dbError && dbError.code !== 'PGRST116') throw dbError;

      if (data) {
        setSubmissionData(data);
        
        const mapped = ALL_SLOTS.map(slot => ({
          ...slot,
          data: data[slot.key]
        }));
        
        setAvailableFiles(mapped);
      }
    } catch (err) {
      console.error('Error en infraestructura SVX Ingestion Engine:', err);
      setError('Error de sincronización con la infraestructura de ingesta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSlots();
  }, []);

  // Manejador para abrir el popup con la data del slot
  const handleOpenModal = (slotLabel, slotData) => {
    setSelectedSlotLabel(slotLabel);
    setSelectedSlotData(slotData);
    setIsModalOpen(true);
  };

  const handleDeleteSlot = async (slotKey, label) => {
    if (!window.confirm(`¿Confirmar purga y vaciado completo del slot asignado a "${label}"?`)) return;

    try {
      setProcessingSlot(slotKey);

      const [resSubmissions, resOriginal] = await Promise.all([
        supabase
          .from('client_submissions')
          .update({ [slotKey]: null })
          .eq('user_id', submissionData.user_id),
        supabase
          .from('client_original')
          .update({ [slotKey]: null })
          .eq('user_id', submissionData.user_id)
      ]);

      if (resSubmissions.error) throw resSubmissions.error;
      if (resOriginal.error) throw resOriginal.error;

      await fetchUserSlots();
    } catch (err) {
      console.error('Error al depurar slot:', err);
      alert('No se pudo vaciar la memoria del slot seleccionado en el pipeline.');
    } finally {
      setProcessingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-16 bg-[#FFF] rounded-sm border border-[#EDEBE9] font-sans mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-5 h-5 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#616161] font-semibold tracking-wide px-4">Mapeando infraestructura SVX Ingestion Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[#464775] border border-[#8889c5] text-white rounded-sm text-xs font-sans font-medium mx-auto w-full max-w-7xl break-words">
        <span className="font-bold">SVX Protocol Error:</span> {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#FFF] rounded-sm border border-[#E0E0E0] p-4 sm:p-5 font-sans antialiased text-[#242424]">
      
      {/* Cabecera Fluent */}
      <div className="mb-5 pb-3 border-b border-[#E0E0E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="max-w-full min-w-0">
          <h2 className="text-xs font-bold text-[#242424] tracking-tight uppercase truncate" title={submissionData?.company_name}>
            {submissionData?.company_name || 'Buffers de Ingesta Asignados'}
          </h2>
          <p className="text-[10px] text-[#616161] mt-0.5 break-words sm:line-clamp-none line-clamp-2">
            Orquestación en Tiempo Real y Carga Homologada de Arreglos Técnicos
          </p>
        </div>
        <div className="self-start sm:self-center text-[10px] font-mono text-[#464775] bg-[#ECECFF] px-2 py-0.5 rounded-sm border border-[#D5D6E9] whitespace-nowrap">
          SVX_COMMAND_STORAGE
        </div>
      </div>

      {/* Grid de Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
        {availableFiles.map((slot) => {
          const hasData = slot.data !== null;
          const rawContent = slot.data;
          
          const fileName = 'Dataset_Ingested.json';
          const rowCount = Array.isArray(rawContent) ? rawContent.length : 0;
          const uploadDate = hasData ? 'Active Dataset' : 'Buffer Vacío';
          const isCurrentProcessing = processingSlot === slot.key;

          return (
            <div 
              key={slot.key}
              className={`group flex flex-col justify-between p-3.5 bg-white border rounded-sm transition-all duration-150 relative min-w-0 ${
                hasData 
                  ? 'border-[#E0E0E0] hover:border-[#464775] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(70,71,117,0.12)]' 
                  : 'border-dashed border-[#C8C6C4] bg-[#FAFAFA] hover:bg-white hover:border-[#464775]'
              }`}
            >
              {isCurrentProcessing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center rounded-sm">
                  <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div className="min-w-0">
                <div className="flex justify-between items-center mb-2 gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded-sm uppercase font-mono whitespace-nowrap ${
                    hasData 
                      ? 'text-[#464775] bg-[#ECECFF] border border-[#D5D6E9]' 
                      : 'text-[#616161] bg-[#F3F2F1] border border-[#EDEBE9]'
                  }`}>
                    {slot.label}
                  </span>
                  <span className="text-[9px] font-medium text-[#878685] font-mono whitespace-nowrap">{uploadDate}</span>
                </div>

                {hasData ? (
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#242424] truncate group-hover:text-[#464775] transition-colors font-mono" title={fileName}>
                      {fileName}
                    </h4>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#616161]">
                      <span className="text-[#464775] shrink-0">⚡</span>
                      <span className="font-medium text-[10px] truncate">
                        Registros: <strong className="font-semibold text-[#242424] font-mono">{rowCount}</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 min-w-0">
                    <p className="text-[11px] italic text-[#A19F9D] font-medium truncate">Asignación libre de memoria</p>
                    <p className="text-[9px] text-[#A19F9D] mt-0.5 truncate">Listo para parsear e indexar CSV</p>
                  </div>
                )}
              </div>

              {/* Botonera de Control Inferior */}
              <div className="mt-4 pt-2.5 border-t border-[#F3F2F1] flex flex-row gap-1.5 justify-end items-center w-full">
                {hasData ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.key, slot.label)}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#FDE7E9] text-[#A80007] border border-[#F3B0B4] text-[10px] font-medium rounded-sm transition-all cursor-pointer whitespace-nowrap"
                      title="Vaciar memoria de la columna"
                    >
                      Eliminar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenModal(slot.label, rawContent)}
                      className="flex-1 px-3 py-1.5 bg-white hover:bg-[#464775] text-[#464775] hover:text-white border border-[#464775] text-[11px] font-semibold rounded-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] text-center truncate"
                    >
                      Examinar e Inyectar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full px-3 py-1.5 bg-[#F3F2F1] text-[#A19F9D] border border-[#EDEBE9] text-[11px] font-semibold rounded-sm cursor-not-allowed flex items-center justify-center gap-1 text-center"
                  >
                    <span className="truncate">Buffer Disponible</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP MODAL (Portal alternativo) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-sm border border-[#D2D0CE] shadow-[0_8px_32px_rgba(0,0,0,0.14)] w-full max-w-2xl flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="px-4 py-3 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAFAFA]">
              <div>
                <h3 className="text-xs font-bold text-[#242424] uppercase tracking-wide font-mono">
                  Explorador de Datos - {selectedSlotLabel}
                </h3>
                <p className="text-[10px] text-[#616161] mt-0.5">Previsualización del cluster JSON seleccionado</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#616161] hover:text-[#242424] hover:bg-[#F3F2F1] w-6 h-6 flex items-center justify-center rounded-sm text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-4 overflow-y-auto bg-[#FF] flex-1 font-mono text-[11px] text-[#242424]">
              <div className="bg-[#FAF9F8] border border-[#EDEBE9] p-3 rounded-sm max-h-[50vh] overflow-auto shadow-inner">
                <pre>{JSON.stringify(selectedSlotData, null, 2)}</pre>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-4 py-3 border-t border-[#EDEBE9] bg-[#FAFAFA] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#242424] border border-[#8A8886] text-[11px] font-medium rounded-sm transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  if(onSelectSlot) onSelectSlot(selectedSlotData);
                  setIsModalOpen(false);
                }}
                className="px-4 py-1.5 bg-[#464775] hover:bg-[#353659] text-white text-[11px] font-semibold rounded-sm transition-all cursor-pointer shadow-xs"
              >
                Confirmar Acción
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}