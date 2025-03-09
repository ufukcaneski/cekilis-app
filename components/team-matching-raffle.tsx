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
import { TeamMatchingRaffleHistory, getTeamMatchingHistories, saveTeamMatchingHistory, migrateExistingHistories } from "@/lib/history-service"

// Using the shared history interface from history-service.ts

export function TeamMatchingRaffle() {
  const [teams, setTeams] = useState<string[]>([])
  const [candidates, setCandidates] = useState<string[]>([])
  const [newTeam, setNewTeam] = useState("")
  const [newCandidate, setNewCandidate] = useState("")
  const [results, setResults] = useState<{ team: string; candidate: string | null }[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [raffleHistory, setRaffleHistory] = useState<TeamMatchingRaffleHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [leagues, setLeagues] = useState<{[key: string]: string[]}>({})

  // Klavye kısayolu için event listener ekle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift+R kısayolu ile çekiliş yap
      if (e.shiftKey && e.key === 'R') {
        if (!isDrawing && teams.length > 0 && candidates.length > 0) {
          performDraw();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [teams, candidates, isDrawing]); 

  // Ligleri JSON dosyasından yükle
  useEffect(() => {
    fetch('/leagues.json')
      .then(response => response.json())
      .then(data => setLeagues(data))
      .catch(error => {
        console.error('Ligler yüklenirken hata:', error)
        setError('Ligler yüklenemedi')
      })
  }, [])

  useEffect(() => {
    const loadHistories = async () => {
      // Migrate existing histories from old localStorage keys to the new unified format
      await migrateExistingHistories()
      
      // Load team matching histories from the unified storage
      const histories = await getTeamMatchingHistories()
      setRaffleHistory(histories)
    }
    
    loadHistories()
  }, [])

  const saveToHistory = async (newResults: typeof results) => {
    const newRaffle: TeamMatchingRaffleHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      teams: [...teams],
      candidates: [...candidates],
      results: newResults
    }
    
    // Save to the unified storage using the history service
    await saveTeamMatchingHistory(newRaffle)
    
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
      link.download = `raffle-results-${new Date().toISOString()}.png`
      link.click()
      
      // Hata mesajını temizle (başarılı olduğunda)
      setError(null)
    } catch (err) {
      console.error('Ekran görüntüsü hatası:', err)
      setError('Ekran görüntüsü alınırken bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const exportToCSV = () => {
    if (results.length === 0) return
    
    // Create CSV content
    let csvContent = "Takım,Aday\n";
    results.forEach(result => {
      csvContent += `"${result.team}","${result.candidate || 'Boş'}"`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `raffle-results-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const addTeam = () => {
    if (!newTeam.trim()) return
    if (teams.includes(newTeam.trim())) {
      setError("Bu takım zaten eklenmiş!")
      return
    }
    setTeams([...teams, newTeam.trim()])
    setNewTeam("")
    setError(null)
  }
  
  const selectLeague = (leagueName: string) => {
    // Seçilen ligin takımlarını al
    const leagueTeams = leagues[leagueName] || []
    
    // Takımları doğrudan ayarla (önceki takımları temizle)
    setTeams(leagueTeams)
    setError(null)
  }

  const addCandidate = () => {
    if (!newCandidate.trim()) return
    if (candidates.includes(newCandidate.trim())) {
      setError("Bu aday zaten eklenmiş!")
      return
    }
    setCandidates([...candidates, newCandidate.trim()])
    setNewCandidate("")
    setError(null)
  }

  const removeTeam = (index: number) => {
    const newTeams = [...teams]
    newTeams.splice(index, 1)
    setTeams(newTeams)
  }

  const removeCandidate = (index: number) => {
    const newCandidates = [...candidates]
    newCandidates.splice(index, 1)
    setCandidates(newCandidates)
  }

  const performDraw = async () => {
    if (teams.length === 0 || candidates.length === 0) {
      setError("Çekiliş için takım ve aday eklemelisiniz!")
      return
    }

    // No need to check if there are enough candidates - some teams can be empty

    setIsDrawing(true)
    setError(null)
    setResults([])
    
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

    // Shuffle both teams and candidates
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)
    const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5)

    // Create temporary results array
    const tempResults: { team: string; candidate: string | null }[] = []

    // First, initialize all teams with null candidates
    shuffledTeams.forEach((team) => {
      tempResults.push({
        team,
        candidate: null,
      })
    })

    // Randomly assign candidates to teams
    const teamsToAssign = Math.min(candidates.length, teams.length)
    const randomTeamIndices = Array.from({ length: teams.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, teamsToAssign)

    // Simulate drawing animation
    for (let i = 0; i < teamsToAssign; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      tempResults[randomTeamIndices[i]].candidate = shuffledCandidates[i]
      setResults([...tempResults])
    }

    // Then show all remaining teams (which will have null candidates)
    for (let i = 0; i < tempResults.length; i++) {
      if (!tempResults[i].candidate) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setResults([...tempResults])
      }
    }

    setIsDrawing(false)
    setIsLoading(false)
    
    // Save to history after drawing is complete
    saveToHistory([...tempResults]);
    
    // Scroll to results after drawing is complete
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  const resetAll = () => {
    setTeams([])
    setCandidates([])
    setResults([])
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Teams Section */}
        <Card>
          <CardHeader>
            <CardTitle>Takımlar</CardTitle>
            <CardDescription>Çekilişe katılacak takımları ekleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Takım adı"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTeam()}
              />
              <Button onClick={addTeam} size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Lig seçimi */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Veya bir lig seçin:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(leagues).map((league) => (
                  <Button 
                    key={league} 
                    variant="outline" 
                    size="sm"
                    onClick={() => selectLeague(league)}
                  >
                    {league} ({leagues[league].length})
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              {teams.map((team, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span>{team}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeTeam(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Badge variant="outline">{teams.length} takım</Badge>
          </CardFooter>
        </Card>

        {/* Candidates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Adaylar</CardTitle>
            <CardDescription>Çekilişe katılacak adayları ekleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Aday adı"
                value={newCandidate}
                onChange={(e) => setNewCandidate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCandidate()}
              />
              <Button onClick={addCandidate} size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {candidates.map((candidate, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span>{candidate}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeCandidate(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Badge variant="outline">{candidates.length} aday</Badge>
          </CardFooter>
        </Card>
      </div>

      {/* Draw Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <Button
          onClick={performDraw}
          disabled={isDrawing || teams.length === 0 || candidates.length === 0}
          className="px-8"
          title="Kısayol: Shift+R"
        >
          <Shuffle className="mr-2 h-5 w-5" />
          Çekiliş Yap
        </Button>
        <Button variant="outline" onClick={resetAll}>
          Tümünü Temizle
        </Button>
      </div>

      {/* Kısayol bilgisi */}
      <div className="text-center text-sm text-muted-foreground mb-6">
        <span className="inline-flex items-center">
          <kbd className="px-2 py-1 mx-1 text-xs font-semibold bg-muted border rounded">Shift</kbd>
          +
          <kbd className="px-2 py-1 mx-1 text-xs font-semibold bg-muted border rounded">R</kbd>
          kısayolunu kullanarak hızlıca çekiliş yapabilirsiniz.
        </span>
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
      {results.length > 0 && (
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
                <CardDescription>Takım-aday eşleşmeleri</CardDescription>
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
                  {/* Önce dolu sonra boş olacak şekilde sırala */}
                  {[...results]
                    .sort((a, b) => {
                      // Dolu olanlar önce (null olmayanlar)
                      if (a.candidate && !b.candidate) return -1;
                      // Boş olanlar sonra (null olanlar)
                      if (!a.candidate && b.candidate) return 1;
                      return 0;
                    })
                    .map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow ${!result.candidate ? 'border-red-500' : ''}`}
                    >
                      <div className={`font-medium ${!result.candidate ? 'text-red-500' : ''}`}>{result.team}</div>
                      <div>
                        {result.candidate ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: index * 0.1 + 0.3 }}
                          >
                            <Badge variant="secondary">
                              {result.candidate}
                            </Badge>
                          </motion.div>
                        ) : (
                          <Badge variant="destructive" className="text-white">
                            Boş
                          </Badge>
                        )}
                      </div>
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
                            <Badge variant="outline">{raffle.teams.length} takım</Badge>
                            <Badge variant="outline">{raffle.candidates.length} aday</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {raffle.results.map((result, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                              <span>{result.team}</span>
                              <Badge variant={result.candidate ? "secondary" : "destructive"}>
                                {result.candidate || "Boş"}
                              </Badge>
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