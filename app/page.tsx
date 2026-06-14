"use client";

import React from 'react';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fafafa] bg-gradient-to-tr from-[#f4f4f5] via-[#ffffff] to-[#f4f4f5] p-6 text-gray-900 font-sans flex flex-col items-center justify-center overflow-hidden relative">
      
      {/* Abstract structural backdrops */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gray-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-200/50 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Branding Frame */}
      <div className="absolute top-8 left-8 text-left pointer-events-none">
        <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-neutral-400 font-bold">
          Owl·Control Systems
        </p>
        <div className="w-6 h-[1px] bg-neutral-300 mt-1.5" />
      </div>

      <div className="absolute bottom-8 right-8 text-right pointer-events-none">
        <p className="text-[9px] font-mono tracking-widest text-neutral-400">
          SYS.LOC // <span className="text-neutral-600">CLUSTER_OUT</span>
        </p>
      </div>

      {/* Main Feature Typographic Centerpiece */}
      <div className="relative flex flex-col items-center justify-center text-center select-none z-10 px-4">
        
        {/* Subtle glassmorphic echo outline behind font */}
        <div className="absolute -inset-x-8 -inset-y-4 bg-white/20 backdrop-blur-md rounded-[30px] border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.02)] -z-10" />

        {/* Display Title with extreme letter-spacing and fluid masking */}
        <h1 className="text-7xl md:text-9xl font-black tracking-[0.18em] leading-none text-neutral-900 uppercase pr-[-0.18em] font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          CHLO
          <span className="block mt-2 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-950 bg-clip-text text-transparent tracking-[0.12em] text-6xl md:text-8xl font-extrabold">
            NIKLO
          </span>
        </h1>

        {/* Stylized UI Status element beneath text */}
        <div className="mt-8 flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white rounded-full text-[10px] font-mono tracking-[0.2em] uppercase shadow-md shadow-neutral-900/10 transition-transform hover:scale-105 duration-300 cursor-pointer">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Terminal Executed
        </div>
      </div>

    </div>
  );
}