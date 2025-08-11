import { type NextRequest, NextResponse } from "next/server"

// Armazenamento temporário em memória (para desenvolvimento)
// Em produção, você pode usar Vercel KV ou um banco de dados
const scansData: Record<string, { scans: string[]; timestamps: string[] }> = {}

export async function GET() {
  return NextResponse.json(scansData)
}

export async function POST(request: NextRequest) {
  try {
    const { userName, slideId } = await request.json()

    if (!userName || !slideId) {
      return NextResponse.json({ error: "Nome e slideId são obrigatórios" }, { status: 400 })
    }

    // Inicializa dados do usuário se não existir
    if (!scansData[userName]) {
      scansData[userName] = { scans: [], timestamps: [] }
    }

    // Verifica se já escaneou este slide
    if (scansData[userName].scans.includes(slideId)) {
      return NextResponse.json({
        success: false,
        message: "Slide já escaneado",
        alreadyScanned: true,
      })
    }

    // Adiciona o novo scan
    scansData[userName].scans.push(slideId)
    scansData[userName].timestamps.push(new Date().toISOString())

    return NextResponse.json({
      success: true,
      message: "Scan registrado com sucesso",
      totalScans: scansData[userName].scans.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
