"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import { ROUTES } from "@/constants"

export default function HomePage() {
  const router = useRouter()
  const { state } = useAppContext()

  useEffect(() => {
    if (!state.isLoading) {
      if (state.isAuthenticated) {
        router.replace(ROUTES.ACTIVITIES)
      } else {
        router.replace("/login")
      }
    }
  }, [router, state.isAuthenticated, state.isLoading])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Productivity App</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
