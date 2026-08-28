import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard'

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.stats })
}

export function useStatistiques() {
  return useQuery({ queryKey: ['dashboard', 'statistiques'], queryFn: dashboardApi.statistiques })
}

export function useJournal(
  params: { type_action?: string; date_debut?: string; date_fin?: string; page?: number } = {},
) {
  return useQuery({
    queryKey: ['dashboard', 'journal', params],
    queryFn: () => dashboardApi.journal(params),
  })
}

export function useRapportControleAcces(
  params: { id_controleur?: number; date_debut?: string; date_fin?: string } = {},
) {
  return useQuery({
    queryKey: ['dashboard', 'rapport-controle-acces', params],
    queryFn: () => dashboardApi.rapportControleAcces(params),
  })
}
