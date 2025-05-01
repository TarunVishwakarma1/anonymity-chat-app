import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const user = await getCurrentUser()

  // If user is logged in, redirect to rooms page
  if (user) {
    redirect("/rooms")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-2xl font-bold">DrawChat</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Real-time Chat & Drawing App
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Collaborate with others in real-time. Chat and draw together in shared rooms.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Real-time Chat</h3>
                <p className="text-gray-500">
                  Chat with others in real-time. Messages are encrypted and stored securely.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Collaborative Drawing</h3>
                <p className="text-gray-500">
                  Draw together on a shared canvas. See changes in real-time as others draw.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-gray-500">
                  All data is encrypted and stored securely. Create private rooms for sensitive discussions.
                </p>
              </div>
            </div>
          </div>
        </section>
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
