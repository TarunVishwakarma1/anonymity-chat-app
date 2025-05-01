import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getPublicRooms } from "@/lib/rooms"
import RoomCard from "@/components/rooms/room-card"
import CreateRoomDialog from "@/components/rooms/create-room-dialog"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Room card skeleton
function RoomCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 h-full">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}

// Rooms list skeleton
function RoomsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Rooms list component
async function RoomsList() {
  const rooms = await getPublicRooms()

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No rooms available</h2>
        <p className="text-muted-foreground mb-6">Create a new room to get started</p>
        <CreateRoomDialog />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          id={room.id}
          name={room.name}
          participantCount={room.participant_count}
          createdBy={room.created_by_username}
          createdAt={room.created_at}
        />
      ))}
    </div>
  )
}

export default async function RoomsPage() {
  const user = await getCurrentUser()

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-2xl font-bold">DrawChat</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{user.username}</span>
            </span>
            <form action="/api/auth/logout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Rooms</h1>
          <CreateRoomDialog />
        </div>

        <Suspense fallback={<RoomsListSkeleton />}>
          <RoomsList />
        </Suspense>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} DrawChat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
