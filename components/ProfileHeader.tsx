"use client"

import type { User } from "@/models"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit3 } from "lucide-react"

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-card-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
          <Button variant="outline" size="sm" className="border-border bg-transparent">
            <Edit3 size={16} className="mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
