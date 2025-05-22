import { useApiMutation } from '@/hooks/use-api-query'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

type CreateListInput = {
  title: string
}

export function useCreateList() {
  const createListMutation = useApiMutation<any, CreateListInput>('/lists', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })

  const createList = async (title: string) => {
    if (!title.trim()) return null

    try {
      const result = await createListMutation.mutate({ title: title.trim() })
      return result
    } catch (error) {
      console.error('Failed to create list:', error)
      return null
    }
  }

  return {
    createList,
    isCreating: createListMutation.isPending,
    error: createListMutation.error,
  }
}
