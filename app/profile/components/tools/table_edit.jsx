import React, { useEffect, useState } from 'react';
// Importamos el cliente de Supabase desde tu archivo de configuración
import { supabase } from '../lib/supabaseClient'; 

export default function DataViewer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawRows, setRawRows] = useState([]);
  const [activeSlot, setActiveSlot] = useState(1); // Controla el slot activo (1 al 8)

  // 1. Cargar los datos de la tabla al montar el componente
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Traemos solo las columnas de metadatos básicas y los slots de datos
        const { data, error: sbError } = await supabase
          .from('client_original')
          .select('id, company_name, data_slot_1, data_slot_2, data_slot_3, data_slot_4, data_slot_5, data_slot_6, data_slot_7, data_slot_8')
          .order('id', { ascending: false });

        if (sbError) throw sbError;

        setRawRows(data || []);
      } catch (err) {
        console.error('Error cargando client_original:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 2. Procesar los datos del Slot Activo para la visualización tipo CSV
  const getActiveSlotData = () => {
    const slotKey = `data_slot_${activeSlot}`;
    
    // Filtramos las filas que realmente contienen un JSON en el slot seleccionado
    const validDataInSlot = rawRows
      .map(row => ({
        rowId: row.id,
        companyName: row.company_name,
        slotContent: row[slotKey]
      }))
      .filter(item => item.slotContent !== null && item.slotContent !== undefined);

    if (validDataInSlot.length === 0) return { headers: [], rows: [] };

    // Extraer dinámicamente las cabeceras (headers) basándonos en las llaves del primer objeto encontrado
    // Soporta tanto si el slot es un objeto directo {} como si es un array de objetos [{}]
    let sampleObject = {};
    if (Array.isArray(validDataInSlot[0].slotContent)) {
      sampleObject = validDataInSlot[0].slotContent[0] || {};
    } else {
      sampleObject = validDataInSlot[0].slotContent;
    }

    const jsonHeaders = Object.keys(sampleObject);

    // Formatear las filas para la tabla interna
    const formattedRows = [];
    validDataInSlot.forEach(item => {
      if (Array.isArray(item.slotContent)) {
        // Si el JSONB es una lista de registros, los aplanamos manteniendo la referencia de la empresa
        item.slotContent.forEach((subRow) => {
          formattedRows.push({
            _metadata: { id: item.rowId, company: item.companyName },
            ...subRow
          });
        });
      } else {
        // Si es un objeto único
        formattedRows.push({
          _metadata: { id: item.rowId, company: item.companyName },
          ...item.slotContent
        });
      }
    });

    return { headers: jsonHeaders, rows: formattedRows };
  };

  const { headers, rows } = getActiveSlotData();

  if (loading) return <div style={styles.loading}>Cargando pipelines y slots de datos...</div>;
  if (error) return <div style={styles.error}>❌ Error: {error}</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Visor de Datos Estructurados — SERVEX_AI</h2>
        <p>Selecciona un Slot de almacenamiento para visualizar el dataset procesado.</p>
      </header>

      {/* Menú Superior de Navegación entre Slots */}
      <nav style={styles.tabNav}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((slotNum) => (
          <button
            key={slotNum}
            onClick={() => setActiveSlot(slotNum)}
            style={{
              ...styles.tabButton,
              ...(activeSlot === slotNum ? styles.activeTabButton : {})
            }}
          >
            📊 Data Slot {slotNum}
          </button>
        ))}
      </nav>

      {/* Contenedor de la Tabla Estilo CSV */}
      <div style={styles.tableWrapper}>
        {rows.length === 0 ? (
          <div style={styles.noData}>
            No hay registros o payloads JSON válidos asignados a <strong>Data Slot {activeSlot}</strong>.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.metaTh}>ID Fila</th>
                <th style={styles.metaTh}>Cliente / Empresa</th>
                {headers.map((header) => (
                  <th key={header} style={styles.th}>{header.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} style={idx % 2 === 0 ? styles.evenRow : {}}>
                  <td style={styles.metaTd}>{row._metadata.id}</td>
                  <td style={styles.metaTd}><strong>{row._metadata.company || 'N/A'}</strong></td>
                  {headers.map((header) => {
                    const cellValue = row[header];
                    return (
                      <td key={header} style={styles.td}>
                        {typeof cellValue === 'object' ? JSON.stringify(cellValue) : String(cellValue ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Estilos rápidos e independientes (Inline Styles organizados para evitar dependencias externas)
const styles = {
  container: { padding: '24px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' },
  header: { marginBottom: '20px' },
  tabNav: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' },
  tabButton: { padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' },
  activeTabButton: { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' },
  tableWrapper: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  th: { padding: '12px 16px', backgroundColor: '#f3f4f6', color: '#374151', fontWeight: '600', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' },
  metaTh: { padding: '12px 16px', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '700', borderBottom: '2px solid #bfdbfe', whiteSpace: 'nowrap' },
  td: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', whiteSpace: 'nowrap' },
  metaTd: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc', color: '#1e293b' },
  evenRow: { backgroundColor: '#f9fafb' },
  noData: { padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '15px' },
  loading: { padding: '50px', textAlign: 'center', fontSize: '16px', color: '#4b5563' },
  error: { padding: '20px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', border: '1px solid #fee2e2', margin: '20px 0' }
};