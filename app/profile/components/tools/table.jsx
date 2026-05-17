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

  // ESTADO PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
        setCurrentPage(1); // Reinicia a la primera página al cambiar de cliente
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

  // Reiniciar a la primera página si cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  // segmentación de datos por paginación (de a 11 productos)
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRowsWithIndex.slice(startIndex, endIndex);
  }, [filteredRowsWithIndex, currentPage]);

  const totalPages = Math.ceil(filteredRowsWithIndex.length / itemsPerPage) || 1;

  // 6. Guardar cambios en Supabase reestructurando de vuelta a data_slots
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      const { error: updateError } = await supabase
        .from('client_submissions')
        .update({
          data_slot_1: localRows, 
          data_slot_2: null,       
          data_slot_3: null,
          data_slot_4: null,
          data_slot_5: null,
          data_slot_6: null,
          data_slot_8: null,
        })
        .eq('id', selectedId);

      if (updateError) throw updateError;

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
      <div className="flex items-center justify-center min-h-[90%] bg-[#FFF] text-xs font-semibold text-[#616161] font-sans">
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
    <div className="min-h-[90vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        {/* Matriz Principal con el Header Integrado */}
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Header Compacto de la Tabla */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-[#F0F0F0] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#242424]">Estructura de Datos Analizada</span>
              <span className="text-[10px] text-[#616161]">
                {fetchingSlots ? 'Actualizando...' : isEditing ? 'Modificando JSON localmente' : 'Visualización matricial de slots JSONB'}
              </span>
            </div>

            {/* Controles alineados a la derecha del Header */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Input de Búsqueda */}
              <input
                type="text"
                placeholder="Filtrar por SKU, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isEditing}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] placeholder-[#616161] focus:border-[#5B5FC7] outline-none transition-all disabled:opacity-50 w-[160px]"
              />

              {/* Selector de Envío */}
              <select
                id="submission-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={isEditing}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] focus:border-[#5B5FC7] outline-none cursor-pointer disabled:opacity-50 max-w-[160px]"
              >
                {submissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.company_name || `ID: ${sub.id}`}
                  </option>
                ))}
              </select>

              {/* Botones de Acción */}
              <div className="flex gap-1 border-l border-slate-300 pl-1">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#5B5FC7] hover:bg-[#484B97] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all"
                  >
                    Editar Celdas
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="bg-[#107C41] hover:bg-[#0A5C30] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all disabled:opacity-50"
                    >
                      {isSaving ? '...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancelChanges}
                      disabled={isSaving}
                      className="bg-white border border-[#A19F9D] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Datos */}
          {paginatedRows.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              No se encontraron celdas para mostrar.
            </div>
          ) : (
           <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300">
              {/* Cambiado w-full por w-max para habilitar correctamente el scroll horizontal de las columnas */}
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
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
                  {paginatedRows.map(({ row, originalIndex }) => (
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

          {/* Footer con Paginación Integrada */}
          <div className="bg-[#F5F5F5] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span>COLS: {headers.length}</span>
              <span>ROWS: {filteredRowsWithIndex.length}</span>
            </div>
            
            {/* Controles de Navegación de Página */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border border-[#D2D2D2] hover:bg-[#EDEBE9] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Anterior
              </button>
              <span className="text-[#242424] font-normal px-1">
                Página <strong className="font-semibold">{currentPage}</strong> de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border border-[#D2D2D2] hover:bg-[#EDEBE9] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}