'use client';



import Image from "next/image";
import Header from '../Home/components/header'
import Main1 from './components/main1'
import Carrucel from './components/cacrrucel' 
import Main2 from './components/man2'
import Main3 from './components/main3'
import Footer from  './components/footer'
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white">
     <Header />
     <Main1 />
     <Carrucel />
     <Main3 />
     <Main2 />
   
     <Footer />
    </div>
  );
}
