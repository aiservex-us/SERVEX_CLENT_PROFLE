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

  // 2. Traer el registro completo (incluyendo slots jsonb) al cambiar la selección
  useEffect(() => {
    if (!selectedId) return;

    async function fetchFullSubmission() {
      try {
        setFetchingSlots(true);
        const { data, error: sbError } = await supabase
          .from('client_submissions')
          .select('*')
          .eq('id', selectedId)
          .single();

        if (sbError) throw sbError;
        setActiveSubmission(data);
      } catch (err) {
        console.error('❌ Error al recuperar slots estructurados:', err);
      } finally {
        setFetchingSlots(false);
      }
    }
    fetchFullSubmission();
  }, [selectedId]);

  // 3. Procesar y consolidar dinámicamente los data_slots JSONB
  const matrixData = useMemo(() => {
    if (!activeSubmission) return { rows: [], headers: [] };

    const targetSlots = [
      activeSubmission.data_slot_1,
      activeSubmission.data_slot_2,
      activeSubmission.data_slot_3,
      activeSubmission.data_slot_4,
      activeSubmission.data_slot_5,
      activeSubmission.data_slot_6,
      activeSubmission.data_slot_8,
    ];

    const rows = targetSlots
      .filter((slot) => slot && Array.isArray(slot))
      .flat();

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { rows, headers };
  }, [activeSubmission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[99%] bg-[#F5F5F5] text-xs font-semibold text-[#616161] font-sans">
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
    <div className="min-h-[99%] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      
      {/* CONTENEDOR RESTRINGIDO A 1000PX MÁXIMO Y FULL RESPONSIVO */}
      <div className="w-full max-w-[1000px] mx-auto space-y-3">
        
        {/* Panel Superior de Control */}
        <div className="bg-white p-4 rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold text-[#242424] tracking-tight">Estructura de Datos Analizada</h1>
            <p className="text-[11px] text-[#616161]">Visualización matricial de slots JSONB</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              id="submission-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full sm:w-[240px] bg-white border border-[#D2D2D2] border-b-[#616161] rounded-sm px-2.5 py-1 text-xs font-normal text-[#242424] hover:border-[#616161] focus:border-b-2 focus:border-b-[#5B5FC7] outline-none transition-all cursor-pointer"
            >
              {submissions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.company_name || `ID: ${sub.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matriz Principal con scroll interno contenido */}
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Header de la Matriz */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-[#F0F0F0] flex justify-between items-center text-[11px]">
            <span className="font-semibold text-[#424242]">
              {fetchingSlots ? 'Actualizando...' : 'Dataset Matrix'}
            </span>
            <span className="bg-[#E0E0E0] font-sans font-semibold px-2 py-0.5 rounded-sm text-[#424242] text-[10px]">
              JSONB Slots
            </span>
          </div>

          {matrixData.rows.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              {fetchingSlots ? 'Recuperando celdas...' : 'No se encontraron registros numéricos ni arrays en los slots.'}
            </div>
          ) : (
            
            /* CONTENEDOR CLAVE DEL SCROLL INTERNO (X e Y) */
            <div className="w-full overflow-auto max-h-[650px] relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse text-left text-xs w-full min-w-max">
                
                {/* Cabecera de la tabla fija al hacer scroll vertical */}
                <thead className="bg-[#F5F5F5] sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    {/* Indexador numérico izquierdo fijo al hacer scroll horizontal */}
                    <th className="w-11 px-2 py-2 text-center text-[10px] font-semibold text-[#616161] bg-[#EDEBE9] sticky left-0 z-30 border-r border-b border-[#D2D2D2] select-none">
                      #
                    </th>
                    {matrixData.headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-[#F5F5F5] border-r border-b border-[#E0E0E0] min-w-[150px] max-w-[250px] whitespace-nowrap truncate font-sans"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Filas inyectadas */}
                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {matrixData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-[#F3F2F1] transition-colors duration-75 group">
                      
                      {/* Índice de fila izquierdo fijo */}
                      <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#616161] bg-[#F5F5F5] border-r border-[#E0E0E0] sticky left-0 z-10 group-hover:bg-[#EDEBE9] select-none border-b border-[#F0F0F0]">
                        {rowIndex + 1}
                      </td>

                      {/* Render dinámico de celdas */}
                      {matrixData.headers.map((header) => {
                        const cellValue = row[header];
                        return (
                          <td
                            key={header}
                            className="px-3 py-1.5 font-normal text-[#242424] border-r border-b border-[#F0F0F0] whitespace-nowrap truncate max-w-[250px] font-mono text-[11px]"
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

          {/* Estado inferior de dimensiones */}
          <div className="bg-[#F5F5F5] px-4 py-2 border-t border-[#E0E0E0] flex justify-end gap-4 text-[10px] font-semibold text-[#616161] select-none">
            <span>COLS: {matrixData.headers.length}</span>
            <span>ROWS: {matrixData.rows.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}