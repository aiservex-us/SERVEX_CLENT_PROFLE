'use client';

import React, { useState, useEffect } from 'react';
import { supabaseGoogle } from '../../lib/supabaseClient';
import { read, utils } from 'xlsx';

const SVXTeamsOnboarding = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  if (loading || !showForm) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg mb-6">
            <span className="text-2xl font-bold text-white">SVX</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Configura tu espacio de trabajo
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-xl mx-auto">
            Cuéntanos sobre tu organización para personalizar tu experiencia con SVX Command
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 space-y-8 animate-fade-in animation-delay-100"
        >
          {/* Section 1: Company Identity */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Identidad Corporativa</h2>
              <p className="text-sm text-slate-500">Ayúdanos a conocer tu organización</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nombre de la empresa
                </label>
                <input
                  type="text"
                  placeholder="ej: Tech Solutions Colombia"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Actividad económica principal
                </label>
                <input
                  type="text"
                  placeholder="ej: Consultoría de software"
                  value={formData.activity}
                  onChange={(e) => setFormData({...formData, activity: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Section 2: Contact */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Información de Contacto</h2>
              <p className="text-sm text-slate-500">Dónde podemos comunicarnos contigo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Correo corporativo
                </label>
                <input
                  type="email"
                  placeholder="contacto@tuempresa.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  placeholder="+57 (1) 234-5678"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Section 3: Location */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Localización</h2>
              <p className="text-sm text-slate-500">Dónde opera tu organización</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  País
                </label>
                <input
                  type="text"
                  placeholder="ej: Colombia"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Ciudad principal
                </label>
                <input
                  type="text"
                  placeholder="ej: Bogotá"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Section 4: Data Upload */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Tu Primer Activo de Datos</h2>
              <p className="text-sm text-slate-500">Carga tu archivo maestro para inicializar SVX</p>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                fileStatus === 'success'
                  ? 'border-emerald-400 bg-emerald-50'
                  : fileStatus === 'error'
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300 bg-slate-50 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <label htmlFor="file-upload" className="flex flex-col items-center gap-3 cursor-pointer">
                <div
                  className={`text-3xl font-semibold transition-all duration-300 ${
                    fileStatus === 'success'
                      ? 'text-emerald-600'
                      : fileStatus === 'error'
                      ? 'text-red-600'
                      : 'text-purple-600'
                  }`}
                >
                  {fileStatus === 'success' && '✓'}
                  {fileStatus === 'error' && '✕'}
                  {fileStatus === 'loading' && '↻'}
                  {fileStatus === 'pending' && '↓'}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {fileStatus === 'success' && 'Archivo cargado correctamente'}
                    {fileStatus === 'error' && 'Error al procesar el archivo'}
                    {fileStatus === 'loading' && 'Procesando tu archivo...'}
                    {fileStatus === 'pending' && 'Arrastra o selecciona tu archivo'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {fileStatus === 'success' && 'Listo para procesar'}
                    {fileStatus === 'error' && 'Intenta con otro archivo'}
                    {fileStatus === 'loading' && 'Por favor espera'}
                    {fileStatus === 'pending' && 'Formatos: Excel (.xlsx, .xls) o CSV'}
                  </div>
                </div>
              </label>
            </div>

            {/* Security Hint */}
            <div className="flex gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-base flex-shrink-0">🔒</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tu archivo será encriptado y almacenado de forma segura en nuestros servidores siguiendo estándares de seguridad empresariales
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={
                !formData.companyName ||
                !formData.activity ||
                !formData.contactEmail ||
                !formData.contactPhone ||
                !formData.country ||
                !formData.city ||
                !formData.excelData ||
                isSubmitting
              }
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              {isSubmitting ? 'Sincronizando con la nube...' : 'Completar Setup'}
            </button>
          </div>

          {/* Footer Help */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              ¿Necesitas ayuda?{' '}
              <a href="#support" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                Contacta nuestro equipo
              </a>
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        /* Smooth icon rotation for loading */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SVXTeamsOnboarding;
