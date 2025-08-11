"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Html5QrcodeScanner } from "html5-qrcode"

interface ScanData {
  user: string
  scans: string[]
  timestamp: number
}

export default function ScannerPage() {
  const [userName, setUserName] = useState("")
  const [scanCount, setScanCount] = useState(0)
  const [lastScan, setLastScan] = useState("")
  const [message, setMessage] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("qr-event-user")
    if (!savedUser) {
      window.location.href = "/"
      return
    }
    setUserName(savedUser)

    // Load user scan data
    const scanData = localStorage.getItem("qr-scan-data")
    if (scanData) {
      const data: ScanData[] = JSON.parse(scanData)
      const userScans = data.find((d) => d.user === savedUser)
      if (userScans) {
        setScanCount(userScans.scans.length)
      }
    }
  }, [])

  useEffect(() => {
    if (isScanning) {
      startScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isScanning])

  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
    }

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false,
    )

    scannerRef.current.render(onScanSuccess, onScanFailure)
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
  }

  const onScanSuccess = (decodedText: string) => {
    setLastScan(decodedText)

    // Save scan data
    const scanData = localStorage.getItem("qr-scan-data")
    const data: ScanData[] = scanData ? JSON.parse(scanData) : []

    const userIndex = data.findIndex((d) => d.user === userName)

    if (userIndex >= 0) {
      // Check if already scanned this QR code
      if (data[userIndex].scans.includes(decodedText)) {
        setMessage("Este QR Code já foi registrado!")
        return
      }
      data[userIndex].scans.push(decodedText)
      data[userIndex].timestamp = Date.now()
    } else {
      data.push({
        user: userName,
        scans: [decodedText],
        timestamp: Date.now(),
      })
    }

    localStorage.setItem("qr-scan-data", JSON.stringify(data))
    setScanCount((prev) => prev + 1)
    setMessage("QR Code registrado com sucesso!")
    setIsScanning(false)

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000)
  }

  const onScanFailure = (error: string) => {
    // Handle scan failure silently
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
            <h1 className="text-2xl font-bold text-gray-900">Scanner QR</h1>
            <p className="text-gray-600">Usuário: {userName}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant={isScanning ? "default" : "secondary"}>
                {isScanning ? "Scanner Ativo" : "Scanner Parado"}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {scanCount > 0 ? `${scanCount} QR codes escaneados` : "Nenhum QR code escaneado ainda"}
              </p>
            </div>
          </CardContent>
        </Card>

        {message && (
          <Card
            className={message.includes("sucesso") ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {message.includes("sucesso") ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="text-sm">{message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner de QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="qr-reader" className="w-full"></div>

            <Button
              className="w-full"
              onClick={() => setIsScanning(!isScanning)}
              variant={isScanning ? "destructive" : "default"}
            >
              {isScanning ? "Parar Scanner" : "Iniciar Scanner"}
            </Button>

            {lastScan && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Último scan:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{lastScan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
