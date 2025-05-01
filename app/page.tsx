import type React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, PenTool, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <PenTool className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">SketchChat</h1>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-purple-600 hover:bg-white/90">Sign Up</Button>
            </Link>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold text-white leading-tight">Chat, Draw, and Collaborate in Real-Time</h2>
            <p className="text-xl text-white/80">
              SketchChat combines real-time messaging with collaborative drawing tools. Create rooms, invite friends,
              and express your ideas visually and verbally.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 text-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-lg"
                >
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>

          <Suspense fallback={<div className="h-96 rounded-xl bg-white/20 animate-pulse"></div>}>
            <div className="relative">
              <div className="absolute -top-6 -left-6 bg-purple-600 p-4 rounded-xl shadow-lg animate-float z-10">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-pink-500 p-4 rounded-xl shadow-lg animate-float animation-delay-1000 z-10">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
                <img src="/collaborative-chat-drawing-app.png" alt="SketchChat App Preview" className="rounded-lg shadow-lg" />
              </div>
            </div>
          </Suspense>
        </main>

        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-purple-500" />}
            title="Real-Time Chat"
            description="Communicate instantly with encrypted messages that sync across all devices."
          />
          <FeatureCard
            icon={<PenTool className="h-8 w-8 text-pink-500" />}
            title="Collaborative Drawing"
            description="Draw together in real-time with an intuitive canvas inspired by Excalidraw."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-orange-500" />}
            title="Private Rooms"
            description="Create secure rooms for your team or friends with encrypted data storage."
          />
        </section>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 animate-pulse-slow">
      <div className="bg-white/20 rounded-full p-3 w-fit mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  )
}
