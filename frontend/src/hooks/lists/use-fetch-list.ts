import { queryOptions, useQuery } from '@tanstack/react-query'
import type { List } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'

// Use consistent query key format: ['lists', listId]
export const listQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ['lists', listId],
    queryFn: () => authenticatedFetch<{ data: List }>(`/lists/${listId}`),
  })

export function useFetchList(listId?: string) {
  const enabled = !!listId

  const {
    data: listData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lists', listId!],
    queryFn: () => authenticatedFetch<{ data: List }>(`/lists/${listId}`),
    enabled,
  })

  return {
    list: listData?.data || null,
    isLoading,
    error,
  }
}
