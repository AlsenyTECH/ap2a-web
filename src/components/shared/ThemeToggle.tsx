import { Check, Palette, Moon, Sun, Disc, Compass } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { ACCENT_OPTIONS, THEME_OPTIONS, useTheme } from '@/lib/theme/ThemeContext'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { mode, accent, setMode, setAccent, toggleMode } = useTheme()

  const currentTheme = THEME_OPTIONS.find((t) => t.value === mode)

  return (
    <div className="flex items-center gap-1.5">
      {/* Quick Toggle 1-Click Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        title={`Thème actuel : ${currentTheme?.label ?? mode} (Cliquer pour basculer)`}
        className="rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/80 size-8 transition-colors"
      >
        {mode === 'light' && <Sun className="size-4 text-amber-500" />}
        {mode === 'slate' && <Moon className="size-4 text-emerald-400" />}
        {mode === 'oled' && <Disc className="size-4 text-zinc-100" />}
        {mode === 'navy' && <Compass className="size-4 text-blue-400" />}
      </Button>

      {/* Complete Theme & Color Palette Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="Sélecteur complet de Thèmes & Couleurs"
            className="rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/80 size-8 transition-colors"
          >
            <Palette className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-2xl p-2 rounded-xl">
          {/* Main Theme Selection */}
          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Ambiance & Thème Global
          </DropdownMenuLabel>
          <div className="space-y-1 mb-2">
            {THEME_OPTIONS.map((option) => {
              const isSelected = mode === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-all duration-150',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-4 rounded-full border border-border shrink-0 shadow-xs"
                      style={{ backgroundColor: option.swatch }}
                    />
                    <div>
                      <div className="leading-tight">{option.label}</div>
                      <div className={cn('text-[10px]', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {option.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="size-3.5 shrink-0" />}
                </button>
              )
            })}
          </div>

          <DropdownMenuSeparator className="bg-border" />

          {/* Accent Color Palette Selection */}
          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 mt-1">
            Couleur d'Accent
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {ACCENT_OPTIONS.map((option) => {
              const isSelected = accent === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setAccent(option.value)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors',
                    isSelected
                      ? 'bg-muted font-bold text-foreground ring-1 ring-primary'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    className="size-3 rounded-full shrink-0 border border-border"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <span className="truncate text-[11px]">{option.label}</span>
                </button>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
