"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

export default function RaffleApp() {
  const [teams, setTeams] = useState<string[]>([])
  const [candidates, setCandidates] = useState<string[]>([])
  const [newTeam, setNewTeam] = useState("")
  const [newCandidate, setNewCandidate] = useState("")
  const [results, setResults] = useState<{ team: string; candidate: string | null }[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }

  const resetAll = () => {
    setTeams([])
    setCandidates([])
    setResults([])
    setError(null)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Çekiliş Uygulaması</h1>

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

      {/* Results Section */}
      {results.length > 0 && (
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center p-3 bg-accent rounded-md"
                  >
                    <div className="font-medium">{result.team}</div>
                    <div className="flex items-center">
                      <span className="mx-2">➡️</span>
                      {result.candidate ? (
                        <Badge variant="secondary" className="ml-2">
                          {result.candidate}
                        </Badge>
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
      )}
    </div>
  )
}

