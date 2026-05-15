import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '../../lib/supabaseClient';
import { read, utils } from 'xlsx'; // Importación optimizada para Next.js

const SVXTeamsOnboarding = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados del Formulario
  const [formData, setFormData] = useState({
    companyName: '',
    activity: '',
    excelData: null
  });

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const { data: { user: authUser } } = await supabaseGoogle.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        
        // Validamos si el correo ya tiene información registrada
        const { data, error } = await supabaseGoogle
          .from('client_submissions')
          .select('company_name, business_activity')
          .eq('user_id', authUser.id)
          .maybeSingle(); 

        // Si no hay datos, o faltan campos clave, activamos el formulario
        if (error || !data || !data.company_name) {
          setShowForm(true);
        } else {
          // Si hay datos, NO mostramos el formulario (se queda en false)
          setShowForm(false);
        }
      }
    } catch (err) {
      console.error("Error validando sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = utils.sheet_to_json(ws);
        
        setFormData(prev => ({ ...prev, excelData: data }));
      } catch (err) {
        alert("Error al procesar el archivo Excel. Asegúrate de que sea un formato válido.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.excelData) {
      alert("Por favor, carga un archivo Excel o CSV válido.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabaseGoogle
      .from('client_submissions')
      .insert([
        {
          user_id: user.id,
          company_name: formData.companyName,
          business_activity: formData.activity,
          data_slot_1: formData.excelData, 
          created_at: new Date().toISOString()
        }
      ]);

    if (!error) {
      // Al guardar con éxito, ocultamos el formulario para que el componente "desaparezca"
      setShowForm(false);
    } else {
      console.error("Error Supabase:", error);
      alert('Error al guardar: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Mientras carga la validación, no mostramos nada o un pequeño indicador
  if (loading) return null;

  // CAMBIO SOLICITADO: Si NO se debe mostrar el formulario, el componente no renderiza nada (desaparece)
  if (!showForm) return null;

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.headerIndicator} />
        <h2 style={styles.title}>Configuración Inicial</h2>
        <p style={styles.subtitle}>No hemos encontrado registros para este usuario. Por favor, completa los datos de la empresa para habilitar el panel.</p>

        <div style={styles.field}>
          <label style={styles.label}>Nombre de la Empresa</label>
          <input 
            style={styles.input} 
            type="text" 
            placeholder="Nombre oficial" 
            required
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Actividad de Negocio</label>
          <input 
            style={styles.input} 
            type="text" 
            placeholder="Ej: Distribución de repuestos" 
            required
            value={formData.activity}
            onChange={(e) => setFormData({...formData, activity: e.target.value})}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Cargar Archivo Maestro (Excel/CSV)</label>
          <div style={styles.fileContainer}>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              required
              onChange={handleFileUpload}
            />
            {formData.excelData && <p style={styles.successText}>✓ Archivo procesado correctamente</p>}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={isSubmitting ? styles.buttonDisabled : styles.button}
        >
          {isSubmitting ? 'Guardando en SVX...' : 'Guardar y Continuar'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'transparent', // Se vuelve transparente para no tapar el fondo del panel
    fontFamily: '"Segoe UI", "Selawik", sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '480px',
    position: 'relative'
  },
  headerIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: '#5B5FC7',
    borderRadius: '4px 4px 0 0'
  },
  title: {
    color: '#242424',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#616161',
    fontSize: '13px',
    lineHeight: '1.4',
    marginBottom: '24px'
  },
  field: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#242424',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #D1D1D1',
    borderRadius: '2px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  fileContainer: {
    marginTop: '5px',
    padding: '15px',
    border: '1px dashed #C8C8C8',
    backgroundColor: '#FAF9F8',
    textAlign: 'center'
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#5B5FC7',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px'
  },
  buttonDisabled: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#EDEBE9',
    color: '#A1A1A1',
    border: 'none',
    borderRadius: '2px',
    cursor: 'not-allowed'
  },
  successText: {
    color: '#107C10',
    fontSize: '11px',
    marginTop: '8px',
    fontWeight: '600'
  }
};

export default SVXTeamsOnboarding;