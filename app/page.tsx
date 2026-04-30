"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        TaskFlow
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Manage projects, assign tasks, and track your team&apos;s progress in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Create Account
        </Link>
      </div>
    </div>
  )
}
