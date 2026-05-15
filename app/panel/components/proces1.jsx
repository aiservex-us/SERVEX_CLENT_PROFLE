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
    <div className="w-full max-h-[80%] flex items-center justify-center bg-[#FFF] px-5 py-10 font-sans antialiased selection:bg-[#6B63B5]/20">
      <div className="w-full max-w-[850px]  animate-[fadeInUp_0.6s_ease-out]">
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-[#EBEBEB] px-10 py-12 backdrop-blur-md">
          
          {/* Header */}
          <div className="text-center mb-10 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6B63B5] to-[#8B7FB8] flex items-center justify-center text-white font-bold text-2xl shadow-[0_4px_12px_rgba(107,99,181,0.15)] tracking-tight">
                SVX
              </div>
            </div>
            <h1 className="text-[28px] font-bold text-[#242424] m-0 mb-2 tracking-[-0.5px]">
              Configura tu espacio de trabajo
            </h1>
            <p className="text-sm text-[#717171] m-0 line-height-[1.5]">
              Cuéntanos sobre tu organización para personalizar tu experiencia
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[0, 1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[13px] font-semibold transition-all duration-300 cursor-default
                    ${step === currentStep 
                      ? 'bg-[#6B63B5] text-white border-[#6B63B5] shadow-[0_0_0_4px_rgba(107,99,181,0.1)]' 
                      : step < currentStep 
                        ? 'bg-[#6B63B5] text-white border-[#6B63B5]' 
                        : 'bg-[#E8E8E8] text-[#999999] border-[#E8E8E8]'
                    }`}
                >
                  {step < currentStep ? '✓' : step + 1}
                </div>
                {step < 3 && <div className="w-4 h-[2px] bg-[#E8E8E8]" />}
              </React.Fragment>
            ))}
          </div>

          {/* Form */}
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            {/* Step 0: Company Identity */}
            {currentStep === 0 && (
              <div className="flex flex-col gap-8 animate-[slideIn_0.4s_ease-out]">
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-[#242424] m-0">Identidad Corporativa</h2>
                  <p className="text-sm text-[#717171] m-0 line-height-[1.5]">Ayúdanos a conocer tu organización</p>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#3C3C3C] uppercase tracking-[0.5px]">Nombre de la empresa</label>
                    <input
                      className="px-4 py-3 text-sm border border-[#D4D4D4] rounded-lg bg-white transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#6B63B5] focus:ring-3 focus:ring-[#6B63B5]/8"
                      type="text"
                      placeholder="ej: Tech Solutions Colombia"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#3C3C3C] uppercase tracking-[0.5px]">Actividad económica principal</label>
                    <input
                      className="px-4 py-3 text-sm border border-[#D4D4D4] rounded-lg bg-white transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#6B63B5] focus:ring-3 focus:ring-[#6B63B5]/8"
                      type="text"
                      placeholder="ej: Consultoría de software"
                      value={formData.activity}
                      onChange={(e) => setFormData({...formData, activity: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-8 py-[11px] text-sm font-semibold border-none rounded-lg bg-[#6B63B5] text-white transition-all duration-200 shadow-[0_2px_8px_rgba(107,99,181,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
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
              <div className="flex flex-col gap-8 animate-[slideIn_0.4s_ease-out]">
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-[#242424] m-0">Información de Contacto</h2>
                  <p className="text-sm text-[#717171] m-0 line-height-[1.5]">Dónde podemos comunicarnos contigo</p>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#3C3C3C] uppercase tracking-[0.5px]">Correo corporativo</label>
                    <input
                      className="px-4 py-3 text-sm border border-[#D4D4D4] rounded-lg bg-white transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#6B63B5] focus:ring-3 focus:ring-[#6B63B5]/8"
                      type="email"
                      placeholder="contacto@tuempresa.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#3C3C3C] uppercase tracking-[0.5px]">Teléfono de contacto</label>
                    <input
                      className="px-4 py-3 text-sm border border-[#D4D4D4] rounded-lg bg-white transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#6B63B5] focus:ring-3 focus:ring-[#6B63B5]/8"
                      type="tel"
                      placeholder="+57 (1) 234-5678"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-6 py-[11px] text-sm font-semibold border border-[#D4D4D4] rounded-lg bg-white text-[#3C3C3C] cursor-pointer transition-all duration-200"
                    onClick={() => setCurrentStep(0)}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="px-8 py-[11px] text-sm font-semibold border-none rounded-lg bg-[#6B63B5] text-white transition-all duration-200 shadow-[0_2px_8px_rgba(107,99,181,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
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
              <div className="flex flex-col gap-8 animate-[slideIn_0.4s_ease-out]">
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-[#242424] m-0">Localización</h2>
                  <p className="text-sm text-[#717171] m-0 line-height-[1.5]">Dónde opera tu organización</p>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#3C3C3C] uppercase tracking-[0.5px]">País</label>
                    <input
                      className="px-4 py-3 text-sm border border-[#D4D4D4] rounded-lg bg-white transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#6B63B5] focus:ring-3 focus:ring-[#6B63B5]/8"
                      type="text"
                      placeholder="ej: Colombia"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#3C3C3C] uppercase tracking-[0.5px]">Ciudad principal</label>
                    <input
                      className="px-4 py-3 text-sm border border-[#D4D4D4] rounded-lg bg-white transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#6B63B5] focus:ring-3 focus:ring-[#6B63B5]/8"
                      type="text"
                      placeholder="ej: Bogotá"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-6 py-[11px] text-sm font-semibold border border-[#D4D4D4] rounded-lg bg-white text-[#3C3C3C] cursor-pointer transition-all duration-200"
                    onClick={() => setCurrentStep(1)}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="px-8 py-[11px] text-sm font-semibold border-none rounded-lg bg-[#6B63B5] text-white transition-all duration-200 shadow-[0_2px_8px_rgba(107,99,181,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
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
              <div className="flex flex-col gap-8 animate-[slideIn_0.4s_ease-out]">
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-[#242424] m-0">Tu Primer Activo de Datos</h2>
                  <p className="text-sm text-[#717171] m-0 line-height-[1.5]">Carga tu archivo maestro para inicializar SVX</p>
                  
                  <div className={`relative border-2 dashed rounded-xl px-6 py-10 text-center transition-all duration-300
                    ${fileStatus === 'success' 
                      ? 'border-[#52C41A] bg-[#F6FFED]' 
                      : fileStatus === 'error' 
                        ? 'border-[#FF4D4F] bg-[#FFF1F0]' 
                        : 'border-[#D4D4D4] bg-[#FAFAFA]'
                    }`}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="absolute w-full h-full top-0 left-0 opacity-0 cursor-pointer"
                    />
                    <label htmlFor="file-upload" className="flex flex-col items-center gap-3 cursor-pointer select-none">
                      <div className="text-3xl font-bold text-[#6B63B5] animate-[fadeInUp_0.3s_ease-out]">
                        {fileStatus === 'success' ? '✓' : fileStatus === 'loading' ? '⟳' : '↓'}
                      </div>
                      <div className="flex flex-col gap-1">
                        {fileStatus === 'success' && (
                          <>
                            <div className="text-[15px] font-semibold text-[#242424]">Archivo cargado correctamente</div>
                            <div className="text-12px text-[#999999]">Listo para procesar</div>
                          </>
                        )}
                        {fileStatus === 'loading' && (
                          <>
                            <div className="text-[15px] font-semibold text-[#242424]">Procesando tu archivo...</div>
                            <div className="text-12px text-[#999999]">Por favor espera</div>
                          </>
                        )}
                        {fileStatus === 'pending' && (
                          <>
                            <div className="text-[15px] font-semibold text-[#242424]">Arrastra o selecciona tu archivo</div>
                            <div className="text-12px text-[#999999]">Formatos: Excel (.xlsx, .xls) o CSV</div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-3 bg-[#F5F5F5] rounded-lg text-xs text-[#717171] line-height-[1.5]">
                    <span className="text-sm shrink-0">ℹ️</span>
                    <span>Tu archivo será encriptado y almacenado de forma segura en nuestros servidores</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-6 py-[11px] text-sm font-semibold border border-[#D4D4D4] rounded-lg bg-white text-[#3C3C3C] cursor-pointer transition-all duration-200"
                    onClick={() => setCurrentStep(2)}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className={`px-8 py-[11px] text-sm font-semibold border-none rounded-lg bg-[#6B63B5] text-white transition-all duration-200 shadow-[0_2px_8px_rgba(107,99,181,0.2)]
                      ${isSubmitting ? 'opacity-80' : ''}
                      ${(!isStepComplete(3) || isSubmitting) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={!isStepComplete(3) || isSubmitting}
                  >
                    {isSubmitting ? 'Sincronizando...' : 'Completar Setup'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer Help */}
          <div className="mt-8 pt-6 border-t border-[#EBEBEB] text-center">
            <p className="text-xs text-[#999999] m-0">
              ¿Necesitas ayuda? <a href="#support" className="text-[#6B63B5] no-underline font-semibold transition-colors duration-200 hover:text-[#5750A0]">Contacta nuestro equipo</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SVXTeamsOnboarding;