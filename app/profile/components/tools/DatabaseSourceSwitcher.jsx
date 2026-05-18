'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/**
 * DatabaseSourceSwitcher
 * Componente de control dual para conmutar el origen de datos de un cliente 
 * entre los esquemas de 'client_submissions' y 'client_original' utilizando el nombre de la empresa.
 *
 * @param {object} activeSubmission - Registro completo del cliente actualmente cargado en la matriz.
 * @param {function} onSourceDataFetched - Callback que devuelve las filas estructuradas y el origen actual al padre.
 * @param {boolean} disabled - Estado de bloqueo si el padre está editando o eliminando.
 */
export default function DatabaseSourceSwitcher({ activeSubmission, onSourceDataFetched, disabled }) {
  const [activeSource, setActiveSource] = useState('submissions'); // 'submissions' o 'original'
  const [loading, setLoading] = useState(false);

  // Cada vez que el padre cambie de cliente seleccionado de manera global, reiniciamos visualmente a submissions
  useEffect(() => {
    setActiveSource('submissions');
  }, [activeSubmission?.id]);

  // Efecto secundario encargado de realizar el fetch reactivo cuando cambia el origen de datos
  useEffect(() => {
    if (!activeSubmission) return;

    async function fetchSourceData() {
      // Si el usuario vuelve a 'submissions', podemos reinyectar directamente el registro del padre 
      // evitando llamadas innecesarias e intermitencias en la red
      if (activeSource === 'submissions') {
        if (onSourceDataFetched) {
          onSourceDataFetched({
            source: 'submissions',
            rawRecord: activeSubmission
          });
        }
        return;
      }

      try {
        setLoading(true);
        
        // Si el origen es 'original', buscamos de forma inteligente por 'company_name' para mitigar la disparidad de IDs
        const targetTable = 'client_original';
        
        if (!activeSubmission.company_name) {
          throw new Error("El registro seleccionado en Submissions no posee un 'company_name' para trazar el espejo en Original.");
        }

        const { data, error } = await supabase
          .from(targetTable)
          .select('*')
          .eq('company_name', activeSubmission.company_name)
          .order('created_at', { ascending: false })
          .maybeSingle(); // Mitiga el error 406 si existen duplicados o registros huérfanos

        if (error) throw error;

        if (!data) {
          throw new Error(`No se encontró ningún registro en public.${targetTable} con el nombre corporativo [${activeSubmission.company_name}].`);
        }

        // Si la consulta encuentra la fila por empresa, enviamos el payload con la estructura JSON de la tabla original
        if (onSourceDataFetched) {
          onSourceDataFetched({
            source: activeSource,
            rawRecord: data
          });
        }
      } catch (err) {
        console.error(`❌ Error recuperando información desde public.${activeSource}:`, err);
        alert(`Aviso de Origen: ${err.message}`);
        
        // Fallback de contingencia: revierte el estado visual para mantener la consistencia de la matriz
        setActiveSource('submissions');
      } finally {
        setLoading(false);
      }
    }

    fetchSourceData();
  }, [activeSource, activeSubmission]);

  // Manejador explícito con compuertas de seguridad
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