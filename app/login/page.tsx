import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import LoginForm from "@/components/auth/login-form"

export default async function LoginPage() {
  const user = await getCurrentUser()

  // If user is already logged in, redirect to rooms page
  if (user) {
    redirect("/rooms")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold mb-6">Login to DrawChat</h1>
      <LoginForm />
    </div>
  )
}
