import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { NavigationBar } from '@/components/navigation-bar'
import Ico from '@/public/favicon.ico'

export const metadata: Metadata = {
  title: 'Çekiliş App',
  description: 'Ufukcan Eski tarafından çekiliş uygulaması.',
  generator: 'Ufukcan Eski',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background/90">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NavigationBar />
          <main className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
