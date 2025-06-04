import { useQuery } from '@tanstack/react-query'
import { useWebSocket } from './use-websocket'

// User presence information type
export interface PresenceUser {
  userId: string
  userName: string
  lastActivity: number
}

export interface UsePresenceOptions {
  listId: string
  enabled?: boolean
}

/**
 * React hook for tracking presence of users in a list
 */
export function usePresence({ listId, enabled = true }: UsePresenceOptions) {
  // Set up WebSocket connection for this list
  const { status } = useWebSocket({
    listId,
    enabled
  })

  // Use TanStack Query to store and access presence data
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['presence', listId],
    // Initially there are no users
    initialData: [],
    // This query is managed via WebSocket, no fetch needed
    queryFn: () => [],
    // Only enable if WebSocket is enabled and we have a list ID
    enabled: enabled && !!listId
  })

  return {
    users: users as Array<PresenceUser>,
    isLoading,
    connectionStatus: status
  }
}
