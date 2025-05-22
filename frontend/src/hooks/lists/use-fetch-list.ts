import { queryOptions } from '@tanstack/react-query'
import type { List } from '@/lib/types'
import { useApiQuery } from '@/hooks/use-api-query'
import { authenticatedFetch } from '@/lib/api/query-client'

export const listQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', { postId }],
    queryFn: () => authenticatedFetch<{ data: List }>(`/lists/${postId}`),
  })

export function useFetchList(listId?: string) {
  const enabled = !!listId

  const {
    data: listData,
    isLoading,
    error,
  } = useApiQuery<{ data: List }>(
    ['list', listId as string],
    `/lists/${listId}`,
    { enabled },
  )

  return {
    list: listData?.data || null,
    isLoading,
    error,
  }
}
