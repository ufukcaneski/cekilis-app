"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Laptop, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

export function NavigationBar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, don't render theme buttons to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="Çekiliş Uygulaması Logo" className="h-8 w-8" />
              <span className="font-bold">Çekiliş Uygulaması</span>
            </Link>
          </div>
          
          {/* Mobile menu button - shown on small screens */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Desktop navigation - hidden on small screens */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/regular" 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/regular' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Normal Çekiliş
            </Link>
            <Link 
              href="/team-matching" 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/team-matching' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Takım Eşleştirme
            </Link>
            <div className="flex space-x-1">
              {/* Theme buttons will be rendered after mounting */}
            </div>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Çekiliş Uygulaması Logo" className="h-8 w-8" />
            <span className="font-bold">Çekiliş Uygulaması</span>
          </Link>
        </div>
        
        {/* Mobile menu button - shown on small screens */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Desktop navigation - hidden on small screens */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Ana Sayfa
          </Link>
          <Link 
            href="/regular" 
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/regular' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Normal Çekiliş
          </Link>
          <Link 
            href="/team-matching" 
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/team-matching' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Takım Eşleştirme
          </Link>
          <div className="flex space-x-1">
            <Button 
              variant={theme === "light" ? "default" : "outline"} 
              size="icon" 
              onClick={() => setTheme("light")}
              title="Açık Tema"
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"} 
              size="icon" 
              onClick={() => setTheme("dark")}
              title="Koyu Tema"
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button 
              variant={theme === "system" ? "default" : "outline"} 
              size="icon" 
              onClick={() => setTheme("system")}
              title="Sistem Teması"
            >
              <Laptop className="h-4 w-4" />
            </Button>
          </div>
        </nav>
        
        {/* Mobile menu - shown when menu is open */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-background border-b z-50 md:hidden">
            <div className="container py-4 flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/regular" 
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/regular' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Normal Çekiliş
              </Link>
              <Link 
                href="/team-matching" 
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/team-matching' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Takım Eşleştirme
              </Link>
              <div className="flex space-x-2">
                <Button 
                  variant={theme === "light" ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setTheme("light")}
                  title="Açık Tema"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button 
                  variant={theme === "dark" ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setTheme("dark")}
                  title="Koyu Tema"
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button 
                  variant={theme === "system" ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setTheme("system")}
                  title="Sistem Teması"
                >
                  <Laptop className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}