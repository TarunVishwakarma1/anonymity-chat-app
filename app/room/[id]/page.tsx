import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getRoomById, getMessages, getDrawing } from "@/lib/db"
import RoomClient from "./client"
import { Loader2 } from "lucide-react"

interface RoomPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RoomPage(props: RoomPageProps) {
  const params = await props.params;
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const roomId = Number.parseInt(params.id)

  if (isNaN(roomId)) {
    notFound()
  }

  const room = await getRoomById(roomId)

  if (!room) {
    notFound()
  }

  const messages = await getMessages(roomId)
  const drawing = await getDrawing(roomId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
              <p className="text-white text-xl">Loading room...</p>
            </div>
          </div>
        }
      >
        <RoomClient
          room={room}
          currentUser={user}
          initialMessages={messages}
          initialDrawing={drawing?.drawing_data || null}
        />
      </Suspense>
    </div>
  )
}
