"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, DollarSign, User } from "lucide-react"
import { ROUTES } from "@/constants"

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: ROUTES.ACTIVITIES,
      icon: Activity,
      label: "Activities",
    },
    {
      href: ROUTES.FINANCES,
      icon: DollarSign,
      label: "Finances",
    },
    {
      href: ROUTES.PROFILE,
      icon: User,
      label: "Profile",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive ? "text-primary bg-accent/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
