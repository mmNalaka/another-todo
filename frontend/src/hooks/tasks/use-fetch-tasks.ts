import { useQuery } from '@tanstack/react-query'
import type { Task } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'

export function useFetchTasks() {
  // Fetch tasks from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => authenticatedFetch<{ data: Array<Task> }>('/tasks'),
  })
  
  const tasks = data?.data || []

  return {
    tasks,
    isLoading,
    error,
    refetch,
  }
}