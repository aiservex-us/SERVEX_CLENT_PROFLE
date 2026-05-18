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
        
        // Usamos .maybeSingle() en lugar de .single() para prevenir errores fatales de coerción 406 
        // si el registro no existe o hay redundancia de llaves en la base de datos de auditoría
        const { data, error } = await supabase
          .from(targetTable)
          .select('*')
          .eq('id', selectedId)
          .maybeSingle();

        if (error) throw error;

        // Si no se encuentra información en la tabla secundaria, alertamos y revertimos de forma segura
        if (!data) {
          throw new Error(`El registro con ID [${selectedId}] no tiene un espejo equivalente en la tabla public.${targetTable}.`);
        }

        // Si la consulta es exitosa, enviamos el payload completo de vuelta al componente matriz
        if (onSourceDataFetched) {
          onSourceDataFetched({
            source: activeSource,
            rawRecord: data
          });
        }
      } catch (err) {
        console.error(`❌ Error recuperando información desde public.${activeSource === 'submissions' ? 'client_submissions' : 'client_original'}:`, err);
        alert(`Aviso de Origen: ${err.message}`);
        
        // Fallback defensivo: revertir estado visual en caso de registros inexistentes
        setActiveSource('submissions');
      } finally {
        setLoading(false);
      }
    }

    fetchSourceData();
  }, [activeSource, selectedId]);

  // Manejadores explícitos por botón para evitar comportamientos cíclicos o rebotes inesperados
  const handleSelectSource = (source) => {
    if (disabled || loading || activeSource === source) return;
    setActiveSource(source);
  };

  return (
    <div className="flex items-center bg-[#F3F2F1] border border-[#D2D2D2] rounded-sm p-0.5 select-none gap-0.5 transition-all">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => handleSelectSource('submissions')}
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
        onClick={() => handleSelectSource('original')}
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