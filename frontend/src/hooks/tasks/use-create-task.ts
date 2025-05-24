import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { CreateTaskInput, Task } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

interface CreateTaskOptions {
  onSuccess?: (createdTask: Task) => void
  onError?: (error: Error, taskData: CreateTaskInput) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

export function useCreateTask<TData = Task>(
  options?: UseMutationOptions<TData, Error, CreateTaskInput> & CreateTaskOptions
) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to create task',
    ...mutationOptions
  } = options || {}

  const { mutate, mutateAsync, ...rest } = useMutation<TData, Error, CreateTaskInput>({
    mutationFn: (taskData: CreateTaskInput) =>
      authenticatedFetch<TData>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),
    onSuccess: (data, variables) => {
      console.log('Task created successfully:', variables)
      if (invalidateQueries) {
          // Always invalidate all tasks
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
          
          // Invalidate the specific list if a listId is provided
          if (variables.listId) {
            // Invalidate both the lists collection and the specific list
            queryClient.invalidateQueries({ queryKey: ['lists'] })
            queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] })
          }
          
          // Invalidate the parent task if a parentTaskId is provided
          if (variables.parentTaskId) {
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.parentTaskId] })
          }
      }

      if (showToasts) {
        toast.success('Task created successfully')
      }

      if (options?.onSuccess) {
        options.onSuccess(data as unknown as Task)
      }
    },
    onError: (err, variables) => {
      console.error('Task creation error:', err)
      
      if (showToasts) {
        toast.error(errorMessage)
      }

      if (options?.onError) {
        options.onError(err, variables)
      }
    },
    ...mutationOptions,
  })

  return {
    createTask: mutate,
    createTaskAsync: mutateAsync,
    ...rest,
  }
}
