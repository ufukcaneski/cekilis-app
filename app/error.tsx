"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Bir Şeyler Yanlış Gitti</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={reset} variant="default">
          Tekrar Dene
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  )
}