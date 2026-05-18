'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient'; 

// === IMPORTACIONES DE COMPONENTES MODULARES ===
import FileSlotsManager from './FileSlotsManager'; 
import DatabaseSourceSwitcher from './DatabaseSourceSwitcher'; // Componente corregido con .maybeSingle()

export default function ClientSubmissionsMatrix() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [currentSource, setCurrentSource] = useState('submissions'); // Rastrea el origen activo
  
  // Estado para el término de búsqueda (Filtro Global / SKU)
  const [searchTerm, setSearchTerm] = useState('');

  // ESTADOS DE EDICIÓN MÚTABLES
  const [isEditing, setIsEditing] = useState(false);
  const [localRows, setLocalRows] = useState([]); // Clona los registros combinados para edición inline
  const [isSaving, setIsSaving] = useState(false);

  // ESTADO PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // NUEVOS ESTADOS PARA MODAL DE AGREGAR PRODUCTO DINÁMICO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({});

  // ESTADOS DE CONTROL PARA LA ELIMINACIÓN CONDICIONAL
  const [isDeleteMode, setIsDeleteMode] = useState(false); // Activa visualmente las opciones de borrado
  const [selectedRowIndexes, setSelectedRowIndexes] = useState([]); // Almacena índices seleccionados

  // === NUEVO ESTADO PARA EL POPUP DE DATA DISPONIBLE ===
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState(false);

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

  // 2. Traer el registro completo al cambiar la selección (Por defecto apunta a submissions)
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
        setCurrentSource('submissions'); // Reseteamos el tracking a prod por defecto

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
        setLocalRows(JSON.parse(JSON.stringify(flatRows))); 

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
      activeSubmission.data_slot_7, // Incluida para soportar esquemas de client_original
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

  // segmentación de datos por paginación
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRowsWithIndex.slice(startIndex, endIndex);
  }, [filteredRowsWithIndex, currentPage]);

  const totalPages = Math.ceil(filteredRowsWithIndex.length / itemsPerPage) || 1;

  // 6. Guardar cambios en Supabase reestructurando de vuelta a la tabla correspondiente
  const handleSaveChanges = async (rowsToSave = localRows) => {
    try {
      setIsSaving(true);
      
      // Determinamos dinámicamente la tabla activa para persistir la mutación de celdas
      const targetTable = currentSource === 'submissions' ? 'client_submissions' : 'client_original';

      const { error: updateError } = await supabase
        .from(targetTable)
        .update({
          data_slot_1: rowsToSave, 
          data_slot_2: null,       
          data_slot_3: null,
          data_slot_4: null,
          data_slot_5: null,
          data_slot_6: null,
          data_slot_7: null,
          data_slot_8: null,
        })
        .eq('id', selectedId);

      if (updateError) throw updateError;

      const { data: freshData } = await supabase
        .from(targetTable)
        .select('*')
        .eq('id', selectedId)
        .maybeSingle();
      
      setActiveSubmission(freshData);
      setIsEditing(false);
      setIsDeleteMode(false); 
      setSelectedRowIndexes([]); 
      alert(`💾 Cambios persistidos con éxito en la tabla: public.${targetTable}`);
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
        activeSubmission.data_slot_7,
        activeSubmission.data_slot_8,
      ];
      const flatRows = targetSlots.filter((slot) => slot && Array.isArray(slot)).flat();
      setLocalRows(JSON.parse(JSON.stringify(flatRows)));
    }
    setIsEditing(false);
  };

  // FUNCIONES PARA CONTROLAR EL NUEVO FORMULARIO DE PRODUCTOS
  const handleOpenModal = () => {
    const defaultFields = {};
    headers.forEach(h => { defaultFields[h] = ''; });
    setNewProduct(defaultFields);
    setIsModalOpen(true);
  };

  const handleFormInputChange = (header, value) => {
    setNewProduct(prev => ({
      ...prev,
      [header]: value
    }));
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const updatedRows = [newProduct, ...localRows];
    setLocalRows(updatedRows);
    setIsModalOpen(false);
    await handleSaveChanges(updatedRows);
  };

  // MANEJADORES DE SELECCIÓN Y ELIMINACIÓN
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
      prev.includes(originalIndex) 
        ? prev.filter(idx => idx !== originalIndex) 
        : [...prev, originalIndex]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedRowIndexes.length === 0) {
      setIsDeleteMode(false);
      return;
    }
    
    const confirmMessage = selectedRowIndexes.length === 1 
      ? '¿Está seguro de que desea eliminar el producto seleccionado?' 
      : `¿Está seguro de que desea eliminar los ${selectedRowIndexes.length} productos seleccionados?`;

    if (!window.confirm(confirmMessage)) return;

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

  const handleSelectSlotData = (slotContent) => {
    if (slotContent && (Array.isArray(slotContent) || typeof slotContent === 'object')) {
      const targetRows = Array.isArray(slotContent) ? slotContent : (slotContent.rows || []);
      setLocalRows(JSON.parse(JSON.stringify(targetRows)));
      setCurrentPage(1);
      setIsSlotsModalOpen(false);
    } else {
      alert("El slot seleccionado no contiene registros estructurados legibles.");
    }
  };

  // === INTERCEPTOR ACTUALIZADO PARA EL COMPONENTE EXTERNO SWITCHER ===
  const handleSourceDataFetched = ({ source, rawRecord }) => {
    if (!rawRecord) return;
    
    setActiveSubmission(rawRecord);
    setCurrentSource(source); // Almacenamos el origen actual ('submissions' o 'original')

    const targetSlots = [
      rawRecord.data_slot_1,
      rawRecord.data_slot_2,
      rawRecord.data_slot_3,
      rawRecord.data_slot_4,
      rawRecord.data_slot_5,
      rawRecord.data_slot_6,
      rawRecord.data_slot_7, // Soporta mapeo dinámico completo de la tabla original
      rawRecord.data_slot_8,
    ];
    const flatRows = targetSlots.filter((slot) => slot && Array.isArray(slot)).flat();
    setLocalRows(JSON.parse(JSON.stringify(flatRows)));
    setCurrentPage(1);
    setSelectedRowIndexes([]);
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
        
        {/* Matriz Principal */}
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Header Compacto de la Tabla */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#242424]">Estructura de Datos Analizada</span>
              <span className="text-[10px] text-[#616161]">
                {fetchingSlots ? 'Actualizando...' : isEditing ? 'Modificando JSON localmente' : isDeleteMode ? 'Selección de registros para depuración masiva' : `Visualización matricial de slots JSONB [Origen: ${currentSource.toUpperCase()}]`}
              </span>
            </div>

            {/* Controles del Header */}
            <div className="flex flex-wrap items-center gap-2">
              
              <button
                type="button"
                onClick={() => setIsSlotsModalOpen(true)}
                disabled={isEditing || isDeleteMode}
                className="bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                Todos tus Catalogos
              </button>

              {/* === COMPONENTE IMPORTADO E INYECTADO CORECTAMENTE === */}
              <DatabaseSourceSwitcher 
                selectedId={selectedId}
                disabled={isEditing || isDeleteMode}
                onSourceDataFetched={handleSourceDataFetched}
              />

              {/* Input de Búsqueda */}
              <input
                type="text"
                placeholder="Filtrar por SKU, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isEditing || isDeleteMode}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] placeholder-[#616161] focus:border-[#5B5FC7] outline-none transition-all disabled:opacity-50 w-[160px]"
              />

              {/* Selector de Envío */}
              <select
                id="submission-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={isEditing || isDeleteMode}
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
                {!isEditing && !isDeleteMode && (
                  <>
                    <button
                      onClick={() => setIsDeleteMode(true)}
                      disabled={headers.length === 0}
                      className="bg-[#484B97] hover:bg-[#5B5FC7] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={handleOpenModal}
                      disabled={headers.length === 0}
                      className="bg-[#484B97] hover:bg-[#5B5FC7] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all"
                    >
                      Añadir
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#484B97] hover:bg-[#5B5FC7] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all"
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
                      className="bg-[#A80000] hover:bg-[#820000] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all disabled:opacity-50 font-bold"
                    >
                      {selectedRowIndexes.length === 0 ? 'Seleccione Filas' : `Confirmar Borrado (${selectedRowIndexes.length})`}
                    </button>
                    <button
                      onClick={handleCancelDeleteMode}
                      disabled={isSaving}
                      className="bg-white border border-[#A19F9D] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all disabled:opacity-50"
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
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    {isDeleteMode && (
                      <th className="w-9 px-2 py-2 text-center bg-gradient-to-b from-white to-[#FCFAFF] sticky left-0 z-40 border-r border-b border-[#E0E0E0] select-none">
                        <input
                          type="checkbox"
                          checked={isAllPageSelected}
                          onChange={handleSelectAllPageToggle}
                          className="cursor-pointer accent-[#5B5FC7]"
                        />
                      </th>
                    )}
                    
                    <th className={`w-11 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-gradient-to-b from-white to-[#FCFAFF] sticky z-30 border-r border-b border-[#E0E0E0] select-none ${isDeleteMode ? 'left-9' : 'left-0'}`}>
                      #
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-gradient-to-b from-white to-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[150px] max-w-[250px] whitespace-nowrap truncate font-sans"
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
                      <tr 
                        key={originalIndex} 
                        className={`transition-colors duration-75 group ${isRowSelected ? 'bg-[#EBF3FC] hover:bg-[#E2EEFA]' : 'hover:bg-[#F7F5FA]'}`}
                      >
                        
                        {isDeleteMode && (
                          <td className={`px-2 py-1.5 text-center border-r border-[#E0E0E0] sticky left-0 z-10 select-none border-b border-[#F0F0F0] transition-colors ${isRowSelected ? 'bg-[#D6E8FC] group-hover:bg-[#C9E0FA]' : 'bg-white group-hover:bg-[#FCFAFF]'}`}>
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onChange={() => handleSelectRowToggle(originalIndex)}
                              className="cursor-pointer accent-[#5B5FC7]"
                            />
                          </td>
                        )}

                        <td className={`px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky z-10 select-none border-b border-[#F0F0F0] transition-colors ${isDeleteMode ? 'left-9' : 'left-0'} ${isRowSelected ? 'bg-[#D6E8FC] group-hover:bg-[#C9E0FA]' : 'bg-white group-hover:bg-[#FCFAFF]'}`}>
                          {originalIndex + 1}
                        </td>

                        {headers.map((header) => {
                          const cellValue = row[header];
                          return (
                            <td
                              key={header}
                              className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[150px] max-w-[250px] transition-all"
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer de Paginación */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span>COLS: {headers.length}</span>
              <span>ROWS: {filteredRowsWithIndex.length}</span>
              {selectedRowIndexes.length > 0 && (
                <span className="text-[#A80000]">SELECCIONADOS PARA BORRAR: {selectedRowIndexes.length}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border border-[#D2D2D2] hover:bg-[#FCFAFF] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-[#242424] font-normal px-1">
                Página <strong className="font-semibold">{currentPage}</strong> de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border border-[#D2D2D2] hover:bg-[#FCFAFF] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL PARA CREACIÓN DE PRODUCTOS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#E0E0E0] shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] border-b border-[#E0E0E0] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#242424]">Añadir Nuevo Registro Estructurado</span>
                <span className="text-[10px] text-[#616161]">Complete los atributos en base al esquema JSON original</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#616161] hover:text-[#242424] text-xs font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {headers.map((header) => (
                  <div key={header} className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#616161] truncate font-sans">{header}</label>
                    <input
                      type="text"
                      value={newProduct[header] || ''}
                      onChange={(e) => handleFormInputChange(header, e.target.value)}
                      className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-1 text-[11px] text-[#242424] focus:border-[#5B5FC7] outline-none font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E0E0E0] flex justify-end gap-2 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white border border-[#A19F9D] text-[#242424] text-[11px] font-medium px-3 py-1 rounded-sm">Cancelar</button>
                <button type="submit" className="bg-[#107C41] text-white text-[11px] font-medium px-4 py-1 rounded-sm">Insertar y Sincronizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP DE CATALOGOS ACTIVOS */}
      {isSlotsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#E0E0E0] shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] border-b border-[#E0E0E0] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#242424]">Explorador de Data Slots Activos</span>
                <span className="text-[10px] text-[#616161]">Seleccione el set de datos o archivo indexado que desea proyectar en la matriz</span>
              </div>
              <button onClick={() => setIsSlotsModalOpen(false)} className="text-[#616161] hover:text-[#242424] text-xs font-bold p-1">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA]">
              <FileSlotsManager onSelectSlot={handleSelectSlotData} />
            </div>

            <div className="p-3 border-t border-[#E0E0E0] flex justify-end bg-white">
              <button type="button" onClick={() => setIsSlotsModalOpen(false)} className="bg-white border border-[#A19F9D] text-[#242424] text-[11px] font-medium px-3 py-1 rounded-sm">Cerrar Explorador</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}