import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getRoomWithParticipants, joinRoom } from "@/lib/rooms"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChatInterface from "@/components/chat/chat-interface"
import DrawingCanvas from "@/components/drawing/canvas"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ChatSkeleton from "@/components/chat/chat-skeleton"
import DrawingSkeleton from "@/components/drawing/drawing-skeleton"

// Room header skeleton
function RoomHeaderSkeleton() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </header>
  )
}

export default async function RoomPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser()

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/login")
  }

  const roomId = Number.parseInt(params.id)

  if (isNaN(roomId)) {
    redirect("/rooms")
  }

  // Ensure user has an id before proceeding
  if (!user.id) {
    console.error("User object is missing id property:", user)
    redirect("/login")
  }

  try {
    // Join the room
    await joinRoom(roomId, user.id)

    // Get room details
    const room = await getRoomWithParticipants(roomId)

    if (!room) {
      redirect("/rooms")
    }

    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/rooms">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="text-2xl font-bold">{room.name}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                <span>
                  {room.participants.length} participant{room.participants.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium">{user.username}</span>
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <Tabs defaultValue="drawing" className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="drawing">Drawing</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="split">Split View</TabsTrigger>
            </TabsList>
            <TabsContent value="drawing" className="flex-1">
              <div className="h-[calc(100vh-200px)]">
                <Suspense fallback={<DrawingSkeleton />}>
                  <DrawingCanvas roomId={roomId.toString()} userId={user.id.toString()} />
                </Suspense>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="flex-1">
              <div className="h-[calc(100vh-200px)]">
                <Suspense fallback={<ChatSkeleton />}>
                  <ChatInterface
                    roomId={roomId.toString()}
                    userId={user.id.toString()}
                    username={user.username || "Anonymous"}
                    avatar_url={user.avatar_url}
                  />
                </Suspense>
              </div>
            </TabsContent>
            <TabsContent value="split" className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
                <Suspense fallback={<DrawingSkeleton />}>
                  <DrawingCanvas roomId={roomId.toString()} userId={user.id.toString()} />
                </Suspense>
                <Suspense fallback={<ChatSkeleton />}>
                  <ChatInterface
                    roomId={roomId.toString()}
                    userId={user.id.toString()}
                    username={user.username || "Anonymous"}
                    avatar_url={user.avatar_url}
                  />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error loading room:", error)
    return (
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<RoomHeaderSkeleton />}>
          <header className="border-b">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/rooms">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="text-2xl font-bold">Error Loading Room</div>
              </div>
            </div>
          </header>
        </Suspense>
        <main className="flex-1 container py-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Failed to load room</h2>
            <p className="text-muted-foreground mb-6">There was an error loading the room data.</p>
            <Link href="/rooms">
              <Button>Return to Rooms</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }
}
