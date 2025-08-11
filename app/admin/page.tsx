"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Download, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface User {
  id: number
  name: string
  created_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeUser = async (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja remover ${name}?`)) {
      try {
        const { error } = await supabase.from("users").delete().eq("id", id)

        if (error) throw error
        loadUsers()
      } catch (error) {
        console.error("Erro ao remover usuário:", error)
        alert("Erro ao remover usuário")
      }
    }
  }

  const clearAllUsers = async () => {
    if (confirm("Tem certeza que deseja remover TODOS os usuários? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase.from("users").delete().neq("id", 0) // Remove todos

        if (error) throw error
        setUsers([])
      } catch (error) {
        console.error("Erro ao limpar usuários:", error)
        alert("Erro ao limpar usuários")
      }
    }
  }

  const exportUsers = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map((user) => ({
        name: user.name,
        registeredAt: user.created_at,
      })),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `usuarios-evento-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-4 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel do Organizador</h1>
            <p className="text-gray-600">Gerencie os usuários cadastrados</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-blue-600">{users.length}</div>
              <div className="text-gray-600">Usuários Cadastrados</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsers} disabled={loading} className="flex-1 bg-transparent">
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportUsers} className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Users className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                <p>Nenhum usuário cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-600">{new Date(user.created_at).toLocaleString("pt-BR")}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUser(user.id, user.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={clearAllUsers} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Todos os Usuários
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Esta ação irá remover todos os usuários cadastrados permanentemente.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/generate">
            <Button variant="outline">Gerar QR Code do Evento</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
