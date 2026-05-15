'use client';

import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '../../lib/supabaseClient';
import { read, utils } from 'xlsx';

const SVXTeamsOnboarding = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileStatus, setFileStatus] = useState('pending');

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
    
    setFileStatus('loading');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = read(bstr, { type: 'binary' });
        const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        setFormData(prev => ({ ...prev, excelData: data }));
        setFileStatus('success');
      } catch (err) {
        setFileStatus('error');
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

    if (!error) {
      setShowForm(false);
    } else {
      alert('Error: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const isStepComplete = (step) => {
    switch(step) {
      case 0: return formData.companyName && formData.activity;
      case 1: return formData.contactEmail && formData.contactPhone;
      case 2: return formData.country && formData.city;
      case 3: return formData.excelData !== null;
      default: return false;
    }
  };

  if (loading || !showForm) return null;

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        input:focus {
          outline: none !important;
          border-color: #6B63B5 !important;
          box-shadow: 0 0 0 3px rgba(107, 99, 181, 0.08) !important;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.formCard}>
          {/* Header */}
          <div style={styles.headerSection}>
            <div style={styles.logoContainer}>
              <div style={styles.logoPlaceholder}>SVX</div>
            </div>
            <h1 style={styles.title}>Configura tu espacio de trabajo</h1>
            <p style={styles.subtitle}>Cuéntanos sobre tu organización para personalizar tu experiencia</p>
          </div>

          {/* Progress Indicator */}
          <div style={styles.progressContainer}>
            {[0, 1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  style={{
                    ...styles.progressDot,
                    ...(step === currentStep ? styles.progressDotActive : {}),
                    ...(step < currentStep ? styles.progressDotComplete : {})
                  }}
                >
                  {step < currentStep ? '✓' : step + 1}
                </div>
                {step < 3 && <div style={styles.progressLine} />}
              </React.Fragment>
            ))}
          </div>

          {/* Form */}
          <form style={styles.form} onSubmit={handleSubmit}>
            {/* Step 0: Company Identity */}
            {currentStep === 0 && (
              <div style={styles.stepContainer}>
                <div style={styles.stepContent}>
                  <h2 style={styles.stepTitle}>Identidad Corporativa</h2>
                  <p style={styles.stepDescription}>Ayúdanos a conocer tu organización</p>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nombre de la empresa</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="ej: Tech Solutions Colombia"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Actividad económica principal</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="ej: Consultoría de software"
                      value={formData.activity}
                      onChange={(e) => setFormData({...formData, activity: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div style={styles.navigationButtons}>
                  <button
                    type="button"
                    style={styles.buttonNext}
                    onClick={() => setCurrentStep(1)}
                    disabled={!isStepComplete(0)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Contact */}
            {currentStep === 1 && (
              <div style={styles.stepContainer}>
                <div style={styles.stepContent}>
                  <h2 style={styles.stepTitle}>Información de Contacto</h2>
                  <p style={styles.stepDescription}>Dónde podemos comunicarnos contigo</p>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Correo corporativo</label>
                    <input
                      style={styles.input}
                      type="email"
                      placeholder="contacto@tuempresa.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Teléfono de contacto</label>
                    <input
                      style={styles.input}
                      type="tel"
                      placeholder="+57 (1) 234-5678"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div style={styles.navigationButtons}>
                  <button
                    type="button"
                    style={styles.buttonBack}
                    onClick={() => setCurrentStep(0)}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    style={styles.buttonNext}
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStepComplete(1)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div style={styles.stepContainer}>
                <div style={styles.stepContent}>
                  <h2 style={styles.stepTitle}>Localización</h2>
                  <p style={styles.stepDescription}>Dónde opera tu organización</p>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>País</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="ej: Colombia"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Ciudad principal</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="ej: Bogotá"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div style={styles.navigationButtons}>
                  <button
                    type="button"
                    style={styles.buttonBack}
                    onClick={() => setCurrentStep(1)}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    style={styles.buttonNext}
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStepComplete(2)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Data Upload */}
            {currentStep === 3 && (
              <div style={styles.stepContainer}>
                <div style={styles.stepContent}>
                  <h2 style={styles.stepTitle}>Tu Primer Activo de Datos</h2>
                  <p style={styles.stepDescription}>Carga tu archivo maestro para inicializar SVX</p>
                  
                  <div style={{
                    ...styles.uploadZone,
                    ...(fileStatus === 'success' ? styles.uploadZoneSuccess : {}),
                    ...(fileStatus === 'error' ? styles.uploadZoneError : {})
                  }}>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      style={styles.fileInput}
                    />
                    <label htmlFor="file-upload" style={styles.uploadLabel}>
                      <div style={styles.uploadIcon}>
                        {fileStatus === 'success' ? '✓' : fileStatus === 'loading' ? '⟳' : '↓'}
                      </div>
                      <div style={styles.uploadText}>
                        {fileStatus === 'success' && (
                          <>
                            <div style={styles.uploadMain}>Archivo cargado correctamente</div>
                            <div style={styles.uploadSmall}>Listo para procesar</div>
                          </>
                        )}
                        {fileStatus === 'loading' && (
                          <>
                            <div style={styles.uploadMain}>Procesando tu archivo...</div>
                            <div style={styles.uploadSmall}>Por favor espera</div>
                          </>
                        )}
                        {fileStatus === 'pending' && (
                          <>
                            <div style={styles.uploadMain}>Arrastra o selecciona tu archivo</div>
                            <div style={styles.uploadSmall}>Formatos: Excel (.xlsx, .xls) o CSV</div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div style={styles.uploadHint}>
                    <span style={styles.hintIcon}>ℹ️</span>
                    <span>Tu archivo será encriptado y almacenado de forma segura en nuestros servidores</span>
                  </div>
                </div>

                <div style={styles.navigationButtons}>
                  <button
                    type="button"
                    style={styles.buttonBack}
                    onClick={() => setCurrentStep(2)}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.buttonNext,
                      ...(isSubmitting ? styles.buttonSubmitting : {}),
                      opacity: !isStepComplete(3) || isSubmitting ? 0.6 : 1,
                      cursor: (!isStepComplete(3) || isSubmitting) ? 'not-allowed' : 'pointer'
                    }}
                    disabled={!isStepComplete(3) || isSubmitting}
                  >
                    {isSubmitting ? 'Sincronizando...' : 'Completar Setup'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer Help */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              ¿Necesitas ayuda? <a href="#support" style={styles.footerLink}>Contacta nuestro equipo</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FAFAFA',
    padding: '40px 20px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  },
  
  container: {
    width: '100%',
    maxWidth: '520px',
    animation: 'fadeInUp 0.6s ease-out'
  },

  formCard: {
    background: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)',
    border: '1px solid #EBEBEB',
    padding: '48px 40px',
    backdropFilter: 'blur(20px)'
  },

  headerSection: {
    textAlign: 'center',
    marginBottom: '40px',
    animation: 'fadeInUp 0.6s ease-out 0.1s both'
  },

  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px'
  },

  logoPlaceholder: {
    width: '56px',
    height: '56px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6B63B5 0%, #8B7FB8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '24px',
    fontFamily: '"Outfit", sans-serif',
    boxShadow: '0 4px 12px rgba(107, 99, 181, 0.15)'
  },

  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#242424',
    margin: '0 0 8px 0',
    fontFamily: '"Outfit", sans-serif',
    letterSpacing: '-0.5px'
  },

  subtitle: {
    fontSize: '14px',
    color: '#717171',
    margin: '0',
    lineHeight: '1.5'
  },

  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '48px'
  },

  progressDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#E8E8E8',
    border: '2px solid #E8E8E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#999999',
    transition: 'all 0.3s ease',
    cursor: 'default'
  },

  progressDotActive: {
    background: '#6B63B5',
    color: '#FFFFFF',
    border: '2px solid #6B63B5',
    boxShadow: '0 0 0 4px rgba(107, 99, 181, 0.1)'
  },

  progressDotComplete: {
    background: '#6B63B5',
    color: '#FFFFFF',
    border: '2px solid #6B63B5'
  },

  progressLine: {
    width: '16px',
    height: '2px',
    background: '#E8E8E8',
    margin: '0 0px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },

  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animation: 'slideIn 0.4s ease-out'
  },

  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },

  stepTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#242424',
    margin: '0',
    fontFamily: '"Outfit", sans-serif'
  },

  stepDescription: {
    fontSize: '14px',
    color: '#717171',
    margin: '0',
    lineHeight: '1.5'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#3C3C3C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  input: {
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #D4D4D4',
    borderRadius: '8px',
    background: '#FFFFFF',
    fontFamily: '"Inter", sans-serif',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
  },

  uploadZone: {
    position: 'relative',
    border: '2px dashed #D4D4D4',
    borderRadius: '10px',
    padding: '40px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#FAFAFA'
  },

  uploadZoneSuccess: {
    borderColor: '#52C41A',
    background: '#F6FFED'
  },

  uploadZoneError: {
    borderColor: '#FF4D4F',
    background: '#FFF1F0'
  },

  fileInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    opacity: '0',
    cursor: 'pointer'
  },

  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none'
  },

  uploadIcon: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#6B63B5',
    animation: 'fadeInUp 0.3s ease-out'
  },

  uploadText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  uploadMain: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#242424'
  },

  uploadSmall: {
    fontSize: '12px',
    color: '#999999'
  },

  uploadHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#F5F5F5',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#717171',
    lineHeight: '1.5'
  },

  hintIcon: {
    fontSize: '14px',
    flexShrink: 0
  },

  navigationButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },

  buttonBack: {
    padding: '11px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #D4D4D4',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#3C3C3C',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif'
  },

  buttonNext: {
    padding: '11px 32px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: '#6B63B5',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif',
    boxShadow: '0 2px 8px rgba(107, 99, 181, 0.2)'
  },

  buttonSubmitting: {
    opacity: '0.8'
  },

  footer: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #EBEBEB',
    textAlign: 'center'
  },

  footerText: {
    fontSize: '12px',
    color: '#999999',
    margin: '0'
  },

  footerLink: {
    color: '#6B63B5',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease'
  }
};

export default SVXTeamsOnboarding;
