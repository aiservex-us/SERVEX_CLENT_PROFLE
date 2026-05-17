'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient'; 

export default function ClientSubmissionsMatrix() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  
  // Estado para el término de búsqueda (Filtro Global / SKU)
  const [searchTerm, setSearchTerm] = useState('');

  // ESTADOS DE EDICIÓN MÚTABLES
  const [isEditing, setIsEditing] = useState(false);
  const [localRows, setLocalRows] = useState([]); // Clona los registros combinados para edición inline
  const [isSaving, setIsSaving] = useState(false);

  // 1. Cargar la lista inicial de envíos
  useEffect(() => {
    async function getSubmissionsList() {
      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from('client_submissions')
          .select('id, company_name, created_at, city')
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;

        setSubmissions(data || []);
        if (data && data.length > 0) {
          setSelectedId(data[0].id.toString());
        }
      } catch (err) {
        console.error('❌ Error cargando registros de Supabase:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getSubmissionsList();
  }, []);

  // 2. Traer el registro completo al cambiar la selección
  useEffect(() => {
    if (!selectedId) return;

    async function fetchFullSubmission() {
      try {
        setFetchingSlots(true);
        setSearchTerm(''); 
        setIsEditing(false); // Apaga el modo edición al cambiar de cliente
        const { data, error: sbError } = await supabase
          .from('client_submissions')
          .select('*')
          .eq('id', selectedId)
          .single();

        if (sbError) throw sbError;
        setActiveSubmission(data);

        // Consolidar e inicializar las filas editables locales
        const targetSlots = [
          data.data_slot_1,
          data.data_slot_2,
          data.data_slot_3,
          data.data_slot_4,
          data.data_slot_5,
          data.data_slot_6,
          data.data_slot_8,
        ];
        const flatRows = targetSlots.filter((slot) => slot && Array.isArray(slot)).flat();
        setLocalRows(JSON.parse(JSON.stringify(flatRows))); // Clonación profunda limpia

      } catch (err) {
        console.error('❌ Error al recuperar slots estructurados:', err);
      } finally {
        setFetchingSlots(false);
      }
    }
    fetchFullSubmission();
  }, [selectedId]);

  // 3. Extraer dinámicamente las llaves estables del JSON original para las columnas
  const headers = useMemo(() => {
    if (!activeSubmission) return [];
    const targetSlots = [
      activeSubmission.data_slot_1,
      activeSubmission.data_slot_2,
      activeSubmission.data_slot_3,
      activeSubmission.data_slot_4,
      activeSubmission.data_slot_5,
      activeSubmission.data_slot_6,
      activeSubmission.data_slot_8,
    ];
    const firstSlotWithData = targetSlots.find(slot => slot && Array.isArray(slot) && slot.length > 0);
    return firstSlotWithData ? Object.keys(firstSlotWithData[0]) : [];
  }, [activeSubmission]);

  // 4. Manejador de cambios en las celdas editables
  const handleCellChange = (rowIndex, header, newValue) => {
    setLocalRows(prevRows => {
      const updated = [...prevRows];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [header]: newValue
      };
      return updated;
    });
  };

  // 5. Filtrado Inteligente aplicado sobre las filas locales mutables
  const filteredRowsWithIndex = useMemo(() => {
    // Mapeamos las filas locales con su índice de origen para no perder la referencia real al editar filtrado
    const indexedRows = localRows.map((row, index) => ({ row, originalIndex: index }));
    
    if (!searchTerm.trim()) return indexedRows;
    const lowerCaseSearch = searchTerm.toLowerCase().trim();

    return indexedRows.filter(({ row }) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(lowerCaseSearch);
      });
    });
  }, [localRows, searchTerm]);

  // 6. Guardar cambios en Supabase reestructurando de vuelta a data_slots
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      /* 
         Estrategia de segmentación: Para mantener la integridad de los datos, 
         re-inyectaremos el set de datos modificado al 'data_slot_1' y limpiaremos los excedentes,
         o puedes guardar todo el bloque unificado en 'data_slot_1' si tu lógica de negocio lo acepta.
      */
      const { error: updateError } = await supabase
        .from('client_submissions')
        .update({
          data_slot_1: localRows, // Guardamos la matriz modificada consolidada
          data_slot_2: null,       // Limpiamos los sub-slots redundantes para evitar duplicados
          data_slot_3: null,
          data_slot_4: null,
          data_slot_5: null,
          data_slot_6: null,
          data_slot_8: null,
        })
        .eq('id', selectedId);

      if (updateError) throw updateError;

      // Refrescar el estado base de la aplicación con la nueva estructura confirmada
      const { data: freshData } = await supabase
        .from('client_submissions')
        .select('*')
        .eq('id', selectedId)
        .single();
      
      setActiveSubmission(freshData);
      setIsEditing(false);
      alert('💾 Cambios persistidos con éxito en Supabase.');
    } catch (err) {
      console.error('❌ Error guardando la matriz:', err);
      alert(`No se pudieron guardar los cambios: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    if (activeSubmission) {
      const targetSlots = [
        activeSubmission.data_slot_1,
        activeSubmission.data_slot_2,
        activeSubmission.data_slot_3,
        activeSubmission.data_slot_4,
        activeSubmission.data_slot_5,
        activeSubmission.data_slot_6,
        activeSubmission.data_slot_8,
      ];
      const flatRows = targetSlots.filter((slot) => slot && Array.isArray(slot)).flat();
      setLocalRows(JSON.parse(JSON.stringify(flatRows)));
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90%] bg-[#F5F5F5] text-xs font-semibold text-[#616161] font-sans">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
          Conectando con Supabase y recuperando metadatos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-[90vw] mx-auto mt-10 bg-[#FDE7E9] border border-[#F3B0B4] text-[#A80007] rounded-sm text-xs font-sans">
        <span className="font-bold">Error de sincronización:</span> {error}
      </div>
    );
  }

  return (
    <div className="min-h-[80%] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto space-y-3">
        
        {/* Panel Superior de Control e Inputs */}
        <div className="bg-white p-4 rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold text-[#242424] tracking-tight">Estructura de Datos Analizada</h1>
            <p className="text-[11px] text-[#616161]">Visualización matricial de slots JSONB</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {/* Input de Búsqueda */}
            <div className="relative w-full sm:w-[240px]">
              <input
                type="text"
                placeholder="Filtrar por SKU, nombre, valor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isEditing}
                className="w-full bg-[#F5F5F5] border border-transparent border-b-[#616161] rounded-sm px-2.5 py-1 text-xs font-normal text-[#242424] placeholder-[#616161] hover:bg-[#EDEBE9] focus:bg-white focus:border-[#5B5FC7] focus:border-b-2 outline-none transition-all font-sans disabled:opacity-50"
              />
            </div>

            {/* Selector de Envío */}
            <select
              id="submission-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={isEditing}
              className="w-full sm:w-[200px] bg-white border border-[#D2D2D2] border-b-[#616161] rounded-sm px-2.5 py-1 text-xs font-normal text-[#242424] hover:border-[#616161] focus:border-b-2 focus:border-b-[#5B5FC7] outline-none transition-all cursor-pointer disabled:opacity-50"
            >
              {submissions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.company_name || `ID: ${sub.id}`}
                </option>
              ))}
            </select>

            {/* BOTONES DE ACCIÓN DE EDICIÓN FLUENT DESIGN */}
            <div className="flex gap-1 w-full sm:w-auto border-l border-slate-200 pl-1">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto bg-[#5B5FC7] hover:bg-[#484B97] text-white text-xs font-medium px-4 py-1 rounded-sm shadow-sm transition-all"
                >
                  Editar Celdas
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-[#107C41] hover:bg-[#0A5C30] text-white text-xs font-medium px-3 py-1 rounded-sm shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancelChanges}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-white border border-[#A19F9D] hover:bg-[#F3F2F1] text-[#242424] text-xs font-medium px-3 py-1 rounded-sm transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Matriz Principal */}
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-[#F0F0F0] flex justify-between items-center text-[11px]">
            <span className="font-semibold text-[#424242]">
              {fetchingSlots ? 'Actualizando...' : isEditing ? 'Modo de Edición Activo (Hojas Inline)' : 'Dataset Matrix'}
            </span>
            {isEditing && (
              <span className="text-[#107C41] font-semibold animate-pulse text-[10px]">
                ● Modificando JSON localmente
              </span>
            )}
          </div>

          {filteredRowsWithIndex.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              No se encontraron celdas para mostrar.
            </div>
          ) : (
            <div className="w-full overflow-x-auto overflow-y-auto max-h-[85vh] relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse text-left text-xs w-full">
                <thead className="bg-[#F5F5F5] sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-11 px-2 py-2 text-center text-[10px] font-semibold text-[#616161] bg-[#EDEBE9] sticky left-0 z-30 border-r border-b border-[#D2D2D2] select-none">
                      #
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-[#F5F5F5] border-r border-b border-[#E0E0E0] min-w-[150px] max-w-[250px] whitespace-nowrap truncate font-sans"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {filteredRowsWithIndex.map(({ row, originalIndex }, rowIndex) => (
                    <tr key={originalIndex} className="hover:bg-[#F3F2F1] transition-colors duration-75 group">
                      
                      <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#616161] bg-[#F5F5F5] border-r border-[#E0E0E0] sticky left-0 z-10 group-hover:bg-[#EDEBE9] select-none border-b border-[#F0F0F0]">
                        {originalIndex + 1}
                      </td>

                      {headers.map((header) => {
                        const cellValue = row[header];
                        return (
                          <td
                            key={header}
                            className={`p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[150px] max-w-[250px] transition-all`}
                          >
                            {isEditing ? (
                              // Campo de entrada nativo sin bordes toscos para simular Excel
                              <input
                                type="text"
                                value={cellValue !== null && cellValue !== undefined ? cellValue : ''}
                                onChange={(e) => handleCellChange(originalIndex, header, e.target.value)}
                                className="w-full h-full px-3 py-1.5 bg-transparent font-mono text-[11px] outline-none focus:bg-white focus:ring-1 focus:ring-[#5B5FC7] text-slate-800"
                              />
                            ) : (
                              <div 
                                className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate"
                                title={cellValue?.toString() || ''}
                              >
                                {cellValue !== null && cellValue !== undefined ? (
                                  cellValue.toString()
                                ) : (
                                  <span className="text-[#A19F9D] italic text-[10px]">null</span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-[#F5F5F5] px-4 py-2 border-t border-[#E0E0E0] flex justify-end gap-4 text-[10px] font-semibold text-[#616161] select-none">
            <span>COLS: {headers.length}</span>
            <span>ROWS: {localRows.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}