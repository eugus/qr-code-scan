"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, QrCode } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [userName, setUserName] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("qr-event-user")
    if (savedUser) {
      setUserName(savedUser)
      setIsRegistered(true)
    }
  }, [])

  const handleRegister = () => {
    if (userName.trim()) {
      localStorage.setItem("qr-event-user", userName.trim())
      setIsRegistered(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("qr-event-user")
    setUserName("")
    setIsRegistered(false)
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="mx-auto max-w-md space-y-6 pt-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">QR Event Tracker</h1>
            <p className="mt-2 text-gray-600">Escaneie os QR codes dos slides para participar!</p>
          </div>

          <div className="grid gap-4">
            <Link href="/scanner">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <CardHeader className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-blue-600" />
                  <CardTitle>Escanear QR Code</CardTitle>
                  <CardDescription>Escaneie os QR codes dos slides</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <CardHeader className="text-center">
                  <Users className="mx-auto h-12 w-12 text-green-600" />
                  <CardTitle>Organizador</CardTitle>
                  <CardDescription>Acesso restrito</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/generate-qr">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <CardHeader className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-purple-600" />
                  <CardTitle>Gerar QR Codes</CardTitle>
                  <CardDescription>Para organizadores</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={handleLogout}>
              Trocar Usuário
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-md space-y-6 pt-16">
        <div className="text-center">
          <QrCode className="mx-auto h-16 w-16 text-blue-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">QR Event Tracker</h1>
          <p className="mt-2 text-gray-600">Digite seu nome para começar a escanear QR codes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
            <CardDescription>Como você gostaria de ser identificado no ranking?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>
            <Button className="w-full" onClick={handleRegister} disabled={!userName.trim()}>
              Começar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
