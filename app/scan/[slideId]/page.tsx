"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, QrCode, Loader2 } from "lucide-react"

export default function ScanPage() {
  const params = useParams()
  const router = useRouter()
  const slideId = params.slideId as string

  const [userName, setUserName] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [scanRegistered, setScanRegistered] = useState(false)
  const [alreadyScanned, setAlreadyScanned] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("qr-event-user")
    if (savedUser) {
      setUserName(savedUser)
      setIsRegistered(true)
      checkAndRegisterScan(savedUser)
    }
  }, [slideId])

  const checkAndRegisterScan = async (user: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: user,
          slideId: slideId,
        }),
      })

      const data = await response.json()

      if (data.alreadyScanned) {
        setAlreadyScanned(true)
      } else if (data.success) {
        setScanRegistered(true)
      } else {
        fallbackToLocalStorage(user)
      }
    } catch (error) {
      console.error("Erro ao registrar scan:", error)
      fallbackToLocalStorage(user)
    } finally {
      setLoading(false)
    }
  }

  const fallbackToLocalStorage = (user: string) => {
    const scansKey = `qr-event-scans-${user}`
    const userScans = JSON.parse(localStorage.getItem(scansKey) || "[]")

    if (userScans.includes(slideId)) {
      setAlreadyScanned(true)
      return
    }

    const newScans = [...userScans, slideId]
    localStorage.setItem(scansKey, JSON.stringify(newScans))

    const allScans = JSON.parse(localStorage.getItem("qr-event-all-scans") || "{}")
    if (!allScans[user]) {
      allScans[user] = { scans: [], timestamps: [] }
    }
    allScans[user].scans.push(slideId)
    allScans[user].timestamps.push(new Date().toISOString())
    localStorage.setItem("qr-event-all-scans", JSON.stringify(allScans))

    setScanRegistered(true)
  }

  const handleRegister = () => {
    if (userName.trim()) {
      localStorage.setItem("qr-event-user", userName.trim())
      setIsRegistered(true)
      checkAndRegisterScan(userName.trim())
    }
  }

  const handleContinue = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="mx-auto max-w-md space-y-6 pt-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 text-blue-600 animate-spin" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Registrando...</h1>
            <p className="mt-2 text-gray-600">Aguarde um momento</p>
          </div>
        </div>
      </div>
    )
  }

  if (alreadyScanned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
        <div className="mx-auto max-w-md space-y-6 pt-16">
          <div className="text-center">
            <QrCode className="mx-auto h-16 w-16 text-orange-600" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">QR Code já escaneado!</h1>
            <p className="mt-2 text-gray-600">Você já registrou este slide anteriormente</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Slide {slideId.replace("slide", "")}</CardTitle>
              <CardDescription>Este QR code já foi registrado por você</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleContinue}>
                Continuar Evento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (scanRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="mx-auto max-w-md space-y-6 pt-16">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">QR Code registrado!</h1>
            <p className="mt-2 text-gray-600">Parabéns, {userName}! Continue acompanhando o evento</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Slide {slideId.replace("slide", "")} ✓</CardTitle>
              <CardDescription>Registrado com sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleContinue}>
                Continuar Evento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isRegistered) {
    checkAndRegisterScan(userName)
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-md space-y-6 pt-16">
        <div className="text-center">
          <QrCode className="mx-auto h-16 w-16 text-blue-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">QR Code Escaneado!</h1>
          <p className="mt-2 text-gray-600">Digite seu nome para registrar este slide</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Slide {slideId.replace("slide", "")}</CardTitle>
            <CardDescription>Identifique-se para registrar sua participação</CardDescription>
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
              Registrar Participação
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
