import { useQuery } from '@tanstack/react-query'
import type { ListResp } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'

export function useFetchLists() {
  // Fetch lists for task list references
  const { data, isLoading, error } = useQuery({
    queryKey: ['lists'],
    queryFn: () => authenticatedFetch<ListResp>('/lists'),
  })

  const lists = data?.data || []

  return {
    lists,
    isLoading,
    error,
  }
}
