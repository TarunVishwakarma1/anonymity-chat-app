import Link from "next/link"
import { AuthForm } from "@/components/auth-form"
import { PenTool } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <PenTool className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">SketchChat</h1>
        </Link>

        <AuthForm type="register" />

        <div className="text-center mt-6 text-white">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline hover:text-white/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
