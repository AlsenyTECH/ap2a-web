import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value
}

export function formatDate(value: string | Date | null | undefined, pattern = 'd MMM yyyy'): string {
  if (!value) return '—'
  try {
    return format(toDate(value), pattern, { locale: fr })
  } catch {
    return '—'
  }
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "d MMM yyyy 'à' HH:mm")
}

export function formatTime(value: string | Date | null | undefined): string {
  return formatDate(value, 'HH:mm')
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—'
  try {
    return formatDistanceToNow(toDate(value), { locale: fr, addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatMoney(value: string | number | null | undefined, currency = 'FCFA'): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(n)) return '—'
  return `${n.toLocaleString('fr-FR')} ${currency}`
}

export function initials(nom: string, prenom: string): string {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase()
}
