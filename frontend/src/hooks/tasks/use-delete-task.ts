import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Task } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

interface DeleteTaskOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

export function useDeleteTask(options?: DeleteTaskOptions) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to delete task'
  } = options || {}

  const { mutate, mutateAsync, ...rest } = useMutation({
    mutationFn: (taskId: string) =>
      authenticatedFetch<Task>(`/tasks/${taskId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      }

      if (showToasts) {
        toast.success('Task deleted successfully')
      }

      if (options?.onSuccess) {
        options.onSuccess()
      }
    },
    onError: (err) => {
      console.error('Task deletion error:', err)
      
      if (showToasts) {
        toast.error(errorMessage)
      }

      if (options?.onError) {
        options.onError(err)
      }
    },
  })

  return {
    deleteTask: mutate,
    deleteTaskAsync: mutateAsync,
    ...rest,
  }
}