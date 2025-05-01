import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import RegisterForm from "@/components/auth/register-form"

export default async function RegisterPage() {
  const user = await getCurrentUser()

  // If user is already logged in, redirect to rooms page
  if (user) {
    redirect("/rooms")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold mb-6">Register for DrawChat</h1>
      <RegisterForm />
    </div>
  )
}
