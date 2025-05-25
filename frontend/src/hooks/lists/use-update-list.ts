import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { List } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

type Variables = {
  id: string
} & Partial<List>

interface UpdateListOptions {
  onSuccess?: (updatedList: List) => void
  onError?: (error: Error, listData: Partial<List>) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

export function useUpdateList<TData = List>(
  options?: UseMutationOptions<TData, Error, Variables> & UpdateListOptions
) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to update list',
    onSuccess,
    onError,
    ...mutationOptions
  } = options || {}

  const { mutate, mutateAsync, ...rest } = useMutation<TData, Error, Variables>({
    mutationFn: (variables: Variables) =>
      authenticatedFetch<TData>(`/lists/${variables.id}`, {
        method: 'PATCH',
        body: JSON.stringify(variables),
      }),
    onSuccess: (data, variables) => {
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['lists', variables.id] })
        queryClient.invalidateQueries({ queryKey: ['lists'] })
      }

      if (showToasts) {
        toast.success('List updated successfully')
      }

      if (onSuccess) {
        onSuccess(data as unknown as List)
      }
    },
    onError: (err, variables) => {
      console.error('List update error:', err)
      
      if (showToasts) {
        toast.error(errorMessage)
      }

      if (onError) {
        onError(err, variables as Partial<List>)
      }
    },
    ...mutationOptions,
  })

  return {
    updateList: mutate,
    updateListAsync: mutateAsync,
    ...rest,
  }
}