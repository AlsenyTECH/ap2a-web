import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'slate' | 'oled' | 'light' | 'navy'
export type AccentPalette = 'emeraude' | 'dore' | 'bleu' | 'violet'

const MODE_KEY = 'ap2a_theme_mode'
const ACCENT_KEY = 'ap2a_theme_accent'

export interface ThemeOption {
  value: ThemeMode
  label: string
  description: string
  swatch: string
  bgPreview: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'slate',
    label: 'Sombre Ardoise',
    description: 'Graphite élégant & moderne',
    swatch: '#1e293b',
    bgPreview: '#090d16',
  },
  {
    value: 'oled',
    label: 'Tout Noir (OLED)',
    description: 'Noir profond ultra-contrasté',
    swatch: '#000000',
    bgPreview: '#000000',
  },
  {
    value: 'light',
    label: 'Blanc / Clair',
    description: 'Interface lumineuse & épurée',
    swatch: '#ffffff',
    bgPreview: '#f8fafc',
  },
  {
    value: 'navy',
    label: 'Bleu Nuit (AP2A)',
    description: 'Style institutionnel & souverain',
    swatch: '#0a1728',
    bgPreview: '#07111e',
  },
]

export const ACCENT_OPTIONS: { value: AccentPalette; label: string; swatch: string }[] = [
  { value: 'emeraude', label: 'Émeraude AP2A', swatch: '#059669' },
  { value: 'dore', label: 'Or & Ambre', swatch: '#d97706' },
  { value: 'bleu', label: 'Bleu Royal', swatch: '#2563eb' },
  { value: 'violet', label: 'Violet Majesté', swatch: '#7c3aed' },
]

interface ThemeContextValue {
  mode: ThemeMode
  accent: AccentPalette
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentPalette) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(MODE_KEY)
  if (stored === 'oled' || stored === 'light' || stored === 'navy' || stored === 'slate') {
    return stored
  }
  // Migration fallback from old 'dark' or 'light'
  if (stored === 'dark') return 'slate'
  return 'slate' // Default to modern dark slate
}

function readStoredAccent(): AccentPalette {
  const stored = localStorage.getItem(ACCENT_KEY)
  return ACCENT_OPTIONS.some((o) => o.value === stored) ? (stored as AccentPalette) : 'emeraude'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [accent, setAccentState] = useState<AccentPalette>(readStoredAccent)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    if (mode === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    localStorage.setItem(MODE_KEY, mode)
  }, [mode])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent])

  function setMode(next: ThemeMode) {
    setModeState(next)
  }

  function setAccent(next: AccentPalette) {
    setAccentState(next)
  }

  function toggleMode() {
    setModeState((prev) => {
      if (prev === 'slate') return 'oled'
      if (prev === 'oled') return 'light'
      if (prev === 'light') return 'navy'
      return 'slate'
    })
  }

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  return ctx
}
