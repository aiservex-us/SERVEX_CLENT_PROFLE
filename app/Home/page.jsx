'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../Home/components/header';
import Main1 from './components/main1';
import Carrucel from './components/cacrrucel'; 
import Main2 from './components/man2';
import Main3 from './components/main3';
import Footer from './components/footer';

/**
 * Home Component with Microsoft Teams / Fluent UI Style Welcome Popup
 * English Version optimized for Servex US and Configura's CET Designer ecosystem.
 */
export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      // Subtle delay of 800ms for a smoother entrance
      const timer = setTimeout(() => setShowPopup(true), 800);
      sessionStorage.setItem('hasSeenWelcomePopup', 'true');
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F5]">
      {/* Landing Page Structure */}
      <Header />
      <Main1 />
      <Carrucel />
      <Main3 />
      <Main2 />
      <Footer />

      {/* Popup Logic with Framer Motion */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Overlay: Subtle background blur (Fluent Design Style) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            />
            
            {/* Modal Card: Microsoft Teams Aesthetic */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white w-full max-w-[420px] rounded-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  
                  {/* Status / Notification Icon */}
                  <div className="w-10 h-10 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#5B5FC7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Main Title */}
                    <h2 className="text-[16px] font-semibold text-[#242424] leading-tight">
                      Svx Command: Your Orchestration Hub
                    </h2>
                    
                    {/* Message Body: Value Proposition */}
                    <div className="space-y-3">
                      <p className="text-[14px] leading-[20px] text-[#424242]">
                        This platform serves as the central data engine for Servex, ensuring your experience within 
                        <span className="font-semibold text-gray-900"> Configura's CET Designer</span> is always seamless and powered by accurate, real-time information.
                      </p>
                      
                      <p className="text-[13px] leading-[18px] text-[#616161]">
                        Sign in to manage data pipelines, perform validations, and orchestrate your catalogs with maximum technical efficiency, moving beyond manual spreadsheet processes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Action Button */}
              <div className="bg-[#FAFAFB] px-6 py-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  onClick={() => setShowPopup(false)}
                  className="
                    min-w-[100px]
                    px-4 py-1.5
                    text-[14px] 
                    font-medium 
                    rounded-[4px]
                    bg-[#5B5FC7] 
                    text-white
                    hover:bg-[#4F52B2]
                    active:bg-[#444791]
                    transition-all
                    shadow-sm
                  "
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}