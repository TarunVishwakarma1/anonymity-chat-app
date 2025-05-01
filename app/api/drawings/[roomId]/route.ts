import { type NextRequest, NextResponse } from "next/server"
import { getRoomDrawing, saveDrawing } from "@/lib/drawings"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const roomId = Number.parseInt(params.roomId)

    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 })
    }

    const drawing = await getRoomDrawing(roomId)

    return NextResponse.json({ drawing })
  } catch (error) {
    console.error("Error getting drawing:", error)
    return NextResponse.json({ error: "Failed to get drawing" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const roomId = Number.parseInt(params.roomId)

    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 })
    }

    const { userId, drawingData } = await req.json()

    const drawingId = await saveDrawing(roomId, user.id, drawingData)

    return NextResponse.json({ drawingId }, { status: 201 })
  } catch (error) {
    console.error("Error saving drawing:", error)
    return NextResponse.json({ error: "Failed to save drawing" }, { status: 500 })
  }
}
