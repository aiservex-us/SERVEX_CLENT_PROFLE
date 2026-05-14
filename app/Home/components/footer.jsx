'use client'

import React from 'react'

const ServexModernFooter = () => {
  const services = [
    { label: '3D Visualization', href: 'https://servex-us.com/3d-visualization/' },
    { label: 'Product Configurator', href: 'https://servex-us.com/servex-online-product-configurator/' },
    { label: 'Design & Specification', href: 'https://servex-us.com/servex-design-specification/' },
    { label: 'Electronic Catalogs', href: 'https://servex-us.com/servex-design-specification/' },
    { label: 'CET Extensions', href: 'https://servex-us.com/servex-cet/' },
    { label: 'SketchUp', href: 'https://servex-us.com/servex-sketchup/' },
  ]

  const about = [
    { label: 'Meet our team', href: 'https://servex-us.com/meet-our-team/' },
    { label: 'Rendering Gallery', href: 'https://servex-us.com/3d-visualization/rendering-gallery/' },
    { label: 'Library', href: 'https://servex-us.com/library/' },
  ]

  const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Amex', 'Discover']

  return (
    <footer className="font-inter bg-white overflow-hidden border-t border-gray-100">
      
      {/* CONTACT SECTION - Más compacta */}
      <div className="bg-white border-b border-gray-50 px-6 py-8 md:px-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
            Heard enough? →
          </span>
        </div>
      </div>

      {/* MAIN FOOTER - Ajuste de grid y espaciado */}
      <div className="px-6 md:px-16 py-10 grid grid-cols-1 lg:grid-cols-[0.8fr_2fr] gap-10 border-b border-gray-100">

        {/* COMPANY - Texto reducido */}
        <div className="space-y-6">
          <div className="text-2xl font-black tracking-tighter text-gray-900">
            Servex
          </div>

          <div className="max-w-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 mb-1">Descripción</h4>
            <p className="text-xs leading-relaxed text-gray-500 font-light">
              Servex provides BIM Modeling, Electronic Catalog, and 3D Visualization
              solutions for manufacturers and distributors internationally.
            </p>
          </div>

          <div className="max-w-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 mb-1">
              Historia & Misión
            </h4>
            <p className="text-xs leading-relaxed text-gray-500 font-light">
              Since 2004, we’ve been adapting and growing to assist our clients
              to fulfill today’s digital demands.
            </p>
          </div>
        </div>

        {/* LINKS - Reducción de escala general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* SERVICES */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-900 relative pb-2">
              Servicios
              <span className="absolute left-0 bottom-0 w-6 h-[2px] rounded bg-gray-200" />
            </h3>

            {services.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-light text-gray-500 transition-all hover:text-black block w-fit"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* ABOUT */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-900 relative pb-2">
              About
              <span className="absolute left-0 bottom-0 w-6 h-[2px] rounded bg-gray-200" />
            </h3>

            {about.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-light text-gray-500 transition-all hover:text-black block w-fit"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 space-y-2">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                Métodos de Pago
              </h4>
              <div className="flex flex-wrap gap-1">
                {paymentMethods.map((m, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded border border-gray-100 bg-gray-50 text-gray-500"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-900 relative pb-2">
              Contact Us
              <span className="absolute left-0 bottom-0 w-6 h-[2px] rounded bg-gray-200" />
            </h3>

            <div className="space-y-2 text-[12px] text-gray-500 font-light">
              <div>
                <p className="font-semibold text-gray-900">Email: </p>
                <a href="mailto:servex@servex-us.com" className="hover:underline">
                  servex@servex-us.com
                </a>
              </div>

              <div>
                <p className="font-semibold text-gray-900">Teléfono:</p>
                <a href="tel:718-701-4709" className="hover:underline">
                  718-701-4709
                </a>
              </div>

              <div>
                <p className="font-semibold text-gray-900">Dirección:</p>
                <p className="leading-tight">
                  PO Box 657, Bedford, NY 10506
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR - Muy minimalista */}
      <div className="bg-white px-6 md:px-16 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-50">
        <a
          href="https://glynneai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium text-gray-400 hover:text-gray-900 uppercase tracking-wider"
        >
          © {new Date().getFullYear()} GLYNNE S.A.S.
        </a>

        <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold">
          <a href="https://www.youtube.com/@AXGLYNNE" className="text-gray-400 hover:text-red-600 transition-colors">Youtube</a>
          <a href="https://www.instagram.com/glynneai/" className="text-gray-400 hover:text-pink-600 transition-colors">Instagram</a>
          <a href="https://www.linkedin.com/in/alexander-quiroga-a992452b4/" className="text-gray-400 hover:text-blue-700 transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}

export default ServexModernFooter