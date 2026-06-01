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

  // BUFFER ACTIVO SELECCIONADO
  const [activeSlot, setActiveSlot] = useState('data_slot_1');
  const [localRows, setLocalRows] = useState([]); 

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // MODAL SLOTS
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState(false);

  // ========================================================
  // 1. EXTRAER CABECERAS AISLADAS Y ESTRICTAS DEL ARCHIVO ACTUAL
  // ========================================================
  const headers = useMemo(() => {
    if (!localRows || !Array.isArray(localRows) || localRows.length === 0) return [];
    
    const dynamicKeys = new Set();
    
    localRows.forEach(row => {
      // Validar que la fila sea un objeto real de base de datos y no un array o primitivo
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        Object.keys(row).forEach(key => {
          // Filtrar llaves del sistema vacías o corruptas
          if (key && key.trim() !== '') {
            dynamicKeys.add(key);
          }
        });
      }
    });
    
    return Array.from(dynamicKeys);
  }, [localRows]); // Depende estrictamente de las filas en pantalla actual

  // ========================================================
  // 2. EXPORTACIÓN A CSV DINÁMICA
  // ========================================================
  const exportToCSV = () => {
    if (!localRows || localRows.length === 0 || headers.length === 0) {
      alert('No hay datos disponibles en la matriz para exportar.');
      return;
    }

    const csvRows = [];
    csvRows.push(headers.join(';'));

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

  // Cargar lista inicial de clientes
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

  // Cargar cliente y aislar el slot garantizando la limpieza del estado anterior
  useEffect(() => {
    if (!selectedId) return;

    async function fetchFullSubmission() {
      try {
        setFetchingSlots(true);
        setSearchTerm(''); 
        setCurrentPage(1); 
        
        const { data, error: sbError } = await supabase
          .from('client_submissions')
          .select('*')
          .eq('id', selectedId)
          .single();

        if (sbError) throw sbError;
        setActiveSubmission(data);

        const targetSlotData = data[activeSlot];
        
        // INTERCEPTOR DE FORMATO: Asegura extraer las filas reales vengan como vengan del JSON
        let slotRows = [];
        if (targetSlotData) {
          if (Array.isArray(targetSlotData)) {
            slotRows = targetSlotData;
          } else if (targetSlotData.rows && Array.isArray(targetSlotData.rows)) {
            slotRows = targetSlotData.rows;
          } else if (typeof targetSlotData === 'object') {
            // Si vino como objeto con índices o propiedades arbitrarias
            slotRows = Object.values(targetSlotData).filter(v => typeof v === 'object');
          }
        }

        // Deep clone limpio para romper referencias en memoria con estados previos
        setLocalRows(JSON.parse(JSON.stringify(slotRows))); 

      } catch (err) {
        console.error('❌ Error al recuperar el slot activo:', err);
        setLocalRows([]);
      } finally {
        setFetchingSlots(false);
      }
    }
    fetchFullSubmission();
  }, [selectedId, activeSlot]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtrado de registros en memoria
  const filteredRowsWithIndex = useMemo(() => {
    if (!Array.isArray(localRows)) return [];
    const indexedRows = localRows.map((row, index) => ({ row, originalIndex: index }));
    if (!searchTerm.trim()) return indexedRows;
    const lowerCaseSearch = searchTerm.toLowerCase().trim();

    return indexedRows.filter(({ row }) => {
      if (!row || typeof row !== 'object') return false;
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(lowerCaseSearch);
      });
    });
  }, [localRows, searchTerm]);

  // Segmentación para paginación
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRowsWithIndex.slice(startIndex, endIndex);
  }, [filteredRowsWithIndex, currentPage]);

  const totalPages = Math.ceil(filteredRowsWithIndex.length / itemsPerPage) || 1;

  // Interceptor para inyecciones volátiles desde FileSlotsManager
  const handleSelectSlotData = (slotContent) => {
    if (!slotContent) {
      alert("El buffer seleccionado está vacío.");
      return;
    }

    const targetRows = Array.isArray(slotContent) ? slotContent : (slotContent.rows || []);
    if (targetRows.length === 0) {
      alert("El catálogo no contiene registros legibles.");
      return;
    }

    setLocalRows(JSON.parse(JSON.stringify(targetRows)));
    setCurrentPage(1);
    setIsSlotsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
          Cargando matriz de catálogos independientes...
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
          
          {/* Cabecera / Controles Superiores */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#242424]">Visualizador Espejo de Catálogos (Aislado)</span>
              <span className="text-[10px] text-[#616161]">
                {fetchingSlots ? 'Cargando buffers...' : `Estructura nativa del archivo: ${activeSubmission?.company_name || 'Sin nombre'}`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSlotsModalOpen(true)}
                className="bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all"
              >
                📁 Ver Slots / Cambiar CSV
              </button>

              <input
                type="text"
                placeholder="Filtrar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] focus:border-[#5B5FC7] outline-none transition-all w-[160px]"
              />

              {/* Selector de Slots */}
              <select
                value={activeSlot}
                onChange={(e) => setActiveSlot(e.target.value)}
                className="bg-[#FCFAFF] border border-[#5B5FC7]/40 text-[#484B97] font-semibold rounded-sm px-2 py-0.5 text-[11px] cursor-pointer max-w-[140px]"
              >
                <option value="data_slot_1">Slot 01 (Principal)</option>
                <option value="data_slot_2">Slot 02</option>
                <option value="data_slot_3">Slot 03</option>
                <option value="data_slot_4">Slot 04</option>
                <option value="data_slot_5">Slot 05</option>
                <option value="data_slot_6">Slot 06</option>
                <option value="data_slot_8">Slot 08</option>
              </select>

              {/* Selector de Clientes */}
              <select
                id="submission-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] cursor-pointer max-w-[160px]"
              >
                {submissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.company_name || `Cliente ID: ${sub.id}`}
                  </option>
                ))}
              </select>

              <div className="flex gap-1 border-l border-slate-300 pl-1">
                <button
                  type="button"
                  onClick={exportToCSV}
                  disabled={localRows.length === 0}
                  className="bg-[#107C41] hover:bg-[#0A5C30] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all target-disabled"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Datos Read-Only */}
          {paginatedRows.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs bg-white">
              No hay registros o columnas para desplegar en este catálogo.
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative">
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-11 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-[#FCFAFF] border-r border-b border-[#E0E0E0] sticky left-0 z-30">
                      #
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[180px] max-w-[400px] whitespace-nowrap truncate font-mono text-ellipsis overflow-hidden"
                        title={header}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {paginatedRows.map(({ row, originalIndex }) => (
                    <tr key={originalIndex} className="hover:bg-[#F7F5FA]">
                      <td className="px-2 py-1.5 text-center font-bold text-[#5B5FC7] border-r border-b border-[#E0E0E0] bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#E0E0E0]">
                        {originalIndex + 1}
                      </td>
                      {headers.map((header) => {
                        const cellValue = row[header];
                        return (
                          <td 
                            key={header} 
                            className="px-3 py-1.5 border-r border-b border-[#F0F0F0] min-w-[180px] max-w-[400px] font-mono text-[11px] whitespace-nowrap truncate text-ellipsis overflow-hidden" 
                            title={cellValue !== null && cellValue !== undefined ? cellValue.toString() : ''}
                          >
                            {cellValue !== null && cellValue !== undefined ? (
                              cellValue.toString()
                            ) : (
                              <span className="text-[#A19F9D] italic text-[10px]">null</span>
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