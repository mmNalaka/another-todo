import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { Task } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

type Variables = {
  id: string
} & Partial<Task>

interface UpdateTaskOptions {
  onSuccess?: (updatedTask: Task) => void
  onError?: (error: Error, taskData: Partial<Task>) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

export function useUpdateTask<TData = Task>(
  options?: UseMutationOptions<TData, Error, Variables> & UpdateTaskOptions
) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to update task',
    ...mutationOptions
  } = options || {}

  const { mutate, mutateAsync, ...rest } = useMutation<TData, Error, Variables>({
    mutationFn: (variables: Variables) =>
      authenticatedFetch<TData>(`/tasks/${variables.id}`, {
        method: 'PATCH',
        body: JSON.stringify(variables),
      }),
    onSuccess: (data, variables) => {
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
      }

      if (showToasts) {
        toast.success('Task updated successfully')
      }

      if (options?.onSuccess) {
        options.onSuccess(data as unknown as Task)
      }
    },
    onError: (err, variables) => {
      console.error('Task update error:', err)
      
      if (showToasts) {
        toast.error(errorMessage)
      }

      if (options?.onError) {
        options.onError(err, variables as Partial<Task>)
      }
    },
    ...mutationOptions,
  })

  return {
    updateTask: mutate,
    updateTaskAsync: mutateAsync,
    ...rest,
  }
}
