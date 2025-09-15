"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/services/authService"
import { useAppContext } from "@/context/AppContext"
import Link from "next/link"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { dispatch } = useAppContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await AuthService.login(credentials)
      if (response.success) {
        dispatch({
          type: "SET_USER",
          payload: { id: "1", firstName: "John", lastName: "Doe", username: credentials.username },
        })
        router.push("/")
      } else {
        setError(response.message || "Login failed")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your productivity app</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            {error && <div className="text-sm text-red-500 text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
            <strong>Demo credentials:</strong>
            <br />
            Username: admin
            <br />
            Password: password123
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
