"use client"

import { useState, useRef, useEffect } from "react"
import { PlusCircle, Trash2, Shuffle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function RaffleApp() {
  const [teams, setTeams] = useState<string[]>([])
  const [candidates, setCandidates] = useState<string[]>([])
  const [newTeam, setNewTeam] = useState("")
  const [newCandidate, setNewCandidate] = useState("")
  const [results, setResults] = useState<{ team: string; candidate: string | null }[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)

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
    <div className="container mx-auto p-4 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        <img src="/logo.svg" alt="Çekiliş Uygulaması Logo" className="w-32 h-32 mb-4" />
        <h1 className="text-3xl font-bold text-center">Çekiliş Uygulaması</h1>
      </motion.div>

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
        >
          <Shuffle className="mr-2 h-5 w-5" />
          Çekiliş Yap
        </Button>
        <Button variant="outline" onClick={resetAll}>
          Tümünü Temizle
        </Button>
      </div>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
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
            <CardHeader>
              <CardTitle>Çekiliş Sonuçları</CardTitle>
              <CardDescription>Takım-aday eşleşmeleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AnimatePresence>
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-accent rounded-md"
                    >
                      <div className="font-medium">{result.team}</div>
                      <div className="flex items-center">
                        <motion.span 
                          className="mx-2"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                        >
                          ➡️
                        </motion.span>
                        {result.candidate ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: index * 0.1 + 0.3 }}
                          >
                            <Badge variant="secondary" className="ml-2">
                              {result.candidate}
                            </Badge>
                          </motion.div>
                        ) : (
                          <Badge variant="outline" className="ml-2 text-muted-foreground">
                            Boş
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

