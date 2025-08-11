import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data: scans, error } = await supabaseAdmin
      .from("scans")
      .select(`
        *,
        users (
          name
        )
      `)
      .order("scanned_at", { ascending: false })

    if (error) {
      console.error("Error fetching scans:", error)
      return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
    }

    // Format data to match the expected structure
    const formattedData: Record<string, { scans: string[]; timestamps: string[] }> = {}

    scans?.forEach((scan: any) => {
      const userName = scan.users.name
      if (!formattedData[userName]) {
        formattedData[userName] = { scans: [], timestamps: [] }
      }
      formattedData[userName].scans.push(scan.slide_id)
      formattedData[userName].timestamps.push(scan.scanned_at)
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userName, slideId } = await request.json()

    if (!userName || !slideId) {
      return NextResponse.json({ error: "Nome e slideId são obrigatórios" }, { status: 400 })
    }

    let { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("name", userName).single()

    if (userError && userError.code === "PGRST116") {
      // User doesn't exist, create new one
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert([{ name: userName }])
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }
      user = newUser
    } else if (userError) {
      console.error("Error finding user:", userError)
      return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
    }

    const { data: existingScan, error: scanCheckError } = await supabaseAdmin
      .from("scans")
      .select("id")
      .eq("user_id", user.id)
      .eq("slide_id", slideId)
      .single()

    if (scanCheckError && scanCheckError.code !== "PGRST116") {
      console.error("Error checking existing scan:", scanCheckError)
      return NextResponse.json({ error: "Erro ao verificar scan" }, { status: 500 })
    }

    if (existingScan) {
      return NextResponse.json({
        success: false,
        message: "Slide já escaneado",
        alreadyScanned: true,
      })
    }

    const { error: insertError } = await supabaseAdmin.from("scans").insert([
      {
        user_id: user.id,
        slide_id: slideId,
      },
    ])

    if (insertError) {
      console.error("Error inserting scan:", insertError)
      return NextResponse.json({ error: "Erro ao registrar scan" }, { status: 500 })
    }

    const { count } = await supabaseAdmin
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    return NextResponse.json({
      success: true,
      message: "Scan registrado com sucesso",
      totalScans: count || 0,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userName = url.searchParams.get("user")

    if (userName) {
      const { data: user } = await supabaseAdmin.from("users").select("id").eq("name", userName).single()

      if (user) {
        await supabaseAdmin.from("scans").delete().eq("user_id", user.id)

        await supabaseAdmin.from("users").delete().eq("id", user.id)
      }
    } else {
      await supabaseAdmin.from("scans").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabaseAdmin.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Erro ao deletar dados" }, { status: 500 })
  }
}
