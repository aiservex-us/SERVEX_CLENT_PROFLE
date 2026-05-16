'use client';

import Image from "next/image";
import Header from './components/header'
import Proces1 from './components/proces1'
import Profile from './components/profile/page'

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div>
        <Header />
      </div>
      {/* <div className='mt-[5%]'>
        <Proces1 />
      </div > */} 
    <div className="min-h-screen w-full bg-[ff8f]">
        <Profile />
      </div>
    </div>
  );
}