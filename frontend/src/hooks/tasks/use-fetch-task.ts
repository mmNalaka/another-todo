import { queryOptions, useQuery } from '@tanstack/react-query'
import type { Task } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'

export const taskQueryOptions = (taskId: string) =>
  queryOptions({
    queryKey: ['tasks', taskId],
    queryFn: () => authenticatedFetch<{ data: Task }>(`/tasks/${taskId}`),
  })

export function useFetchTask(taskId: string) {
  const enabled = !!taskId

  const { data, isLoading, error, ...rest } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => authenticatedFetch<{ data: Task }>(`/tasks/${taskId}`),
    enabled,
  })

  return {
    fullTask: data?.data || null,
    isLoading,
    error,
    ...rest,
  }
}
