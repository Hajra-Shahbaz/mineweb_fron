"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg">
        <span className="h-4 w-4" />
      </Button>
    )
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme
  const isDark = currentTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border-border bg-background hover:bg-muted active:scale-90 transition-transform duration-200 flex items-center justify-center"
    >
      {/* Changing the wrapper key forces the Tailwind Motion plugin to re-fire on click */}
      <div key={isDark ? "dark" : "light"} className="relative w-4 h-4 sm:w-[1.1rem] sm:h-[1.1rem]">
        {!isDark ? (
          <Sun className="absolute inset-0 h-full w-full text-foreground motion-preset-bounce motion-duration-500" />
        ) : (
          <Moon className="absolute inset-0 h-full w-full text-foreground motion-preset-bounce motion-duration-500" />
        )}
      </div>
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}