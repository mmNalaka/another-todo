import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateListInput, List } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

interface CreateListOptions {
  onSuccess?: (createdList: List) => void
  onError?: (error: Error, listData: CreateListInput) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

export function useCreateList(options?: CreateListOptions) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to create list',
  } = options || {}

  const { mutate, mutateAsync, isPending, error, ...rest } = useMutation({
    mutationFn: (listData: CreateListInput) => {
      if (!listData.title.trim()) {
        throw new Error('List title cannot be empty')
      }
      return authenticatedFetch<{ data: List }>('/lists', {
        method: 'POST',
        body: JSON.stringify(listData),
      })
    },
    onSuccess: (data) => {
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['lists'] })
      }

      if (showToasts) {
        toast.success('List created successfully')
      }

      if (options?.onSuccess) {
        options.onSuccess(data.data)
      }
    },
    onError: (err, variables) => {
      console.error('List creation error:', err)
      
      if (showToasts) {
        toast.error(errorMessage)
      }

      if (options?.onError) {
        options.onError(err, variables)
      }
    },
  })

  return {
    createList: mutate,
    createListAsync: mutateAsync,
    isCreating: isPending,
    error,
    ...rest,
  }
}
