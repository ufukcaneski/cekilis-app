"use client"

import { useState, useRef, useEffect } from "react"
import { PlusCircle, Trash2, Shuffle, Clock, Download, Camera, History, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import html2canvas from "html2canvas"
import { RegularRaffleHistory, getRegularHistories, saveRegularHistory, migrateExistingHistories } from "@/lib/history-service"

// Using the shared history interface from history-service.ts

export function RegularRaffle() {
  const [items, setItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")
  const [winners, setWinners] = useState<string[]>([])
  const [winnerCount, setWinnerCount] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [raffleHistory, setRaffleHistory] = useState<RegularRaffleHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Klavye kısayolu için event listener ekle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift+R kısayolu ile çekiliş yap
      if (e.shiftKey && e.key === 'R') {
        if (!isDrawing && items.length > 0) {
          performDraw();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [items, isDrawing, winnerCount]);

  // Geçmiş çekilişleri history service'den yükle
  useEffect(() => {
    const loadHistories = async () => {
      // Migrate existing histories from old localStorage keys to the new unified format
      await migrateExistingHistories()
      
      // Load regular raffle histories from the unified storage
      const histories = await getRegularHistories()
      setRaffleHistory(histories)
    }
    
    loadHistories()
  }, [])

  const saveToHistory = async (newWinners: string[]) => {
    const newRaffle: RegularRaffleHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      items: [...items],
      winnerCount,
      winners: newWinners
    }
    
    // Save to the unified storage using the history service
    await saveRegularHistory(newRaffle)
    
    // Update local state
    setRaffleHistory([newRaffle, ...raffleHistory])
  }

  const captureScreenshot = async () => {
    if (!resultsRef.current) return
    try {
      // Sonuç kartını doğrudan hedefle
      const card = resultsRef.current
      
      // Geçici bir klon oluştur
      const clone = card.cloneNode(true) as HTMLElement
      
      // Klondaki footer'ı bul ve kaldır
      const footer = clone.querySelector('[class*="CardFooter"]')
      if (footer) {
        footer.remove()
      }
      
      // Klonu geçici olarak belgeye ekle ama görünmez yap
      clone.style.position = 'fixed'
      clone.style.top = '-9999px'
      clone.style.left = '-9999px'
      document.body.appendChild(clone)
      
      // Ekran görüntüsünü al
      const canvas = await html2canvas(clone, {
        backgroundColor: null, // Arka plan rengini otomatik al
        scale: 2, // Daha yüksek kalite
        logging: false
      })
      
      // Geçici klonu kaldır
      document.body.removeChild(clone)
      
      // İndirme bağlantısını oluştur
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `regular-raffle-results-${new Date().toISOString()}.png`
      link.click()
      
      // Hata mesajını temizle (başarılı olduğunda)
      setError(null)
    } catch (err) {
      console.error('Ekran görüntüsü hatası:', err)
      setError('Ekran görüntüsü alınırken bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const exportToCSV = () => {
    if (winners.length === 0) return
    
    // Create CSV content
    let csvContent = "Sıra,Kazanan\n";
    winners.forEach((winner, index) => {
      csvContent += `"${index + 1}","${winner}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `regular-raffle-results-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const addItem = () => {
    if (!newItem.trim()) return
    if (items.includes(newItem.trim())) {
      setError("Bu öğe zaten eklenmiş!")
      return
    }
    setItems([...items, newItem.trim()])
    setNewItem("")
    setError(null)
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const performDraw = async () => {
    if (items.length === 0) {
      setError("Çekiliş için en az bir öğe eklemelisiniz!")
      return
    }

    if (winnerCount <= 0) {
      setError("Kazanan sayısı en az 1 olmalıdır!")
      return
    }

    if (winnerCount > items.length) {
      setError(`Kazanan sayısı, toplam öğe sayısından (${items.length}) fazla olamaz!`)
      return
    }

    setIsDrawing(true)
    setError(null)
    setWinners([])
    
    // Start countdown from 3
    setCountdown(3)
    for (let i = 3; i > 0; i--) {
      setCountdown(i)
      setProgress((3 - i) * 33.33)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    setProgress(100)
    setCountdown(null)
    setIsLoading(true)

    // Shuffle items
    const shuffledItems = [...items].sort(() => Math.random() - 0.5)

    // Select winners
    const selectedWinners: string[] = []
    const actualWinnerCount = Math.min(winnerCount, items.length)

    // Simulate drawing animation
    for (let i = 0; i < actualWinnerCount; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      selectedWinners.push(shuffledItems[i])
      setWinners([...selectedWinners])
    }

    setIsDrawing(false)
    setIsLoading(false)
    
    // Save to history after drawing is complete
    saveToHistory([...selectedWinners]);
    
    // Scroll to results after drawing is complete
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  const resetAll = () => {
    setItems([])
    setWinners([])
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Çekiliş Listesi</CardTitle>
            <CardDescription>Çekilişe katılacak öğeleri ekleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Öğe adı"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
              <Button onClick={addItem} size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span>{item}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Badge variant="outline">{items.length} öğe</Badge>
            {items.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetAll}>
                Tümünü Temizle
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Draw Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Çekiliş Ayarları</CardTitle>
            <CardDescription>Kazanan sayısını belirleyin ve çekilişi başlatın</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Kazanan Sayısı</label>
                <Input
                  type="number"
                  min="1"
                  max={items.length}
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <Button
                onClick={performDraw}
                disabled={isDrawing || items.length === 0}
                className="mt-6"
                title="Kısayol: Shift+R"
              >
                <Shuffle className="mr-2 h-5 w-5" />
                Çekiliş Yap
              </Button>
            </div>

            {/* Kısayol bilgisi */}
            <div className="text-center text-sm text-muted-foreground">
              <span className="inline-flex items-center">
                <kbd className="px-2 py-1 mx-1 text-xs font-semibold bg-muted border rounded">Shift</kbd>
                +
                <kbd className="px-2 py-1 mx-1 text-xs font-semibold bg-muted border rounded">R</kbd>
                kısayolunu kullanarak hızlıca çekiliş yapabilirsiniz.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countdown and Loading Overlay */}
      <AnimatePresence>
        {(countdown !== null || isLoading) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="flex flex-col items-center"
            >
              {countdown !== null ? (
                <>
                  <motion.div 
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl font-bold mb-8"
                  >
                    {countdown}
                  </motion.div>
                  <div className="w-64">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="flex items-center mt-4 text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Çekiliş başlıyor...</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <Shuffle className="h-8 w-8" />
                  </motion.div>
                  <span className="text-lg font-medium">Lütfen bekleyiniz...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      {winners.length > 0 && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Çekiliş Sonuçları</CardTitle>
                <CardDescription>Kazananlar</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={captureScreenshot}>
                  <Camera className="mr-2 h-4 w-4" />
                  Görüntü
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AnimatePresence>
                  {winners.map((winner, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-3">{index + 1}</Badge>
                        <div className="font-medium">{winner}</div>
                      </div>
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHistory(!showHistory)}
                className="ml-auto"
              >
                <History className="mr-2 h-4 w-4" />
                {showHistory ? "Geçmişi Gizle" : "Geçmişi Göster"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Raffle History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>Çekiliş Geçmişi</CardTitle>
                <CardDescription>Önceki çekilişlerin sonuçları</CardDescription>
              </CardHeader>
              <CardContent>
                {raffleHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground">Henüz çekiliş yapılmadı</p>
                ) : (
                  <div className="space-y-6">
                    {raffleHistory.map((raffle) => (
                      <div key={raffle.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">{raffle.date}</h3>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{raffle.items.length} öğe</Badge>
                            <Badge variant="outline">{raffle.winnerCount} kazanan</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {raffle.winners.map((winner, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                              <span>{index + 1}. {winner}</span>
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}