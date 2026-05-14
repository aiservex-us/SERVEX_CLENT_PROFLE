'use client';

import Header from '../Home/components/header';
import Main1 from './components/main1';
import Carrucel from './components/cacrrucel'; 
import Main2 from './components/man2';
import Main3 from './components/main3';
import Footer from './components/footer';

/**
 * Home Component - Version optimized for Servex US and Configura's CET Designer ecosystem.
 * Popup logic removed.
 */
export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F5]">
      {/* Landing Page Structure */}
      <Header />
      <Main1 />
      <Carrucel />
      <Main3 />
      <Main2 />
      <Footer />
    </div>
  );
}