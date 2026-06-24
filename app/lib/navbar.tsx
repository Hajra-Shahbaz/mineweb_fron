"use client"

import * as React from "react"
import Link from "next/link"
import { ModeToggle } from "@/app/components/mode-toggle" // Double check your path to mode-toggle

export function Navbar() {
  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Left Side: Brand/Logo */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold inline-block sm:text-xl">
              Portfolio Control Suite
            </span>
          </Link>
        </div>

        {/* Right Side: Theme Toggle */}
        <div className="flex items-center justify-end space-x-4">
          <ModeToggle />
        </div>

      </div>
    </nav>
  )
}