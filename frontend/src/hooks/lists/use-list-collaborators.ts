import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { authenticatedFetch } from '@/lib/api/query-client'

type AddCollaboratorInput = {
  email: string
  role: 'editor' | 'viewer'
}

type UpdateCollaboratorRoleInput = {
  role: 'editor' | 'viewer'
}

export function useAddCollaborator(listId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddCollaboratorInput) => {
      return await authenticatedFetch(
        `/lists/${listId}/collaborators`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )
    },
    onSuccess: () => {
      // Invalidate the list query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['lists', listId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add collaborator')
    },
  })
}

export function useUpdateCollaboratorRole(listId: string, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCollaboratorRoleInput) => {
      return await authenticatedFetch(
        `/lists/${listId}/collaborators/${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )
    },
    onSuccess: () => {
      // Invalidate the list query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['lists', listId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update collaborator role')
    },
  })
}

export function useRemoveCollaborator(listId: string, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await authenticatedFetch(
        `/lists/${listId}/collaborators/${userId}`,
        {
          method: 'DELETE',
        }
      )
    },
    onSuccess: () => {
      // Invalidate the list query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['lists', listId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove collaborator')
    },
  })
}
