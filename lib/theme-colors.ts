export const themeColors = {
  light: {
    // Obsidian Depths Light Theme
    background: "oklch(0.98 0.005 240)", // Very light blue-gray
    foreground: "oklch(0.15 0.02 240)", // Deep blue-black
    card: "oklch(0.96 0.008 240)", // Light card background
    cardForeground: "oklch(0.15 0.02 240)",
    popover: "oklch(0.96 0.008 240)",
    popoverForeground: "oklch(0.15 0.02 240)",
    primary: "oklch(0.45 0.12 240)", // Deep blue primary
    primaryForeground: "oklch(0.98 0.005 240)",
    secondary: "oklch(0.92 0.01 240)", // Light gray-blue
    secondaryForeground: "oklch(0.25 0.02 240)",
    muted: "oklch(0.94 0.008 240)",
    mutedForeground: "oklch(0.5 0.02 240)",
    accent: "oklch(0.92 0.01 240)",
    accentForeground: "oklch(0.25 0.02 240)",
    destructive: "oklch(0.55 0.15 15)", // Warm red
    destructiveForeground: "oklch(0.98 0.005 240)",
    border: "oklch(0.88 0.01 240)",
    input: "oklch(0.94 0.008 240)",
    ring: "oklch(0.45 0.12 240)",
  },
  dark: {
    // Obsidian Depths Dark Theme
    background: "oklch(0.08 0.015 240)", // Deep blue-black
    foreground: "oklch(0.92 0.008 240)", // Light blue-white
    card: "oklch(0.12 0.02 240)", // Dark blue card
    cardForeground: "oklch(0.92 0.008 240)",
    popover: "oklch(0.12 0.02 240)",
    popoverForeground: "oklch(0.92 0.008 240)",
    primary: "oklch(0.65 0.15 240)", // Bright blue primary
    primaryForeground: "oklch(0.08 0.015 240)",
    secondary: "oklch(0.18 0.025 240)", // Dark blue-gray
    secondaryForeground: "oklch(0.85 0.01 240)",
    muted: "oklch(0.15 0.02 240)",
    mutedForeground: "oklch(0.6 0.015 240)",
    accent: "oklch(0.18 0.025 240)",
    accentForeground: "oklch(0.92 0.008 240)",
    destructive: "oklch(0.6 0.18 15)", // Warm red
    destructiveForeground: "oklch(0.92 0.008 240)",
    border: "oklch(0.22 0.025 240)",
    input: "oklch(0.15 0.02 240)",
    ring: "oklch(0.65 0.15 240)",
  },
} as const

export type ThemeMode = "light" | "dark"
