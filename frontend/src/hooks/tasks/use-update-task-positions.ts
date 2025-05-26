import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { Task } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

type TaskPosition = {
  id: string
  position: number
}

type Variables = {
  listId: string
  tasks: Array<TaskPosition>
  parentId?: string
}

interface UpdateTaskPositionsOptions {
  onSuccess?: (updatedTasks: Array<Task>) => void
  onError?: (error: Error, taskData: Variables) => void
  showToasts?: boolean
  invalidateQueries?: boolean
  errorMessage?: string
}

// Define the context type for optimistic updates
type MutationContext = {
  previousList?: unknown
  previousTasks?: unknown
  isAllTasksView: boolean
}

export function useUpdateTaskPositions<TData = Array<Task>>(
  options?: UseMutationOptions<TData, Error, Variables, MutationContext> &
    UpdateTaskPositionsOptions,
) {
  const {
    showToasts = true,
    invalidateQueries = true,
    errorMessage = 'Failed to update task positions',
    onSuccess,
    onError,
    ...mutationOptions
  } = options || {}

  const { mutate, mutateAsync, ...rest } = useMutation<TData, Error, Variables, MutationContext>(
    {
      mutationFn: (variables: Variables) => {
        return authenticatedFetch<TData>(`/tasks/reorder`, {
          method: 'PATCH',
          body: JSON.stringify(variables),
        })
      },
      // Use optimistic updates to prevent UI jitter
      onMutate: async (variables) => {
        const isAllTasksView = variables.listId === 'all-tasks'
        
        if (isAllTasksView) {
          // For all-tasks view
          // Cancel any outgoing refetches
          await queryClient.cancelQueries({ queryKey: ['tasks'] })
          
          // Snapshot the previous value
          const previousTasks = queryClient.getQueryData(['tasks'])
          
          // Optimistically update the tasks with the new positions
          queryClient.setQueryData(['tasks'], (old: any) => {
            if (!old || !old.data) return old
            
            // Create a map of task IDs to their new positions
            const positionMap = new Map(
              variables.tasks.map(task => [task.id, task.position])
            )
            
            // Create a copy of the tasks with updated positions
            return {
              ...old,
              data: old.data.map((task: any) => {
                // If this task's position was updated, use the new position
                if (positionMap.has(task.id)) {
                  return {
                    ...task,
                    position: positionMap.get(task.id)
                  }
                }
                return task
              }).sort((a: any, b: any) => a.position - b.position)
            }
          })
          
          // Return the snapshot so we can rollback if needed
          return { previousTasks, isAllTasksView }
        } else {
          // For list-specific view
          // Cancel any outgoing refetches
          await queryClient.cancelQueries({ queryKey: ['lists', variables.listId] })
          
          // Snapshot the previous value
          const previousList = queryClient.getQueryData(['lists', variables.listId])
          
          // Optimistically update the list with the new task positions
          queryClient.setQueryData(['lists', variables.listId], (old: any) => {
            if (!old || !old.data || !old.data.tasks) return old
            
            // Create a map of task IDs to their new positions
            const positionMap = new Map(
              variables.tasks.map(task => [task.id, task.position])
            )
            
            // Create a copy of the list with updated task positions
            return {
              ...old,
              data: {
                ...old.data,
                tasks: old.data.tasks.map((task: any) => {
                  // If this task's position was updated, use the new position
                  if (positionMap.has(task.id)) {
                    return {
                      ...task,
                      position: positionMap.get(task.id)
                    }
                  }
                  return task
                }).sort((a: any, b: any) => a.position - b.position)
              }
            }
          })
          
          // Return the snapshot so we can rollback if needed
          return { previousList, isAllTasksView: false }
        }
      },
      onSuccess: (data) => {
        if (showToasts) {
          toast.success('Task order updated successfully')
        }

        if (onSuccess) {
          onSuccess(data as unknown as Array<Task>)
        }
      },
      onError: (err, variables, context: MutationContext | undefined) => {
        // If we have the previous data, roll back to it based on view type
        if (context) {
          if (context.isAllTasksView && context.previousTasks) {
            queryClient.setQueryData(['tasks'], context.previousTasks)
          } else if (!context.isAllTasksView && context.previousList) {
            queryClient.setQueryData(['lists', variables.listId], context.previousList)
          }            
        }
        
        console.error('Task position update error:', err)

        if (showToasts) {
          toast.error(errorMessage)
        }

        if (onError) {
          onError(err, variables)
        }
      },
      // Always refetch after error or success to ensure data consistency
      onSettled: (_data, _error, variables) => {
        if (invalidateQueries) {
          const isAllTasksView = variables.listId === 'all-tasks'
          
          if (isAllTasksView) {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
          } else {
            queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] })
          }

          // If we have a parent id, invalidate the subtasks query
          if (variables.parentId) {
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.parentId] })
          }
        }
      },
      ...mutationOptions,
    },
  )

  return {
    updateTaskPositions: mutate,
    updateTaskPositionsAsync: mutateAsync,
    ...rest,
  }
}
