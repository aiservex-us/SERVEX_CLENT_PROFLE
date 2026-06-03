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

  // Filas cargadas de forma estática para visualización
  const [localRows, setLocalRows] = useState([]);

  // ESTADO PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ===================================================
  // ALGORITMO INTEGRADO DE SANEAMIENTO ESTRUCTURAL SVX
  // ===================================================
  /**
   * Toma un array de filas corruptas y limpia estructuralmente sus llaves (cabeceras).
   * Remueve saltos de línea, retornos de carro, comillas y colapsa espacios múltiples.
   */
  const sanitizeCatalogRows = (rawRows) => {
    if (!rawRows || !Array.isArray(rawRows) || rawRows.length === 0) return [];

    console.log("[+] Iniciando saneamiento estructural en memoria (Matriz JSX)...");

    return rawRows.map(row => {
      const sanitizedRow = {};
      
      Object.keys(row).forEach(key => {
        // 1. Remover saltos de línea, retornos de carro, comillas simples y dobles
        let cleanKey = key
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/"/g, '')
          .replace(/'/g, '');

        // 2. Colapsar espacios dobles o múltiples internos y hacer trim de los extremos
        cleanKey = cleanKey.split(/\s+/).join(' ').strip ? cleanKey.trim() : cleanKey.replace(/\s+/g, ' ').trim();

        // Asignar el valor original a la cabecera perfectamente saneada
        sanitizedRow[cleanKey] = row[key];
      });

      return sanitizedRow;
    });
  };

  // Extraer las llaves dinámicamente del JSON original para las columnas (Agnóstico a la empresa)
  const headers = useMemo(() => {
    if (!localRows || localRows.length === 0) return [];
    return Object.keys(localRows[0]);
  }, [localRows]);

  // ===================================================
  // LÓGICA DE EXPORTACIÓN A CSV DINÁMICA
  // ===================================================
  const exportToCSV = () => {
    if (!localRows || localRows.length === 0 || headers.length === 0) {
      alert('No hay datos disponibles en la matriz para exportar.');
      return;
    }

    const dynamicHeaders = headers;
    const csvRows = [];
    
    // Insertar cabecera original delimitada por punto y coma
    csvRows.push(dynamicHeaders.join(';'));

    // Insertar las filas mapeando de forma limpia cada propiedad dinámica de localRows
    localRows.forEach(row => {
      const values = dynamicHeaders.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
        const escaped = ('' + val).replace(/"/g, '""');
        return /[";\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(';'));
    });

    const csvContent = csvRows.join('\r\n');

    // Inyectar BOM para forzar lectura UTF-8 exacta en aplicaciones como Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const companyClean = (activeSubmission?.company_name || 'CUSTOM_CATALOG')
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_');
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const fileName = `${companyClean}_EXPORT_${randomNumber}.csv`;

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
        setCurrentPage(1); 
        const { data, error: sbError } = await supabase
          .from('client_submissions')
          .select('*')
          .eq('id', selectedId)
          .single();

        if (sbError) throw sbError;
        setActiveSubmission(data);

        // Consolidar el primer slot activo estructurado que se encuentre
        const targetSlots = [
          data.data_slot_1,
          data.data_slot_2,
          data.data_slot_3,
          data.data_slot_4,
          data.data_slot_5,
          data.data_slot_6,
          data.data_slot_8,
        ];
        const firstActiveSlot = targetSlots.find((slot) => slot && Array.isArray(slot) && slot.length > 0) || [];
        
        // --- INYECCIÓN Y SANEAMIENTO ESTRUCTURAL EN CALIENTE ---
        const rawJsonCopy = JSON.parse(JSON.stringify(firstActiveSlot));
        const sanitizedData = sanitizeCatalogRows(rawJsonCopy);
        
        setLocalRows(sanitizedData); 

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

  // 3. Filtrado Inteligente aplicado sobre las filas locales
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

  // Segmentación de datos por paginación
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRowsWithIndex.slice(startIndex, endIndex);
  }, [filteredRowsWithIndex, currentPage]);

  const totalPages = Math.ceil(filteredRowsWithIndex.length / itemsPerPage) || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
          Retrieving edit data matrix...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-[90vw] mx-auto mt-10 bg-[#FDE7E9] border border-[#F3B0B4] text-[#A80007] rounded-sm text-xs font-sans">
        <span className="font-bold">Synchronization error:</span> {error}
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        {/* Main Matrix with Integrated Header */}
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Compact Table Header */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#242424]">Catalog Update Center</span>
              <span className="text-[10px] text-[#616161]">
                {fetchingSlots ? 'Updating & Sanitizing Structural Matrix...' : 'Data adjustment and editing processes corresponding to the catalog update'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              
              <input
                type="text"
                placeholder="Filter by SKU, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] placeholder-[#616161] focus:border-[#5B5FC7] outline-none transition-all w-[160px]"
              />

              <select
                id="submission-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] focus:border-[#5B5FC7] outline-none cursor-pointer max-w-[160px]"
              >
                {submissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.company_name || `ID: ${sub.id}`}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <div className="flex gap-1 border-l border-slate-300 pl-1">
                <button
                  type="button"
                  onClick={exportToCSV}
                  disabled={localRows.length === 0}
                  className="bg-[#107C41] hover:bg-[#0A5C30] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  Descargar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          {paginatedRows.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              No cells found to display.
            </div>
          ) : (
           <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-11 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-gradient-to-b from-white to-[#FCFAFF] sticky left-0 z-30 border-r border-b border-[#E0E0E0] select-none">
                      #
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-gradient-to-b from-white to-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[150px] max-w-[250px] whitespace-nowrap truncate font-sans"
                      >
                        {header}
                      </h2>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {paginatedRows.map(({ row, originalIndex }) => {
                    return (
                      <tr 
                        key={originalIndex} 
                        className="transition-colors duration-75 group hover:bg-[#F7F5FA]"
                      >
                        <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky left-0 z-10 select-none border-b border-[#F0F0F0] bg-white group-hover:bg-[#FCFAFF] transition-colors">
                          {originalIndex + 1}
                        </td>

                        {headers.map((header) => {
                          const cellValue = row[header];
                          return (
                            <td
                              key={header}
                              className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[150px] max-w-[250px]"
                            >
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
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span>COLS: {headers.length}</span>
              <span>ROWS: {filteredRowsWithIndex.length}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border border-[#D2D2D2] hover:bg-[#FCFAFF] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Previous
              </button>
              <span className="text-[#242424] font-normal px-1">
                Page <strong className="font-semibold">{currentPage}</strong> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border border-[#D2D2D2] hover:bg-[#FCFAFF] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}