import { useQuery } from '@tanstack/react-query'
import type { Task } from '@/lib/types'
import { authenticatedFetch } from '@/lib/api/query-client'

type TaskFilter = {
  completed?: boolean;
  dueDate?: 'today' | 'all';
}

export function useFetchTasks(filter?: TaskFilter) {
  const queryParams = new URLSearchParams();
  
  if (filter?.completed !== undefined) {
    queryParams.append('completed', filter.completed.toString());
  }
  
  if (filter?.dueDate) {
    queryParams.append('dueDate', filter.dueDate);
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
  
  // Fetch tasks from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => authenticatedFetch<{ data: Array<Task> }>(endpoint),
  })
  
  const tasks = data?.data || []

  return {
    tasks,
    isLoading,
    error,
    refetch,
  }
}