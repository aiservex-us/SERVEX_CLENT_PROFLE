import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '../../lib/supabaseClient';
import { read, utils } from 'xlsx';

const SVXTeamsOnboarding = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    activity: '',
    contactPhone: '',
    contactEmail: '',
    country: '',
    city: '',
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
        const { data, error } = await supabaseGoogle
          .from('client_submissions')
          .select('company_name')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (error || !data || !data.company_name) {
          setShowForm(true);
        } else {
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
        const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        setFormData(prev => ({ ...prev, excelData: data }));
      } catch (err) {
        alert("Error al procesar el archivo. Intenta con un formato válido.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.excelData) {
      alert("Por favor, carga tu archivo maestro para continuar.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabaseGoogle
      .from('client_submissions')
      .insert([{
        user_id: user.id,
        company_name: formData.companyName,
        business_activity: formData.activity,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        country: formData.country,
        city: formData.city,
        data_slot_1: formData.excelData,
        created_at: new Date().toISOString()
      }]);

    if (!error) setShowForm(false);
    else alert('Error: ' + error.message);
    setIsSubmitting(false);
  };

  if (loading || !showForm) return null;

  return (
    <div style={styles.viewport}>
      <div style={styles.glassCard}>
        <div style={styles.header}>
          <img src="/logo.png" alt="SVX Logo" style={styles.logo} />
          <h1 style={styles.mainTitle}>Bienvenido a la era de SVX Command</h1>
          <p style={styles.welcomeText}>
            Estás a un paso de automatizar tu futuro. Configura el perfil de tu organización y deja que nuestra ingeniería haga el resto por ti.
          </p>
        </div>

        <form style={styles.formFlow} onSubmit={handleSubmit}>
          <div style={styles.section}>
            <label style={styles.label}>Identidad Corporativa</label>
            <input 
              style={styles.input} 
              placeholder="Nombre de tu empresa" 
              required 
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            />
            <input 
              style={styles.input} 
              placeholder="Actividad económica principal" 
              required 
              onChange={(e) => setFormData({...formData, activity: e.target.value})}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Contacto Directo</label>
            <div style={styles.row}>
              <input 
                style={{...styles.input, flex: 2}} 
                type="email" 
                placeholder="Correo corporativo" 
                required 
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              />
              <input 
                style={{...styles.input, flex: 1}} 
                type="tel" 
                placeholder="Teléfono" 
                required 
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              />
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Localización</label>
            <div style={styles.row}>
              <input 
                style={styles.input} 
                placeholder="País" 
                required 
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
              <input 
                style={styles.input} 
                placeholder="Ciudad" 
                required 
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>

          <div style={styles.uploadSection}>
            <label style={styles.label}>Tu primer activo de datos</label>
            <p style={styles.smallInfo}>Sube tu archivo maestro (Excel/CSV) para inicializar el motor de SVX.</p>
            <div style={styles.fileDrop}>
              <input type="file" accept=".xlsx, .xls, .csv" required onChange={handleFileUpload} style={styles.fileInput} id="file-upload" />
              <label htmlFor="file-upload" style={styles.fileLabel}>
                {formData.excelData ? "✓ Datos listos para procesar" : "Arrastra o selecciona tu archivo aquí"}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={isSubmitting ? styles.btnDisabled : styles.btnActive}
          >
            {isSubmitting ? 'Sincronizando con la nube...' : 'Empezar ahora'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  viewport: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
    overflow: 'hidden'
  },
  glassCard: {
    width: '80%',
    maxWidth: '900px',
    maxHeight: '90vh',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logo: {
    width: '80px',
    marginBottom: '15px',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
  },
  mainTitle: {
    fontSize: '28px',
    color: '#242424',
    fontWeight: '700',
    margin: '0 0 10px 0',
    fontFamily: '"Segoe UI", sans-serif'
  },
  welcomeText: {
    fontSize: '16px',
    color: '#424242',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  formFlow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  row: {
    display: 'flex',
    gap: '15px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#5B5FC7',
    marginBottom: '5px'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #E1E1E1',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
    flex: 1
  },
  uploadSection: {
    backgroundColor: '#F3F2F1',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  smallInfo: {
    fontSize: '12px',
    color: '#616161',
    marginBottom: '10px'
  },
  fileDrop: {
    border: '2px dashed #5B5FC7',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.3s'
  },
  fileInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 0,
    cursor: 'pointer'
  },
  fileLabel: {
    fontSize: '14px',
    color: '#5B5FC7',
    fontWeight: '600'
  },
  btnActive: {
    padding: '16px',
    backgroundColor: '#5B5FC7',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s',
    boxShadow: '0 4px 14px rgba(91, 95, 199, 0.4)',
    marginTop: '10px'
  },
  btnDisabled: {
    padding: '16px',
    backgroundColor: '#C8C8C8',
    borderRadius: '8px',
    border: 'none',
    color: '#919191',
    cursor: 'not-allowed',
    marginTop: '10px'
  }
};

export default SVXTeamsOnboarding;