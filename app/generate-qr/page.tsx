"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Download, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GenerateQRPage() {
  const [numSlides, setNumSlides] = useState(5)
  const [baseUrl, setBaseUrl] = useState("")
  const [qrCodes, setQrCodes] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const generateQRCodes = () => {
    const currentUrl = window.location.origin
    const urls = []

    for (let i = 1; i <= numSlides; i++) {
      const url = `${currentUrl}/scan/slide${i}`
      urls.push(url)
    }

    setQrCodes(urls)
    setBaseUrl(currentUrl)
  }

  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedIndex(index)
      toast({
        title: "URL copiada!",
        description: "Cole esta URL em um gerador de QR code",
      })
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL",
        variant: "destructive",
      })
    }
  }

  const downloadQRList = () => {
    const content = qrCodes.map((url, index) => `Slide ${index + 1}: ${url}`).join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "qr-codes-urls.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="mx-auto max-w-2xl space-y-6 pt-8">
        <div className="text-center">
          <QrCode className="mx-auto h-16 w-16 text-purple-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Gerador de QR Codes</h1>
          <p className="mt-2 text-gray-600">Crie QR codes únicos para cada slide do seu evento</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração dos Slides</CardTitle>
            <CardDescription>Defina quantos slides terão QR codes no seu evento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slides">Número de slides</Label>
              <Input
                id="slides"
                type="number"
                min="1"
                max="50"
                value={numSlides}
                onChange={(e) => setNumSlides(Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <Button className="w-full" onClick={generateQRCodes}>
              Gerar URLs dos QR Codes
            </Button>
          </CardContent>
        </Card>

        {qrCodes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>URLs Geradas</CardTitle>
              <CardDescription>Use estas URLs para gerar QR codes em qualquer gerador online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {qrCodes.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Slide {index + 1}</p>
                      <p className="text-xs text-gray-600 break-all">{url}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(url, index)} className="ml-2">
                      {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full bg-transparent" onClick={downloadQRList}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Lista de URLs
              </Button>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copie cada URL acima</li>
                  <li>2. Cole em um gerador de QR code online (ex: qr-code-generator.com)</li>
                  <li>3. Baixe a imagem do QR code</li>
                  <li>4. Adicione ao final do slide correspondente</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
