// src/components/ui/theme-provider.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system", // Use a default placeholder initially
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  // 1. Initialize state WITHOUT accessing localStorage directly
  //    Start with the defaultTheme or a temporary state.
  const [theme, setTheme] = useState<Theme>(() => {
      // On the server, or if localStorage is unavailable for any reason,
      // return the default theme. We'll check localStorage properly in useEffect.
      return defaultTheme;
  });

  // 2. Use useEffect to read from localStorage ONLY on the client-side after mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
        // If a theme is found in localStorage, update the state
        setTheme(storedTheme);
    } else {
        // Optional: If nothing is stored, ensure the state is the default.
        // This line might be redundant if the initial state is already defaultTheme,
        // but it's safe to include.
        setTheme(defaultTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount


  // 3. This useEffect applies the theme class (runs whenever 'theme' changes)
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    root.classList.add(effectiveTheme);

    // Optional: Also store the resolved theme if it was 'system' initially?
    // Decide if you want localStorage to store "system" or the resolved "light"/"dark".
    // The current `setTheme` function below only stores what the user explicitly selects.

  }, [theme]) // Depend on theme

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Always store the chosen theme (including "system") in localStorage
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme) // Update the React state
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}