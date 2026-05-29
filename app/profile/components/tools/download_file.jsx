import React, { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function LesroPricingManager({ selectedId, rowsToSave }) {
  const [isSaving, setIsSaving] = useState(false);

  // 1. Cabeceras exactas basadas en la estructura del archivo original
  const CSV_HEADERS = [
    'ID', 'Price Guide Sequence', 'Product Line', 'Product Name', 
    'Price (Non UPH Products)', 'Price Grade 02', 'Price Grade 03', 'Price Grade 04', 
    'Price Grade 05', 'Price Grade 06', 'Price Grade 07', 'Price Grade 08', 
    'Price Grade 09', 'Price Grade 10', 'Price Grade 11', 'Price Grade 12', 
    'Price Grade 13', 'Price Optional Armpad or Armcap - Polyurethane', 
    'Price Optional Armcap - Polyurethane', 'Price Optional ArmPAD - Polyurethane', 
    'Price Optional Armpad or Armcap - Solid Surface', 'Price Optional Armcap - Solid Surface', 
    'Price Optional ArmPAD - Solid Surface', 'Price Optional Casters', 
    'Price Optional Swivel Tablet', 'Price Optional Chrome Finish', 
    'Price Optional Ganging Brackets', 'Price Optional Power Unit', 
    'Price Optional Bevel Edge', 'Price Optional Shelf', 'Country of Origin'
  ];

  // 2. Función para exportar a CSV respetando la composición exacta
  const exportToCSV = (data) => {
    if (!data || data.length === 0) {
      alert('No hay datos disponibles para exportar.');
      return;
    }

    // Construir las líneas del CSV separadas por punto y coma (;)
    const csvRows = [];
    
    // Insertar cabecera original
    csvRows.push(CSV_HEADERS.join(';'));

    // Insertar el contenido mapeando cada propiedad de manera limpia
    data.forEach(row => {
      const values = CSV_HEADERS.map(header => {
        // Asegurar que si el valor es null o undefined se exporte vacío
        const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
        // Si el valor contiene punto y coma, comillas o saltos de línea, lo envolvemos en comillas
        const escaped = ('' + val).replace(/"/g, '""');
        return /[";\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(';'));
    });

    const csvContent = csvRows.join('\r\n');

    // Forzar codificación UTF-8 con BOM para asegurar compatibilidad total en Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Generar nombre aleatorio requerido: LESRO_PRICING_aleatorio.csv
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const fileName = `LESRO_PRICING_${randomNumber}.csv`;

    // Crear el link de descarga en el DOM y dispararlo
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

  // 3. Función de guardado en Supabase manteniendo tu lógica intacta
  const handleSaveAndDownload = async () => {
    setIsSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('client_submissions')
        .update({
          data_slot_1: rowsToSave, 
          data_slot_2: null,       
          data_slot_3: null,
          data_slot_4: null,
          data_slot_5: null,
          data_slot_6: null,
          data_slot_8: null,
        })
        .eq('id', selectedId);

      if (updateError) {
        throw updateError;
      }

      // Una vez confirmado el guardado en base de datos, ejecuta la descarga
      exportToCSV(rowsToSave);

    } catch (error) {
      console.error('Error al procesar la operación:', error.message);
      alert('Ocurrió un error al guardar los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4 backend-sync-container">
      <button
        onClick={handleSaveAndDownload}
        disabled={isSaving || !selectedId}
        className={`px-4 py-2 rounded text-white font-medium transition-colors ${
          isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSaving ? 'Procesando...' : 'Guardar y Descargar CSV'}
      </button>
    </div>
  );
}