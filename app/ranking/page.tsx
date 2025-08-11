"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react"
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

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [currentUser, setCurrentUser] = useState("")

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
            return a.lastScan - b.lastScan // Earlier timestamp wins in case of tie
          }
          return b.scanCount - a.scanCount
        })

      setRanking(rankingData)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <div className="h-6 w-6 flex items-center justify-center text-gray-500 font-bold">{position}</div>
    }
  }

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "border-yellow-200 bg-yellow-50"
      case 2:
        return "border-gray-200 bg-gray-50"
      case 3:
        return "border-amber-200 bg-amber-50"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-md space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>
            <p className="text-gray-600">Classificação geral</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Participantes: {ranking.length}</h2>
          <Button variant="outline" size="sm" onClick={loadRanking}>
            Atualizar
          </Button>
        </div>

        <div className="space-y-3">
          {ranking.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Trophy className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                  <p>Nenhum QR code escaneado ainda</p>
                  <p className="text-sm">Seja o primeiro a escanear!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            ranking.map((user, index) => {
              const position = index + 1
              const isCurrentUser = user.user === currentUser

              return (
                <Card
                  key={user.user}
                  className={`${getRankColor(position)} ${isCurrentUser ? "ring-2 ring-blue-500" : ""}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRankIcon(position)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{user.user}</span>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                Você
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{new Date(user.lastScan).toLocaleString("pt-BR")}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{user.scanCount}</div>
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
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <p className="font-semibold text-blue-900">🏆 Líder: {ranking[0]?.user}</p>
                <p className="text-sm text-blue-700">{ranking[0]?.scanCount} QR codes escaneados</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
