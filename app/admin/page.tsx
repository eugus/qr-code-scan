"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Trash2, Download, BarChart3, Gift } from "lucide-react"
import Link from "next/link"

interface ScanData {
  user: string
  scans: string[]
  timestamp: number
}

export default function AdminPage() {
  const [scanData, setScanData] = useState<ScanData[]>([])
  const [totalScans, setTotalScans] = useState(0)
  const [uniqueQRs, setUniqueQRs] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const data = localStorage.getItem("qr-scan-data")
    if (data) {
      const parsedData: ScanData[] = JSON.parse(data)
      setScanData(parsedData)

      const total = parsedData.reduce((sum, user) => sum + user.scans.length, 0)
      setTotalScans(total)

      const allQRs = new Set()
      parsedData.forEach((user) => {
        user.scans.forEach((qr) => allQRs.add(qr))
      })
      setUniqueQRs(allQRs.size)
    }
  }

  const clearAllData = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem("qr-scan-data")
      setScanData([])
      setTotalScans(0)
      setUniqueQRs(0)
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(scanData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `qr-event-data-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const removeUser = (userName: string) => {
    if (confirm(`Tem certeza que deseja remover ${userName}?`)) {
      const newData = scanData.filter((user) => user.user !== userName)
      localStorage.setItem("qr-scan-data", JSON.stringify(newData))
      loadData()
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
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-gray-600">Painel secreto do organizador</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="mx-auto h-6 w-6 text-blue-600 mb-1" />
                <div className="text-xl font-bold text-blue-600">{scanData.length}</div>
                <div className="text-xs text-gray-600">Usuários</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="mx-auto h-6 w-6 text-green-600 mb-1" />
                <div className="text-xl font-bold text-green-600">{totalScans}</div>
                <div className="text-xs text-gray-600">Total Scans</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{uniqueQRs}</div>
                <div className="text-xs text-gray-600">QRs Únicos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} className="flex-1 bg-transparent">
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportData} className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="default"
            onClick={() => window.open("/surprise", "_blank")}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <Gift className="h-4 w-4 mr-2" />
            Revelar Prêmios
          </Button>
        </div>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Competição Secreta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-600 mb-3">
              Os participantes não sabem que há uma competição! Use o botão "Revelar Prêmios" quando quiser fazer a
              surpresa.
            </p>
            <div className="text-xs text-purple-500">
              💡 Dica: Abra a página de surpresa em uma tela grande para mostrar os resultados para todos!
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usuários Registrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scanData.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Users className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                <p>Nenhum usuário registrado</p>
              </div>
            ) : (
              scanData
                .sort((a, b) => b.scans.length - a.scans.length)
                .map((user, index) => (
                  <div key={user.user} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <div className="font-semibold">{user.user}</div>
                        <div className="text-sm text-gray-600">
                          {user.scans.length} scans • {new Date(user.timestamp).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUser(user.user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={clearAllData} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos os Dados
            </Button>
            <p className="text-sm text-gray-600 mt-2">Esta ação irá remover todos os usuários e scans registrados.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
