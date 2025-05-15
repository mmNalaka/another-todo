import {
  
  
  useMutation,
  useQuery
} from '@tanstack/react-query'
import type {UseMutationOptions, UseQueryOptions} from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/api/query-client'

// Hook for GET requests
export function useApiQuery<TData>(
  queryKey: Array<string>,
  url: string,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => authenticatedFetch<TData>(url),
    ...options,
  })
}

// Hook for POST requests
export function useApiMutation<TData, TVariables>(
  url: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>,
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables: TVariables) =>
      authenticatedFetch<TData>(url, {
        method: method || 'POST',
        body: JSON.stringify(variables),
      }),
    ...options,
  })
}
