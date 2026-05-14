'use client';



import Image from "next/image";
import Header from '../Home/components/header'
import Main1 from './components/main1'
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white">
     <Header />
     <Main1 />
    </div>
  );
}
