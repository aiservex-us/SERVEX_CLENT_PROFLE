'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient'; // Ajusta la ruta según tu estructura

export default function FileSlotsManager() {
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserSlots() {
      try {
        setLoading(true);
        
        // 1. Obtener la sesión del usuario actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) {
          setError('No se encontró una sesión activa.');
          setLoading(false);
          return;
        }

        // 2. Consultar la tabla filtrando por el user_id del usuario autenticado
        const { data, error: dbError } = await supabase
          .from('client_submissions')
          .select('*')
          .eq('user_id', session.user.id)
          .single(); // Asumiendo un registro único de configuración/perfil por usuario

        if (dbError && dbError.code !== 'PGRST116') { 
          // PGRST116 significa que no encontró registros, lo cual es un escenario válido al inicio
          throw dbError;
        }

        if (data) {
          setSubmissionData(data);
          
          // 3. Mapear e identificar cuáles slots contienen archivos válidos
          // Asumimos que tu JSONB guarda una estructura como: { fileName: 'archivo.csv', rowCount: 150, uploadedAt: '...' }
          const slots = [
            { key: 'data_slot_1', label: 'Data Slot 1', data: data.data_slot_1 },
            { key: 'data_slot_2', label: 'Data Slot 2', data: data.data_slot_2 },
            { key: 'data_slot_3', label: 'Data Slot 3', data: data.data_slot_3 },
            { key: 'data_slot_4', label: 'Data Slot 4', data: data.data_slot_4 },
            { key: 'data_slot_5', label: 'Data Slot 5', data: data.data_slot_5 },
            { key: 'data_slot_6', label: 'Data Slot 6', data: data.data_slot_6 },
            { key: 'data_slot_8', label: 'Data Slot 8', data: data.data_slot_8 }, // Nota: saltaste el 7 en tu DDL
          ];

          // Filtrar solo los slots que no estén vacíos (null)
          const activeFiles = slots.filter(slot => slot.data !== null);
          setAvailableFiles(activeFiles);
        }
      } catch (err) {
        console.error('Error cargando slots de datos:', err);
        setError('Error al conectar con el motor de ingesta de datos.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserSlots();
  }, []);

  // Acción simulada para procesar o inspeccionar el CSV/JSON del slot
  const handleInspectSlot = (slotKey, slotContent) => {
    console.log(`Abriendo visor para el slot: ${slotKey}`, slotContent);
    // Aquí puedes disparar la lógica para cargar el visor del dataset
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-[#f3f2f1] rounded-lg border border-[#e0e0e0]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0078d4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#323130] font-medium">Sincronizando con SVX Command Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[#fde7e9] border-l-4 border-[#a80000] text-[#a80000] rounded-r text-sm font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-[#f3f2f1] rounded-xl border border-[#e0e0e0] shadow-sm font-sans">
      {/* Header corporativo */}
      <div className="mb-6 pb-4 border-b border-[#e0e0e0]">
        <h2 className="text-xl font-semibold text-[#323130] tracking-tight">
          {submissionData?.company_name || 'Panel Corporativo'}
        </h2>
        <p className="text-xs text-[#605e5c] mt-1">
          Infraestructura de Ingesta Masiva • Gestión de Catálogos e Inventarios Activos
        </p>
      </div>

      {availableFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-[#e0e0e0] text-center">
          <span className="text-3xl mb-2">📁</span>
          <h3 className="text-sm font-semibold text-[#323130]">No hay sets de datos activos</h3>
          <p className="text-xs text-[#605e5c] max-w-sm mt-1">
            Todos los data slots asignados están vacíos. Sube un archivo CSV o XML para inicializar el motor.
          </p>
        </div>
      ) : (
        /* Grid de slots disponibles con estética limpia y profesional */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableFiles.map((slot) => {
            // Asignación segura de variables asumiendo que guardas metadata básica en el jsonb
            const fileName = slot.data.fileName || 'Dataset Técnico Estructurado';
            const rowCount = slot.data.rows || slot.data.rowCount || 'N/A';
            const uploadDate = slot.data.uploadedAt ? new Date(slot.data.uploadedAt).toLocaleDateString() : 'Reciente';

            return (
              <div 
                key={slot.key}
                className="group relative flex flex-col justify-between p-4 bg-white hover:bg-[#faf9f8] border border-[#e0e0e0] hover:border-[#0078d4] rounded-lg shadow-sm transition-all duration-200"
              >
                <div>
                  {/* Badge de Identificación del Slot */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#0078d4] bg-[#eff6fc] rounded-full uppercase">
                      {slot.label}
                    </span>
                    <span className="text-[11px] text-[#a19f9d]">{uploadDate}</span>
                  </div>

                  {/* Detalles del archivo */}
                  <h4 className="text-sm font-semibold text-[#323130] line-clamp-1 mb-1 group-hover:text-[#0078d4] transition-colors">
                    {fileName}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#605e5c]">
                    <span className="flex items-center gap-1">
                      📊 <strong>Registros:</strong> {rowCount}
                    </span>
                  </div>
                </div>

                {/* Acciones del Slot */}
                <div className="mt-5 pt-3 border-t border-[#f3f2f1] flex justify-end">
                  <button
                    onClick={() => handleInspectSlot(slot.key, slot.data)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] rounded-md transition-colors shadow-sm"
                  >
                    Examinar Data
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}