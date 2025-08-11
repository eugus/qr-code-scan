"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function HomePage() {
  const [name, setName] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase.from("users").insert([{ name: name.trim() }])

      if (error) throw error

      setIsRegistered(true)
    } catch (error) {
      console.error("Erro ao registrar:", error)
      alert("Erro ao registrar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-16 space-y-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Cadastro Realizado!</h1>
            <p className="mt-2 text-gray-600">Obrigado por participar do nosso evento</p>
          </div>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg">
                Bem-vindo, <strong>{name}</strong>!
              </p>
              <p className="text-sm text-gray-600 mt-2">Você foi registrado com sucesso em nosso evento.</p>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                setIsRegistered(false)
                setName("")
              }}
            >
              Registrar Outro Usuário
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-16 space-y-6">
        <div className="text-center">
          <Users className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao Evento!</h1>
          <p className="mt-2 text-gray-600">Faça seu cadastro para participar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>
            <Button className="w-full" onClick={handleRegister} disabled={!name.trim() || loading}>
              {loading ? "Registrando..." : "Cadastrar"}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Acesso Organizador
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
