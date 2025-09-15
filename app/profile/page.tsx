"use client"

import { BottomNavigation } from "@/components/BottomNavigation"
import { ProfileHeader } from "@/components/ProfileHeader"
import { ProfileStats } from "@/components/ProfileStats"
import { ProfileSettings } from "@/components/ProfileSettings"
import { useAppContext } from "@/context/AppContext"

export default function ProfilePage() {
  const { state } = useAppContext()

  if (!state.user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

        <div className="space-y-6">
          <ProfileHeader user={state.user} />
          <ProfileStats activities={state.activities} finances={state.finances} />
          <ProfileSettings />
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}
