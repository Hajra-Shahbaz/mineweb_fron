'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, Heart } from 'lucide-react';

interface PasscodeLockProps {
  onSuccessRedirectAction: () => void;
  bgImageUrl: string; // Changed to accept any valid string URL smoothly
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

  // Keypad Grid Configuration (Places '0' perfectly centered in the 4th row)
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

  // Handle Token Storage & Redirection upon correct entry
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        setIsUnlocked(true);
        setError(false);
        
        // Save the session token locally
        localStorage.setItem('auth_token', 'secure_session_token_xyz123');
        
        setTimeout(() => {
          onSuccessRedirectAction(); // Fixed: Added "Action" to match the prop name
        }, 1000);
      } else {
        setError(true);
        setPin('');
      }
    }
  }, [pin, correctPin, onSuccessRedirectAction]); // Fixed: Added "Action" here too

  return (
    <div className="flex h-screen w-full flex-col bg-white md:flex-row overflow-hidden font-sans select-none">
      
      {/* LEFT SIDE: Centered Transparent Character Image on Crisp White BG */}
      <div className="relative hidden h-full w-1/2 bg-white md:flex items-center justify-center p-12 border-r border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImageUrl}
          alt="Character Decoration"
          className="max-h-[70%] max-w-[70%] object-contain pointer-events-none animate-fade-in"
          loading="eager"
        />
      </div>

      {/* RIGHT SIDE: Keypad Screen & Validation Controls */}
      <div className="flex h-full w-full flex-col items-center justify-center bg-white px-6 py-12 md:w-1/2">
        
        {/* Header Lock Status Panel */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
            isUnlocked 
              ? 'bg-green-100 text-green-600 scale-110' 
              : error 
                ? 'bg-red-100 text-red-600 animate-shake' 
                : 'bg-pink-50 text-pink-500'
          }`}>
            {isUnlocked ? <Unlock size={30} /> : <Lock size={30} />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            {isUnlocked ? 'Access Granted' : 'Enter Passcode'}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {error ? 'Incorrect PIN. Try again.' : 'Use your keyboard or click the hearts'}
          </p>
        </div>

        {/* 4-Digit Passcode Dot Indicators */}
        <div className="mb-10 flex justify-center gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                error 
                  ? 'border-red-500 bg-red-500' 
                  : i < pin.length 
                    ? 'border-pink-500 bg-pink-500 scale-110' 
                    : 'border-pink-200 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Beautiful Heart-Shaped Layout Grid */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 max-w-70 w-full justify-items-center">
          {keypadLayout.map((item) => (
            <button
              key={item.num}
              onClick={() => handleKeyPress(item.num)}
              disabled={isUnlocked}
              className={`${item.col} group relative flex h-20 w-20 items-center justify-center transition-transform active:scale-90 focus:outline-none`}
            >
              <Heart 
                size={76} 
                className="absolute inset-0 text-pink-50 transition-colors duration-200 fill-pink-50 group-hover:text-pink-100 group-hover:fill-pink-100 group-active:text-pink-200"
              />
              <span className="relative z-10 text-xl font-bold text-pink-600">
                {item.num}
              </span>
            </button>
          ))}
        </div>

        {/* Screen Backspace Control */}
        {pin.length > 0 && !isUnlocked && (
          <button
            onClick={handleBackspace}
            className="mt-8 text-xs font-semibold tracking-wider text-pink-400 hover:text-pink-600 uppercase transition-colors"
          >
            Clear Last Digit
          </button>
        )}
      </div>

    </div>
  );
}