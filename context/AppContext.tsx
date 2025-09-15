"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { User, Activity, Finance } from "@/models"
import { ActivityService } from "@/services/activityService"
import { FinanceService } from "@/services/financeService"
import { AuthService } from "@/services/authService"
import { UserService } from "@/services/userService"

interface AppState {
  user: User | null
  activities: Activity[]
  finances: Finance[]
  isAuthenticated: boolean
  isLoading: boolean
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ACTIVITIES"; payload: Activity[] }
  | { type: "SET_FINANCES"; payload: Finance[] }
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | { type: "ADD_FINANCE"; payload: Finance }
  | { type: "UPDATE_ACTIVITY"; payload: { id: string; updates: Partial<Activity> } }
  | { type: "DELETE_ACTIVITY"; payload: string }
  | { type: "DELETE_FINANCE"; payload: string }
  | { type: "LOGOUT" }

const initialState: AppState = {
  user: null,
  activities: [],
  finances: [],
  isAuthenticated: false,
  isLoading: true,
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload }
    case "SET_FINANCES":
      return { ...state, finances: action.payload }
    case "ADD_ACTIVITY":
      return { ...state, activities: [...state.activities, action.payload] }
    case "ADD_FINANCE":
      return { ...state, finances: [...state.finances, action.payload] }
    case "UPDATE_ACTIVITY":
      return {
        ...state,
        activities: ActivityService.updateActivity(state.activities, action.payload.id, action.payload.updates),
      }
    case "DELETE_ACTIVITY":
      return {
        ...state,
        activities: ActivityService.deleteActivity(state.activities, action.payload),
      }
    case "DELETE_FINANCE":
      return {
        ...state,
        finances: FinanceService.deleteFinance(state.finances, action.payload),
      }
    case "LOGOUT":
      AuthService.logout()
      return {
        ...initialState,
        isLoading: false,
      }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const initializeApp = async () => {
      const isAuth = AuthService.isAuthenticated()
      dispatch({ type: "SET_AUTHENTICATED", payload: isAuth })

      if (isAuth) {
        try {
          const user = await UserService.getCurrentUser()
          if (user) {
            dispatch({ type: "SET_USER", payload: user })
            const activities = ActivityService.getMockActivities()
            const finances = FinanceService.getMockFinances()
            dispatch({ type: "SET_ACTIVITIES", payload: activities })
            dispatch({ type: "SET_FINANCES", payload: finances })
          }
        } catch (error) {
          console.error("Failed to load user data:", error)
          dispatch({ type: "LOGOUT" })
        }
      }

      dispatch({ type: "SET_LOADING", payload: false })
    }

    initializeApp()
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
