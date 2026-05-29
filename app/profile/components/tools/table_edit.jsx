'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient'; 
import FileSlotsManager from './FileSlotsManager'; 

export default function ClientSubmissionsMatrix() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ESTADOS DE EDICIÓN MÚTABLES
  const [isEditing, setIsEditing] = useState(false);
  const [localRows, setLocalRows] = useState([]); 
  const [isSaving, setIsSaving] = useState(false);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // MODAL PRODUCTO DINÁMICO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({});

  // ELIMINACIÓN CONDICIONAL
  const [isDeleteMode, setIsDeleteMode] = useState(false); 
  const [selectedRowIndexes, setSelectedRowIndexes] = useState([]); 

  // MODAL SLOTS
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState(false);

  // ========================================================
  // 1. EXTRAER CABECERAS 100% DINÁMICAS (SOLUCIÓN AL ERROR)
  // ========================================================
  const headers = useMemo(() => {
    if (!localRows || localRows.length === 0) return [];
    
    // Lee de forma reactiva el dataset actual en pantalla y extrae sus llaves reales
    const dynamicKeys = new Set();
    localRows.forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(key => dynamicKeys.add(key));
      }
    });
    
    return Array.from(dynamicKeys);
  }, [localRows]);

  // ========================================================
  // 2. EXPORTACIÓN A CSV DINÁMICA (SOLUCIÓN AL ERROR)
  // ========================================================
  const exportToCSV = () => {
    if (!localRows || localRows.length === 0 || headers.length === 0) {
      alert('No hay datos disponibles en la matriz para exportar.');
      return;
    }

    const csvRows = [];
    
    // Inyecta las cabeceras reales descubiertas dinámicamente
    csvRows.push(headers.join(';'));

    // Mapea las filas respetando estrictamente el orden dinámico de las columnas
    localRows.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
        const escaped = ('' + val).replace(/"/g, '""');
        return /[";\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(';'));
    });

    const csvContent = csvRows.join('\r\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const companyToken = activeSubmission?.company_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'GENERIC';
    const fileName = `SVX_EXPORT_${companyToken}_${randomNumber}.csv`;

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Cargar lista inicial
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
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getSubmissionsList();
  }, []);

  // Cargar cliente y unificar buffers de datos
  useEffect(() => {
    if (!selectedId) return;

    async function fetchFullSubmission() {
      try {
        setFetchingSlots(true);
        setSearchTerm(''); 
        setIsEditing(false); 
        setIsDeleteMode(false); 
        setCurrentPage(1); 
        setSelectedRowIndexes([]); 
        
        const { data, error: sbError } = await supabase
          .from('client_submissions')
          .select('*')
          .eq('id', selectedId)
          .single();

        if (sbError) throw sbError;
        setActiveSubmission(data);

        // Consolidación inicial de filas desde los slots
        const targetSlots = [
          data.data_slot_1, data.data_slot_2, data.data_slot_3, data.data_slot_4,
          data.data_slot_5, data.data_slot_6, data.data_slot_8,
        ];
        
        // Extraer filas manejando si vienen crudas (Array) o envueltas por el FileSlotsManager (Objeto con .rows)
        const flatRows = targetSlots
          .filter(slot => slot)
          .map(slot => Array.isArray(slot) ? slot : (slot.rows || []))
          .flat();

        setLocalRows(JSON.parse(JSON.stringify(flatRows))); 

      } catch (err) {
        console.error('❌ Error al recuperar slots:', err);
      } finally {
        setFetchingSlots(false);
      }
    }
    fetchFullSubmission();
  }, [selectedId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCellChange = (rowIndex, header, newValue) => {
    setLocalRows(prevRows => {
      const updated = [...prevRows];
      updated[rowIndex] = { ...updated[rowIndex], [header]: newValue };
      return updated;
    });
  };

  const filteredRowsWithIndex = useMemo(() => {
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

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRowsWithIndex.slice(startIndex, endIndex);
  }, [filteredRowsWithIndex, currentPage]);

  const totalPages = Math.ceil(filteredRowsWithIndex.length / itemsPerPage) || 1;

  // Guardar cambios sin destruir la separación estructural
  const handleSaveChanges = async (rowsToSave = localRows) => {
    try {
      setIsSaving(true);

      // Mantenemos los datos limpios en el slot_1 para edición interactiva
      const { error: updateError } = await supabase
        .from('client_submissions')
        .update({
          data_slot_1: rowsToSave, 
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
      setIsDeleteMode(false); 
      setSelectedRowIndexes([]); 
      alert('💾 Matriz universal actualizada con éxito.');
    } catch (err) {
      console.error('❌ Error guardando:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    if (activeSubmission) {
      const targetSlots = [
        activeSubmission.data_slot_1, activeSubmission.data_slot_2, activeSubmission.data_slot_3,
        activeSubmission.data_slot_4, activeSubmission.data_slot_5, activeSubmission.data_slot_6,
        activeSubmission.data_slot_8,
      ];
      const flatRows = targetSlots
        .filter(slot => slot)
        .map(slot => Array.isArray(slot) ? slot : (slot.rows || []))
        .flat();
      setLocalRows(JSON.parse(JSON.stringify(flatRows)));
    }
    setIsEditing(false);
  };

  const handleOpenModal = () => {
    const defaultFields = {};
    headers.forEach(h => { defaultFields[h] = ''; });
    setNewProduct(defaultFields);
    setIsModalOpen(true);
  };

  const handleFormInputChange = (header, value) => {
    setNewProduct(prev => ({ ...prev, [header]: value }));
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const updatedRows = [newProduct, ...localRows];
    setLocalRows(updatedRows);
    setIsModalOpen(false);
    await handleSaveChanges(updatedRows);
  };

  const handleSelectAllPageToggle = () => {
    const paginatedIndexes = paginatedRows.map(p => p.originalIndex);
    const allSelectedOnPage = paginatedIndexes.every(idx => selectedRowIndexes.includes(idx));

    if (allSelectedOnPage) {
      setSelectedRowIndexes(prev => prev.filter(idx => !paginatedIndexes.includes(idx)));
    } else {
      setSelectedRowIndexes(prev => Array.from(new Set([...prev, ...paginatedIndexes])));
    }
  };

  const handleSelectRowToggle = (originalIndex) => {
    setSelectedRowIndexes(prev => 
      prev.includes(originalIndex) ? prev.filter(idx => idx !== originalIndex) : [...prev, originalIndex]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedRowIndexes.length === 0) {
      setIsDeleteMode(false);
      return;
    }
    if (!window.confirm('¿Eliminar registros seleccionados?')) return;
    const updatedRows = localRows.filter((_, index) => !selectedRowIndexes.includes(index));
    setLocalRows(updatedRows);
    await handleSaveChanges(updatedRows);
  };

  const handleCancelDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedRowIndexes([]);
  };

  const isAllPageSelected = useMemo(() => {
    if (paginatedRows.length === 0) return false;
    return paginatedRows.map(p => p.originalIndex).every(idx => selectedRowIndexes.includes(idx));
  }, [paginatedRows, selectedRowIndexes]);

  // ========================================================
  // 3. INTERCEPTOR DINÁMICO PARA SELECCIÓN DE ARCHIVOS NUEVOS
  // ========================================================
  const handleSelectSlotData = (slotContent) => {
    if (!slotContent) {
      alert("El buffer seleccionado está vacío.");
      return;
    }

    // Extrae las filas sin importar si es un array directo o un payload estructurado
    const targetRows = Array.isArray(slotContent) ? slotContent : (slotContent.rows || []);
    
    if (targetRows.length === 0) {
      alert("El catálogo no contiene registros legibles.");
      return;
    }

    // Al clonar estas nuevas filas, el useMemo superior recalculará instantáneamente las columnas tal cual son
    setLocalRows(JSON.parse(JSON.stringify(targetRows)));
    setCurrentPage(1);
    setIsSlotsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
          Cargando matriz universal agnóstica...
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
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Cabecera */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#242424]">Visualizador Universal de Catálogos</span>
              <span className="text-[10px] text-[#616161]">
                {fetchingSlots ? 'Cargando buffers...' : `Estructura dinámica basada en el archivo de: ${activeSubmission?.company_name || 'Sin nombre'}`}
              </span>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSlotsModalOpen(true)}
                disabled={isEditing || isDeleteMode}
                className="bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all disabled:opacity-50"
              >
                📁 Ver Slots / Cambiar CSV
              </button>

              <input
                type="text"
                placeholder="Filtrar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isEditing || isDeleteMode}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] focus:border-[#5B5FC7] outline-none transition-all w-[160px]"
              />

              <select
                id="submission-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={isEditing || isDeleteMode}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] cursor-pointer max-w-[160px]"
              >
                {submissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.company_name || `Cliente ID: ${sub.id}`}
                  </option>
                ))}
              </select>

              <div className="flex gap-1 border-l border-slate-300 pl-1">
                {!isEditing && !isDeleteMode && (
                  <>
                    <button
                      type="button"
                      onClick={exportToCSV}
                      disabled={localRows.length === 0}
                      className="bg-[#107C41] hover:bg-[#0A5C30] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all"
                    >
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => setIsDeleteMode(true)}
                      disabled={headers.length === 0}
                      className="bg-[#484B97] hover:bg-[#5B5FC7] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={handleOpenModal}
                      disabled={headers.length === 0}
                      className="bg-[#484B97] hover:bg-[#5B5FC7] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm"
                    >
                      Añadir
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      disabled={headers.length === 0}
                      className="bg-[#484B97] hover:bg-[#5B5FC7] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm"
                    >
                      Editar
                    </button>
                  </>
                )}

                {isDeleteMode && (
                  <>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isSaving || selectedRowIndexes.length === 0}
                      className="bg-[#A80000] hover:bg-[#820000] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm"
                    >
                      {selectedRowIndexes.length === 0 ? 'Seleccione Filas' : `Confirmar Borrado (${selectedRowIndexes.length})`}
                    </button>
                    <button
                      onClick={handleCancelDeleteMode}
                      className="bg-white border border-[#A19F9D] text-xs px-2.5 py-0.5 rounded-sm"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {isEditing && (
                  <>
                    <button
                      onClick={() => handleSaveChanges()}
                      disabled={isSaving}
                      className="bg-[#107C41] hover:bg-[#0A5C30] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm"
                    >
                      {isSaving ? '...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancelChanges}
                      className="bg-white border border-[#A19F9D] text-xs px-2.5 py-0.5 rounded-sm"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Datos Dinámica */}
          {paginatedRows.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs bg-white">
              No hay registros o columnas para desplegar en este catálogo.
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative">
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    {isDeleteMode && (
                      <th className="w-9 px-2 py-2 text-center bg-[#FCFAFF] border-r border-b border-[#E0E0E0]">
                        <input
                          type="checkbox"
                          checked={isAllPageSelected}
                          onChange={handleSelectAllPageToggle}
                          className="cursor-pointer accent-[#5B5FC7]"
                        />
                      </th>
                    )}
                    <th className={`w-11 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-[#FCFAFF] border-r border-b border-[#E0E0E0] sticky left-0 z-30 ${isDeleteMode ? 'left-9' : 'left-0'}`}>
                      #
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[160px] max-w-[280px] whitespace-nowrap truncate font-mono"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {paginatedRows.map(({ row, originalIndex }) => {
                    const isRowSelected = selectedRowIndexes.includes(originalIndex);
                    return (
                      <tr key={originalIndex} className={`${isRowSelected ? 'bg-[#EBF3FC]' : 'hover:bg-[#F7F5FA]'}`}>
                        {isDeleteMode && (
                          <td className="px-2 py-1.5 text-center border-r border-b border-[#E0E0E0]">
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onChange={() => handleSelectRowToggle(originalIndex)}
                              className="cursor-pointer accent-[#5B5FC7]"
                            />
                          </td>
                        )}
                        <td className={`px-2 py-1.5 text-center font-bold text-[#5B5FC7] border-r border-b border-[#E0E0E0] bg-white`}>
                          {originalIndex + 1}
                        </td>
                        {headers.map((header) => {
                          const cellValue = row[header];
                          return (
                            <td key={header} className="p-0 border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={cellValue !== null && cellValue !== undefined ? cellValue : ''}
                                  onChange={(e) => handleCellChange(originalIndex, header, e.target.value)}
                                  className="w-full h-full px-3 py-1.5 bg-transparent font-mono text-[11px] outline-none focus:bg-white focus:ring-1 focus:ring-[#5B5FC7]"
                                />
                              ) : (
                                <div className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate" title={cellValue?.toString() || ''}>
                                  {cellValue !== null && cellValue !== undefined ? cellValue.toString() : <span className="text-[#A19F9D] italic text-[10px]">null</span>}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="bg-[#FCFAFF] px-4 py-2 border-t border-[#E0E0E0] flex justify-between items-center text-[10px] text-[#616161]">
            <div className="flex gap-4 font-mono">
              <span>COLUMNAS: {headers.length}</span>
              <span>FILAS: {filteredRowsWithIndex.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border border-[#D2D2D2] px-2 py-0.5 rounded-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border border-[#D2D2D2] px-2 py-0.5 rounded-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CREACIÓN DINÁMICA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#E0E0E0] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-[#FCFAFF] border-b border-[#E0E0E0] flex items-center justify-between">
              <span className="text-xs font-bold">Añadir Registro al Catálogo Actual</span>
              <button onClick={() => setIsModalOpen(false)} className="text-xs font-bold">✕</button>
            </div>
            <form onSubmit={handleAddProductSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {headers.map((header) => (
                  <div key={header} className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#616161] font-mono">{header}</label>
                    <input
                      type="text"
                      value={newProduct[header] || ''}
                      onChange={(e) => handleFormInputChange(header, e.target.value)}
                      className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-1 text-[11px] font-mono"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[#E0E0E0] flex justify-end gap-2 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-xs border px-3 py-1">Cancelar</button>
                <button type="submit" className="bg-[#107C41] text-white text-xs px-4 py-1">Insertar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INTEGRADO DE FILE SLOTS MANAGER */}
      {isSlotsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-[#E0E0E0]">
            <div className="px-4 py-3 bg-[#FCFAFF] border-b border-[#E0E0E0] flex items-center justify-between">
              <span className="text-xs font-bold text-[#242424]">SVX Ingestion Engine - Orquestador de Buffers</span>
              <button 
                onClick={() => setIsSlotsModalOpen(false)}
                className="text-[#616161] hover:text-[#242424] text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA]">
              <FileSlotsManager onSelectSlot={handleSelectSlotData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}