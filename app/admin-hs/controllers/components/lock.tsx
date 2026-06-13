'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, Heart, X } from 'lucide-react';

interface PasscodeLockProps {
  onSuccessRedirectAction: () => void;
  bgImageUrl: string;
  correctPin?: string; // Defaults to '2310'
}

export default function PasscodeLock({
  onSuccessRedirectAction,
  bgImageUrl,
  correctPin = '2310',
}: PasscodeLockProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  
  // Hint System States
  const [failCount, setFailCount] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  // Keypad Grid Configuration
  const keypadLayout = [
    { num: '1', col: 'col-start-1' },
    { num: '2', col: 'col-start-2' },
    { num: '3', col: 'col-start-3' },
    { num: '4', col: 'col-start-1' },
    { num: '5', col: 'col-start-2' },
    { num: '6', col: 'col-start-3' },
    { num: '7', col: 'col-start-1' },
    { num: '8', col: 'col-start-2' },
    { num: '9', col: 'col-start-3' },
    { num: '0', col: 'col-start-2' }, 
  ];

  const handleKeyPress = useCallback((digit: string) => {
    if (pin.length < 4) {
      setError(false);
      setPin((prev) => prev + digit);
    }
  }, [pin]);

  const handleBackspace = useCallback(() => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Physical Keyboard Input Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUnlocked) return;
      
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleBackspace, isUnlocked]);

  // Handle Token Storage & Redirection
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        setIsUnlocked(true);
        setError(false);
        
        localStorage.setItem('auth_token', 'secure_session_token_xyz123');
        
        setTimeout(() => {
          onSuccessRedirectAction();
        }, 1000);
      } else {
        setError(true);
        setPin('');
        setFailCount((prev) => prev + 1);
      }
    }
  }, [pin, correctPin, onSuccessRedirectAction]);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden font-sans select-none relative bg-white">
      
      {/* BACKGROUND SPLIT DEPTH EFFECT */}
      <div className="absolute inset-0 pointer-events-none flex">
        <div className="w-1/2 h-full bg-white" />
        <div className="w-1/2 h-full bg-pink-50/50" />
      </div>

      {/* LEFT SIDE: Character Image Container */}
      <div className="relative z-10 hidden h-full w-1/2 md:flex items-center justify-center p-12">
        <div className="relative flex items-center justify-center max-h-[75%] max-w-[75%]">
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-pink-100/40 to-transparent rounded-full filter blur-xl opacity-70 animate-pulse" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImageUrl}
            alt="Character Decoration"
            className="max-h-[85%] max-w-[85%] object-contain pointer-events-none drop-shadow-[0_8px_24px_rgba(244,143,177,0.15)] animate-fade-in"
            loading="eager"
          />
        </div>
      </div>

      {/* RIGHT SIDE: Keypad Core Wrapper Layout */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm bg-white/70 backdrop-blur-md md:bg-transparent md:backdrop-blur-none p-8 md:p-0 rounded-3xl border border-gray-100 md:border-none shadow-xl shadow-pink-100/20 md:shadow-none flex flex-col items-center">
          
          {/* Top Status Card Plate */}
          <div className="mb-6 w-full max-w-[320px] bg-gray-50/60 border border-gray-100/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
              isUnlocked ? 'bg-green-100 text-green-600' : error ? 'bg-red-100 text-red-600 animate-shake' : 'bg-pink-100/60 text-pink-400'
            }`}>
              {isUnlocked ? <Unlock size={22} /> : <Lock size={22} />}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-700">
              {isUnlocked ? 'Access Granted' : 'Enter Passcode'}
            </h2>
            <p className="mt-1 text-xs font-medium text-gray-400">
              Use your keyboard or click the hearts
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="mb-8 flex justify-center gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full border transition-all duration-200 ${
                  error ? 'border-red-400 bg-red-400' : i < pin.length ? 'border-pink-400 bg-pink-400 scale-105 shadow-[0_0_8px_rgba(244,143,177,0.6)]' : 'border-pink-300 bg-white'
                }`}
              />
            ))}
          </div>

          {/* Heart Keypad Grid */}
          <div className="grid grid-cols-3 gap-x-5 gap-y-3 max-w-[280px] w-full justify-items-center">
            {keypadLayout.map((item) => (
              <button
                key={item.num}
                onClick={() => handleKeyPress(item.num)}
                disabled={isUnlocked}
                className={`${item.col} group relative flex h-16 w-16 items-center justify-center transition-transform active:scale-95 focus:outline-none`}
              >
                <Heart 
                  size={64} 
                  className="absolute inset-0 text-pink-100/70 fill-pink-100/50 transition-all duration-200 drop-shadow-[0_4px_6px_rgba(244,143,177,0.12)] group-hover:text-pink-200/90 group-hover:fill-pink-200/60"
                />
                <span className="relative z-10 text-base font-bold text-pink-700/80 tracking-tight">
                  {item.num}
                </span>
              </button>
            ))}
          </div>

          {/* Footer Action Links */}
          <div className="mt-8 flex flex-col items-center gap-3.5 min-h-[50px]">
            {!isUnlocked && (
              <button
                onClick={() => setShowHintModal(true)}
                className="text-xs font-semibold tracking-wide text-pink-400/90 hover:text-pink-600 underline underline-offset-4 decoration-pink-300/60 transition-colors"
              >
                Wanna know some hint?
              </button>
            )}

            {pin.length > 0 && !isUnlocked && (
              <button
                onClick={handleBackspace}
                className="text-[10px] font-bold tracking-wider text-gray-400 hover:text-gray-600 uppercase transition-colors"
              >
                Clear Last Digit
              </button>
            )}
          </div>

        </div>
      </div>

      {/* CUTE DYNAMIC HINT MODAL POPUP FRAME */}
      {showHintModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/20 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="relative w-full max-w-md bg-white/90 border border-white/60 p-8 rounded-[36px] shadow-[0_30px_70px_rgba(244,143,177,0.22)] flex flex-col items-center transform transition-transform scale-100 animate-scale-up">
            
            <button 
              onClick={() => setShowHintModal(false)}
              className="absolute top-5 right-6 text-gray-400 hover:text-pink-500 transition-colors p-1.5 rounded-full hover:bg-pink-50/50"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-700 tracking-tight flex items-center gap-1.5 mb-2">
              Psst... Here's a Clue! <span className="text-base">💌</span>
            </h3>

            {/* Dynamic Hero Clue Header Line */}
            <div className="w-full text-center py-2 mb-4">
              <p className="text-2xl font-bold text-gray-400/90 tracking-wide font-sans lowercase">
                {failCount === 0 ? "enter a special date" : 
                 failCount === 1 ? "enter a special date" : 
                 failCount === 2 ? "dekha nh krtay na pyar..." : 
                 "hehe :P"}
              </p>
            </div>

            {/* Hint Stack: Adds new cards conditionally on top of old ones */}
            <div className="w-full space-y-2.5 mb-6 max-h-[260px] overflow-y-auto pr-1">
              
              {/* Default Baseline Clue Entry */}
              <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-pink-100 bg-white shadow-sm animate-slide-in">
                <span className="text-xs font-semibold text-gray-600">
                  Enter a special date ✨
                </span>
                <div className="flex flex-col items-end gap-0.5 min-w-[55px]">
                  <span className="text-[8px] font-bold text-gray-400 tracking-wider uppercase">Base Clue</span>
                  <Heart size={10} className="text-pink-400 fill-pink-400" />
                </div>
              </div>

              {/* Line Unlocked after Fail 1 */}
              {failCount >= 1 && (
                <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-pink-200 bg-white shadow-sm animate-slide-in">
                  <span className="text-xs font-semibold text-gray-700">
                    Enter a special date that is too much special for meh 🥺
                  </span>
                  <div className="flex flex-col items-end gap-0.5 min-w-[55px]">
                    <span className="text-[8px] font-bold text-pink-400 tracking-wider uppercase font-medium">Failed 1/3</span>
                    <Heart size={10} className="text-pink-500 fill-pink-500" />
                  </div>
                </div>
              )}

              {/* Line Unlocked after Fail 2 */}
              {failCount >= 2 && (
                <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-pink-200 bg-white shadow-sm animate-slide-in">
                  <span className="text-xs font-semibold text-gray-700">
                    Dekha nh krtay na pyar... 😤
                  </span>
                  <div className="flex flex-col items-end gap-0.5 min-w-[55px]">
                    <span className="text-[8px] font-bold text-pink-400 tracking-wider uppercase font-medium">Failed 2/3</span>
                    <Heart size={10} className="text-pink-500 fill-pink-500" />
                  </div>
                </div>
              )}

              {/* Line Unlocked after Fail 3 */}
              {failCount >= 3 && (
                <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-pink-200 bg-white shadow-sm animate-slide-in">
                  <span className="text-xs font-semibold text-gray-700">
                    Enter your birthdate 🍰💖
                  </span>
                  <div className="flex flex-col items-end gap-0.5 min-w-[55px]">
                    <span className="text-[8px] font-bold text-pink-400 tracking-wider uppercase font-medium">Failed 3/3</span>
                    <Heart size={10} className="text-pink-500 fill-pink-500" />
                  </div>
                </div>
              )}

            </div>

            <button
              onClick={() => setShowHintModal(false)}
              className="px-6 py-2 border-2 border-pink-400 text-pink-500 hover:bg-pink-50/50 active:scale-[0.97] text-xs font-bold rounded-full transition-all duration-200 tracking-wide"
            >
              Got it, I'll try again!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}