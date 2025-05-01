import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { RoomList } from "@/components/room-list"
import { Button } from "@/components/ui/button"
import { PenTool, LogOut } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <PenTool className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">SketchChat</h1>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-white text-right">
              <p className="font-medium">Welcome, {user.username}</p>
              <p className="text-sm text-white/70">{user.email}</p>
            </div>
            <form action="/api/logout" method="POST">
              <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </form>
          </div>
        </header>

        <main className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
          <Suspense fallback={<div className="h-64 animate-pulse bg-white/5 rounded-lg"></div>}>
            <RoomList />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
