"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Gift, Sparkles } from "lucide-react"
import Link from "next/link"

interface ScanData {
  user: string
  scans: string[]
  timestamp: number
}

interface RankingUser {
  user: string
  scanCount: number
  lastScan: number
}

export default function SurprisePage() {
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("qr-event-user")
    if (savedUser) {
      setCurrentUser(savedUser)
    }

    loadRanking()
  }, [])

  const loadRanking = () => {
    const scanData = localStorage.getItem("qr-scan-data")
    if (scanData) {
      const data: ScanData[] = JSON.parse(scanData)
      const rankingData = data
        .map((d) => ({
          user: d.user,
          scanCount: d.scans.length,
          lastScan: d.timestamp,
        }))
        .sort((a, b) => {
          if (a.scanCount === b.scanCount) {
            return a.lastScan - b.lastScan
          }
          return b.scanCount - a.scanCount
        })

      setRanking(rankingData)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />
      default:
        return (
          <div className="h-8 w-8 flex items-center justify-center text-gray-500 font-bold text-lg">{position}</div>
        )
    }
  }

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100"
      case 2:
        return "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
      case 3:
        return "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100"
      default:
        return ""
    }
  }

  const getPrizeText = (position: number) => {
    switch (position) {
      case 1:
        return "🏆 GRANDE PRÊMIO!"
      case 2:
        return "🥈 Segundo Lugar!"
      case 3:
        return "🥉 Terceiro Lugar!"
      default:
        return "🎁 Participação"
    }
  }

  if (!showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
        <div className="mx-auto max-w-md space-y-6 pt-16">
          <div className="text-center">
            <div className="relative">
              <Gift className="mx-auto h-20 w-20 text-purple-600 mb-4" />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 SURPRESA! 🎉</h1>
            <p className="text-lg text-gray-700 mb-6">
              Havia uma competição secreta acontecendo durante todo o evento!
            </p>
            <p className="text-gray-600 mb-8">Quem escaneou mais QR codes ganhou prêmios incríveis!</p>
          </div>

          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="pt-6 text-center">
              <Trophy className="mx-auto h-12 w-12 text-purple-600 mb-3" />
              <h2 className="text-xl font-bold text-purple-900 mb-2">Competição de QR Codes</h2>
              <p className="text-purple-700 text-sm mb-4">Cada QR code escaneado contava pontos para você!</p>
              <Button
                onClick={() => setShowResults(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Ver Resultados Finais
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button variant="outline">Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="mx-auto max-w-md space-y-6 pt-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">🏆 Resultados Finais</h1>
          <p className="text-gray-600">Classificação da competição secreta</p>
        </div>

        <div className="space-y-4">
          {ranking.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Trophy className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                  <p>Nenhum participante encontrado</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            ranking.map((user, index) => {
              const position = index + 1
              const isCurrentUser = user.user === currentUser
              const isWinner = position <= 3

              return (
                <Card
                  key={user.user}
                  className={`${getRankColor(position)} ${isCurrentUser ? "ring-2 ring-purple-500" : ""} ${
                    isWinner ? "shadow-lg" : ""
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRankIcon(position)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{user.user}</span>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                Você
                              </Badge>
                            )}
                          </div>
                          {isWinner && (
                            <div className="text-sm font-semibold text-purple-700">{getPrizeText(position)}</div>
                          )}
                          <div className="text-xs text-gray-600">{new Date(user.lastScan).toLocaleString("pt-BR")}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{user.scanCount}</div>
                        <div className="text-xs text-gray-500">QR codes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {ranking.length > 0 && (
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="mx-auto h-10 w-10 text-yellow-600 mb-3" />
                <h2 className="text-xl font-bold text-yellow-900 mb-1">🎊 CAMPEÃO 🎊</h2>
                <p className="text-lg font-semibold text-yellow-800">{ranking[0]?.user}</p>
                <p className="text-sm text-yellow-700">{ranking[0]?.scanCount} QR codes escaneados</p>
                <div className="mt-3 text-2xl">🏆🎁🎉</div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowResults(false)} className="flex-1">
            Ver Surpresa Novamente
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
