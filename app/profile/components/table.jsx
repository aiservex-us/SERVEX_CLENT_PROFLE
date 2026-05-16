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
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-sm font-medium text-slate-500">
        Conectando con Supabase y recuperando metadatos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-[1000px] mx-auto mt-10 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        <span className="font-bold">Error de sincronización:</span> {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-6 text-slate-800">
      
      {/* CONTENEDOR RESTRINGIDO A 1000PX MÁXIMO Y FULL RESPONSIVO */}
      <div className="w-full max-w-[1000px] mx-auto space-y-4">
        
        {/* Panel Superior de Control */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Estructura de Datos Analizada</h1>
            <p className="text-[11px] text-slate-500">Visualización matricial de slots JSONB</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              id="submission-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full sm:w-[220px] bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
          
          {/* Header de la Matriz */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center text-[11px]">
            <span className="font-bold uppercase tracking-wider text-slate-500">
              {fetchingSlots ? 'Actualizando...' : 'Dataset Matrix'}
            </span>
            <span className="bg-slate-200/60 font-mono px-1.5 py-0.5 rounded text-slate-600">
              JSONB Slots
            </span>
          </div>

          {matrixData.rows.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50/30">
              {fetchingSlots ? 'Recuperando celdas...' : 'No se encontraron registros numéricos ni arrays en los slots.'}
            </div>
          ) : (
            
            /* CONTENEDOR CLAVE DEL SCROLL INTERNO (X e Y) */
            <div className="w-full overflow-auto max-h-[450px] relative custom-scrollbar">
              <table className="table-fixed border-collapse text-left text-xs w-full min-w-max">
                
                {/* Cabecera de la tabla fija al hacer scroll vertical */}
                <thead className="bg-slate-100 sticky top-0 z-20 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                  <tr>
                    {/* Indexador numérico izquierdo fijo al hacer scroll horizontal */}
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-mono font-semibold text-slate-400 bg-slate-200 sticky left-0 z-30 border-r border-b border-slate-300 select-none">
                      #
                    </th>
                    {matrixData.headers.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-[11px] font-bold text-slate-700 bg-slate-100 border-r border-b border-slate-200 min-w-[150px] max-w-[250px] whitespace-nowrap truncate font-mono"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Filas inyectadas */}
                <tbody className="bg-white divide-y divide-slate-100">
                  {matrixData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-blue-50/30 transition-colors duration-75 group">
                      
                      {/* Índice de fila izquierdo fijo */}
                      <td className="px-2 py-1.5 text-center text-[10px] font-mono text-slate-400 bg-slate-50 border-r border-slate-200 sticky left-0 z-10 group-hover:bg-blue-100/50 select-none border-b border-slate-100">
                        {rowIndex + 1}
                      </td>

                      {/* Render dinámico de celdas */}
                      {matrixData.headers.map((header) => {
                        const cellValue = row[header];
                        return (
                          <td
                            key={header}
                            className="px-4 py-1.5 font-mono text-slate-600 border-r border-b border-slate-100 whitespace-nowrap truncate max-w-[250px]"
                            title={cellValue !== null && cellValue !== undefined ? cellValue.toString() : ''}
                          >
                            {cellValue !== null && cellValue !== undefined ? (
                              cellValue.toString()
                            ) : (
                              <span className="text-slate-300 italic text-[10px]">null</span>
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
          <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-end gap-4 text-[10px] font-mono text-slate-400 select-none">
            <span>COLS: {matrixData.headers.length}</span>
            <span>ROWS: {matrixData.rows.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}