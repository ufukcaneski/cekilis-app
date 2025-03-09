"use client"

import { useState, useRef, useEffect } from "react"
import { PlusCircle, Trash2, Shuffle, Clock, Download, Camera, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import html2canvas from "html2canvas"
import { RaffleTypeSelector } from "@/components/raffle-type-selector"
import { TeamMatchingRaffle } from "@/components/team-matching-raffle"
import { RegularRaffle } from "@/components/regular-raffle"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function RaffleApp() {
  const [selectedRaffleType, setSelectedRaffleType] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Function to navigate to the appropriate route based on raffle type
  const navigateToRaffleType = (raffleType: string | null) => {
    if (raffleType) {
      // Navigate to the specific raffle type page
      router.push(`/${raffleType}`)
    } else {
      // Navigate to the home page
      router.push('/')
    }
  }

  const handleRaffleTypeSelect = (raffleType: string) => {
    setSelectedRaffleType(raffleType)
    navigateToRaffleType(raffleType)
  }

  const handleNavigate = (destination: string | null) => {
    setSelectedRaffleType(destination)
    navigateToRaffleType(destination)
  }

  // Effect to sync URL with state on initial load and URL changes
  useEffect(() => {
    // Extract the raffle type from the pathname
    const path = pathname.split('/').filter(Boolean)[0]
    if (path && path !== selectedRaffleType) {
      setSelectedRaffleType(path)
    } else if (!path && selectedRaffleType) {
      // If we're on the home page but have a selected type, reset it
      setSelectedRaffleType(null)
    }
  }, [pathname, selectedRaffleType])



  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Content */}
      
      {!selectedRaffleType ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-12">
            <img src="/logo.svg" alt="Çekiliş Uygulaması Logo" className="w-32 h-32 mb-4" />
            <h1 className="text-3xl font-bold text-center mb-2">Çekiliş Uygulaması</h1>
            <p className="text-center text-muted-foreground">Lütfen bir çekiliş türü seçin</p>
          </div>
          <RaffleTypeSelector onSelect={handleRaffleTypeSelect} />
        </div>
      ) : selectedRaffleType === "team-matching" ? (
        <TeamMatchingRaffle />
      ) : selectedRaffleType === "regular" ? (
        <RegularRaffle />
      ) : (
        <div className="text-center">
          <p>Bu çekiliş türü henüz uygulanmadı.</p>
          <button 
            onClick={() => handleNavigate(null)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Geri Dön
          </button>
        </div>
      )}
    </div>
  )
}

