import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UseMutationOptions } from '@tanstack/react-query'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

type Variables = {
  id: string
}

interface DeleteListOptions {
  onSuccess?: (deletedList: { success: boolean; id: string }) => void
  onError?: (error: Error, listId: string) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

export function useDeleteList<TData = { success: boolean; id: string }>(
  options?: UseMutationOptions<TData, Error, Variables> & DeleteListOptions,
) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to delete list',
    onSuccess,
    onError,
    ...mutationOptions
  } = options || {}

  const { mutate, mutateAsync, ...rest } = useMutation<TData, Error, Variables>(
    {
      mutationFn: (variables: Variables) =>
        authenticatedFetch<TData>(`/lists/${variables.id}`, {
          method: 'DELETE',
        }),
      onMutate: async (variables) => {
        // Cancel any outgoing refetches to avoid overwriting our optimistic update
        await queryClient.cancelQueries({ queryKey: ['lists'] })
        await queryClient.cancelQueries({ queryKey: ['lists', variables.id] })

        // Get a snapshot of the current state
        const previousLists = queryClient.getQueryData(['lists'])

        // Optimistically update the cache
        if (previousLists) {
          queryClient.setQueryData(['lists'], (old: any) => {
            if (!old || !old.data) return old
            return {
              ...old,
              data: old.data.filter((list: any) => list.id !== variables.id),
            }
          })
        }

        // Remove the specific list query
        queryClient.removeQueries({ queryKey: ['lists', variables.id] })

        // Return the snapshot for rollback in case of error
        return { previousLists }
      },

      onSuccess: (data) => {
        // Show success toast
        if (showToasts) {
          toast.success('List deleted successfully')
        }

        // Invalidate and refetch lists to ensure UI is up-to-date
        if (invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: ['lists'] })
        }

        // Call the onSuccess callback
        if (onSuccess) {
          onSuccess(data as unknown as { success: boolean; id: string })
        }
      },
      onError: (err, _variables, context: any) => {
        console.error('List delete error:', err)

        // Roll back to the previous state if we have it
        if (context?.previousLists) {
          queryClient.setQueryData(['lists'], context.previousLists)
        }

        if (showToasts) {
          toast.error(errorMessage)
        }

        if (onError) {
          onError(err, _variables.id)
        }
      },

      // Always refetch after error or success
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['lists'] })
      },
      ...mutationOptions,
    },
  )

  return {
    deleteList: mutate,
    deleteListAsync: mutateAsync,
    ...rest,
  }
}
