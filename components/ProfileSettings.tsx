"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell, Moon, Shield, HelpCircle, LogOut } from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import { useRouter } from "next/navigation"

export function ProfileSettings() {
  const { dispatch } = useAppContext()
  const router = useRouter()

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
    router.push("/login")
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-muted-foreground" />
            <span className="text-card-foreground">Notifications</span>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-muted-foreground" />
            <span className="text-card-foreground">Dark Mode</span>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-card-foreground hover:bg-accent">
            <Shield size={20} className="mr-3" />
            Privacy & Security
          </Button>

          <Button variant="ghost" className="w-full justify-start text-card-foreground hover:bg-accent">
            <HelpCircle size={20} className="mr-3" />
            Help & Support
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
