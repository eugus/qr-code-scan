"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"

export default function GeneratePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  const generateQR = async () => {
    const url = window.location.origin
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
    })
    setQrCodeUrl(qrDataUrl)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Gerar QR Code do Evento</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Button onClick={generateQR} size="lg">
              Gerar QR Code
            </Button>

            {qrCodeUrl && (
              <div className="space-y-4">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="mx-auto border rounded" />
                <p className="text-sm text-gray-600">Clique com botão direito na imagem para salvar</p>
                <p className="text-xs text-gray-500">URL: {window.location.origin}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
