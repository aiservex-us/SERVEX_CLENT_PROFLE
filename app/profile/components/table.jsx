'use client';

import React, { useState, useEffect, useMemo } from 'react';
// Importamos la instancia desde tu ruta de biblioteca
import { supabase } from '@/app/lib/supabaseClient'; 

export default function ClientSubmissionsMatrix() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Cargar la lista inicial de envíos (para el selector de la interfaz)
  useEffect(() => {
    async function getSubmissionsList() {
      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from('client_submissions')
          .select('id, company_name, created_at, country, city')
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

  // 2. Traer el registro completo (incluyendo slots jsonb) cuando cambie la selección
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);

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

  // 3. Procesar, aplanar y consolidar dinámicamente los data_slots JSONB en filas matriciales
  const matrixData = useMemo(() => {
    if (!activeSubmission) return { rows: [], headers: [] };

    // Mapeamos los slots definidos en tu DDL (se omite slot 7 que no está definido en el esquema)
    const targetSlots = [
      activeSubmission.data_slot_1,
      activeSubmission.data_slot_2,
      activeSubmission.data_slot_3,
      activeSubmission.data_slot_4,
      activeSubmission.data_slot_5,
      activeSubmission.data_slot_6,
      activeSubmission.data_slot_8,
    ];

    // Consolidamos todos los arrays dentro de los slots JSONB válidos
    const rows = targetSlots
      .filter((slot) => slot && Array.isArray(slot))
      .flat();

    // Extraemos las llaves (columnas del CSV/Excel) del primer registro para armar la cabecera
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    return { rows, headers };
  }, [activeSubmission]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF] text-sm font-semibold text-[#242424]">
        <div className="w-8 h-8 border-4 border-[#6121B6] border-t-transparent rounded-full animate-spin mb-3"></div>
        Conectando con Supabase y recuperando metadatos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto mt-10 bg-[#FDE7E9] border-l-4 border-[#A80007] text-[#A80007] shadow-sm text-sm rounded-r flex items-center gap-2">
        <span className="font-bold">Error de sincronización:</span> {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-5 text-[#242424] font-sans antialiased selection:bg-[#E2E2F6]">
      <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* Panel Superior de Control de Datos (Header de pestaña de Teams) */}
        <div className="bg-white p-4 rounded border border-[#E0E0E0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-[#242424] tracking-tight">Estructura de Datos Analizada (JSONB)</h1>
            <p className="text-xs text-[#616161] mt-0.5">Visualización nativa de archivos procesados y segmentados por slots</p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="submission-select" className="text-xs font-semibold text-[#242424] whitespace-nowrap">
              Seleccionar Envío:
            </label>
            <select
              id="submission-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-[#F0F0F0] hover:bg-[#EAEAEA] text-[#242424] border-b-2 border-transparent focus:border-[#4F46E5] rounded px-3 py-1.5 text-xs font-medium outline-none transition-all min-w-[260px] cursor-pointer"
            >
              {submissions.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-white text-[#242424]">
                  {sub.company_name || `ID: ${sub.id}`} ({sub.city || 'Sin ciudad'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metadatos del Cliente Activo (Cards estilo Fluent) */}
        {activeSubmission && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white p-3.5 rounded border border-[#E0E0E0] shadow-sm text-xs">
            <div className="border-r border-[#F0F0F0] pr-2 last:border-0">
              <span className="text-[#616161] block font-normal mb-0.5">Empresa</span>
              <span className="font-semibold text-[#242424] truncate block">{activeSubmission.company_name || 'N/A'}</span>
            </div>
            <div className="border-r border-[#F0F0F0] pr-2 last:border-0 md:block hidden">
              <span className="text-[#616161] block font-normal mb-0.5">Actividad Comercial</span>
              <span className="font-medium text-[#424242] truncate block">{activeSubmission.business_activity || 'N/A'}</span>
            </div>
            <div className="border-r border-[#F0F0F0] pr-2 last:border-0">
              <span className="text-[#616161] block font-normal mb-0.5">Ubicación</span>
              <span className="font-medium text-[#424242] truncate block">{activeSubmission.city ? `${activeSubmission.city}, ${activeSubmission.country}` : 'N/A'}</span>
            </div>
            <div className="border-r border-[#F0F0F0] pr-2 last:border-0">
              <span className="text-[#616161] block font-normal mb-0.5">Contacto</span>
              <span className="font-medium text-[#424242] truncate block">{activeSubmission.contact_email || 'N/A'}</span>
            </div>
            <div className="last:border-0">
              <span className="text-[#616161] block font-normal mb-0.5">Creado</span>
              <span className="font-normal text-[#616161] block">
                {activeSubmission.created_at ? new Date(activeSubmission.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Matriz Estilo Data Grid / Listas de Teams */}
        <div className="bg-white rounded border border-[#E0E0E0] shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-[#EDF0F2] bg-[#FAFAFA] flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#616161]">
              {fetchingSlots ? 'Actualizando Matriz...' : 'Dataset Matrix View'}
            </span>
            <div className="text-[11px] bg-[#E2E2F6] font-semibold px-2 py-0.5 rounded text-[#4F46E5]">
              Slots combinados: 1-6, 8
            </div>
          </div>

          {matrixData.rows.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs bg-[#FAFAFA]">
              {fetchingSlots ? 'Recuperando celdas...' : 'No se encontraron arrays de datos válidos en los slots JSONB de este registro.'}
            </div>
          ) : (
            <div className="w-full overflow-auto max-h-[550px] relative">
              <table className="w-full border-collapse text-left text-xs min-w-full">
                
                {/* Cabecera Sticky estilo DataGrid de Teams */}
                <thead className="bg-[#FAFAFA] sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    {/* Indexador Izquierdo de Filas */}
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#616161] bg-[#F0F0F0] border-r border-[#E0E0E0] sticky left-0 z-30 select-none">
                      
                    </th>
                    {matrixData.headers.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-[11px] font-semibold text-[#242424] bg-[#FAFAFA] border-r border-[#E0E0E0] min-w-[160px] whitespace-nowrap select-all hover:bg-[#F0F0F0] transition-colors duration-75"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Filas e Inyección de Celdas */}
                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {matrixData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-[#F5F5F5] transition-colors duration-75 group">
                      
                      {/* Número de fila */}
                      <td className="px-2 py-1.5 text-center text-[10px] text-[#616161] bg-[#FAFAFA] border-r border-[#E0E0E0] sticky left-0 z-10 group-hover:bg-[#F0F0F0] select-none">
                        {rowIndex + 1}
                      </td>

                      {/* Renderizado Dinámico de las Propiedades del JSON */}
                      {matrixData.headers.map((header) => {
                        const cellValue = row[header];
                        return (
                          <td
                            key={header}
                            className="px-4 py-1.5 text-[#242424] border-r border-[#F0F0F0] whitespace-nowrap truncate max-w-[280px]"
                            title={cellValue !== null && cellValue !== undefined ? cellValue.toString() : ''}
                          >
                            {cellValue !== null && cellValue !== undefined ? (
                              cellValue.toString()
                            ) : (
                              <span className="text-[#9E9E9E] italic text-[10px]">null</span>
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

          {/* Estado de Dimensiones de la Hoja */}
          <div className="bg-[#FAFAFA] px-4 py-2 border-t border-[#E0E0E0] flex justify-end gap-4 text-[10px] font-semibold text-[#616161] select-none">
            <span>COLUMNAS: {matrixData.headers.length}</span>
            <span>FILAS: {matrixData.rows.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}