import axios from 'axios'

export const TOKEN_KEY = 'ap2a_token'
export const USER_KEY = 'ap2a_user'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/** Extrait un message d'erreur exploitable d'une réponse API (clé `erreur` côté backend). */
export function apiErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { erreur?: string; detail?: string } | undefined
    return data?.erreur ?? data?.detail ?? fallback
  }
  return fallback
}

/** Extrait le code d'erreur machine-readable (clé `code`) d'une réponse API, pour brancher sur un cas précis. */
export function apiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { code?: string } | undefined)?.code
  }
  return undefined
}

/**
 * Ouvre un téléchargement direct (fichier en `Content-Disposition: attachment`).
 * Un lien ouvert par le navigateur ne peut pas porter l'en-tête Authorization :
 * on demande au backend un lien signé de courte durée (~1 min), valable pour
 * ce seul chemin et ce seul compte - le jeton de session n'apparaît jamais
 * dans l'URL (ni dans les journaux, l'historique ou l'en-tête Referer).
 */
export async function openDownload(path: string, extraParams: Record<string, string> = {}) {
  const { data } = await apiClient.post<{ telechargement: string }>('/telechargement/lien/', { chemin: path })
  const base = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
  const params = new URLSearchParams({ ...extraParams, telechargement: data.telechargement })
  // Navigation dans l'onglet courant : la réponse étant une pièce jointe, la
  // page reste affichée (et pas de blocage de popup après un appel asynchrone).
  window.location.assign(`${base}${path}?${params.toString()}`)
}

/**
 * La plupart des champs image du backend (photo membre/participant/compte)
 * renvoient un chemin relatif au serveur Django (ex. "/media/photos/x.jpg"),
 * invalide tel quel depuis l'origine du frontend. On le préfixe avec
 * l'origine de l'API. Les URLs déjà absolues (ex. logo association, qui
 * utilise `request.build_absolute_uri`) passent inchangées.
 */
export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  const base = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
  const origin = base.replace(/\/api\/?$/, '')
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
}
