import type { ListResp } from '@/lib/types'
import { useApiQuery } from '@/hooks/use-api-query'

export function useFetchLists() {
  // Fetch lists for task list references
  const { data, isLoading, error } = useApiQuery<ListResp>(['lists'], '/lists')

  const lists = data?.data || []

  return {
    lists,
    isLoading,
    error,
  }
}
