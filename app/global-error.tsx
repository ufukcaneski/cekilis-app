"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Kritik Hata</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Üzgünüz, uygulamada kritik bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={reset} variant="default">
              Sayfayı Yenile
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}