import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UseMutationOptions } from '@tanstack/react-query'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

type Variables = {
  id: string
  isFrozen: boolean
}

interface ToggleListFrozenOptions {
  onSuccess?: (updatedList: any) => void
  onError?: (error: Error, listId: string) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

export function useToggleListFrozen<TData = any>(
  options?: UseMutationOptions<TData, Error, Variables> & ToggleListFrozenOptions,
) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to update list',
    onSuccess,
    onError,
    ...mutationOptions
  } = options || {}

  const { mutate, mutateAsync, ...rest } = useMutation<TData, Error, Variables>(
    {
      mutationFn: (variables: Variables) =>
        authenticatedFetch<TData>(`/lists/${variables.id}/toggle-frozen`, {
          method: 'PATCH',
          body: JSON.stringify({ isFrozen: variables.isFrozen }),
        }),
      onSuccess: (data, variables) => {
        if (invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: ['lists', variables.id] })
          queryClient.invalidateQueries({ queryKey: ['lists'] })
        }

        if (showToasts) {
          toast.success(
            variables.isFrozen
              ? 'List frozen successfully'
              : 'List unfrozen successfully'
          )
        }

        if (onSuccess) {
          onSuccess(data)
        }
      },
      onError: (err, variables) => {
        console.error('List toggle frozen error:', err)
        
        if (showToasts) {
          toast.error(errorMessage)
        }

        if (onError) {
          onError(err, variables.id)
        }
      },
      ...mutationOptions,
    },
  )

  return {
    toggleListFrozen: mutate,
    toggleListFrozenAsync: mutateAsync,
    ...rest,
  }
}
