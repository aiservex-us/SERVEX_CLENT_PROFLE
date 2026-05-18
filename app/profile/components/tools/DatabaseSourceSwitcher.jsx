'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/**
 * DatabaseSourceSwitcher
 * Componente de control dual para conmutar el origen de datos de un cliente 
 * entre los esquemas de 'client_submissions' y 'client_original'.
 *
 * @param {string|number} selectedId - ID del registro del cliente seleccionado.
 * @param {function} onSourceDataFetched - Callback que devuelve las filas estructuradas y el origen actual al padre.
 * @param {boolean} disabled - Estado de bloqueo si el padre está editando o eliminando.
 */
export default function DatabaseSourceSwitcher({ selectedId, onSourceDataFetched, disabled }) {
  const [activeSource, setActiveSource] = useState('submissions'); // 'submissions' o 'original'
  const [loading, setLoading] = useState(false);

  // Cada vez que cambie el cliente seleccionado en la matriz, reseteamos el origen a producción (submissions)
  useEffect(() => {
    setActiveSource('submissions');
  }, [selectedId]);

  // Efecto secundario encargado de realizar el fetch reactivo cuando cambia el origen de datos o el cliente elegido
  useEffect(() => {
    if (!selectedId) return;

    async function fetchSourceData() {
      try {
        setLoading(true);
        
        // Determinamos dinámicamente la tabla de destino en Supabase
        const targetTable = activeSource === 'submissions' ? 'client_submissions' : 'client_original';
        
        const { data, error } = await supabase
          .from(targetTable)
          .select('*')
          .eq('id', selectedId)
          .single();

        if (error) throw error;

        // Si la consulta es exitosa, enviamos el payload completo de vuelta al componente matriz
        if (onSourceDataFetched) {
          onSourceDataFetched({
            source: activeSource,
            rawRecord: data
          });
        }
      } catch (err) {
        console.error(`❌ Error recuperando información desde public.${activeSource === 'submissions' ? 'client_submissions' : 'client_original'}:`, err);
        alert(`Error al cambiar de origen de datos: ${err.message}`);
        // Fallback defensivo: revertir estado visual en caso de error de red o de registros inexistentes en el espejo
        setActiveSource('submissions');
      } finally {
        setLoading(false);
      }
    }

    fetchSourceData();
  }, [activeSource, selectedId]);

  const toggleSource = () => {
    if (disabled || loading) return;
    setActiveSource((prev) => (prev === 'submissions' ? 'original' : 'submissions'));
  };

  return (
    <div className="flex items-center bg-[#F3F2F1] border border-[#D2D2D2] rounded-sm p-0.5 select-none transition-all">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={toggleSource}
        className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-xs transition-all duration-150 flex items-center gap-1 ${
          activeSource === 'submissions'
            ? 'bg-[#5B5FC7] text-white shadow-xs'
            : 'text-[#616161] hover:text-[#242424] hover:bg-white/60'
        }`}
        title="Ver datos modificados / actuales del flujo de envío"
      >
        {loading && activeSource === 'submissions' && (
          <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        DB Submissions
      </button>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={toggleSource}
        className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-xs transition-all duration-150 flex items-center gap-1 ${
          activeSource === 'original'
            ? 'bg-[#107C41] text-white shadow-xs'
            : 'text-[#616161] hover:text-[#242424] hover:bg-white/60'
        }`}
        title="Ver datos de auditoría / archivos planos idénticos al input inicial"
      >
        {loading && activeSource === 'original' && (
          <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        DB Original
      </button>
    </div>
  );
}