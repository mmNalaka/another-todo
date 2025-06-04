import { useEffect, useState } from 'react'
import { wsService, ConnectionStatus } from '@/lib/websocket/websocket-service'

export interface UseWebSocketOptions {
  listId: string
  enabled?: boolean
  onMessage?: (data: any) => void
}

export interface UseWebSocketReturn {
  status: ConnectionStatus
  sendMessage: (message: { type: string; [key: string]: any }) => void
  subscribe: (eventType: string, callback: (data: any) => void) => () => void
}

/**
 * React hook for connecting to WebSocket for real-time task list collaboration
 */
export function useWebSocket({
  listId,
  enabled = true,
  onMessage
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>(wsService.getStatus())

  useEffect(() => {
    // Only connect if enabled and we have a list ID
    if (enabled && listId) {
      // Connect to WebSocket
      wsService.connect(listId)

      // Subscribe to status changes
      const unsubscribe = wsService.onStatusChange(setStatus)

      // Return cleanup function
      return () => {
        unsubscribe()
        // Only disconnect if the listId changes or component unmounts
        // This allows us to maintain connection when navigating between routes
        wsService.disconnect()
      }
    }
    
    return () => {}
  }, [listId, enabled])

  // Setup message handler
  useEffect(() => {
    if (!onMessage) return

    // Subscribe to all message types
    const eventTypes = [
      'presence:update',
      'task:create',
      'task:update',
      'task:delete',
      'task:reorder'
    ]
    
    // Subscribe to each event type
    const unsubscribes = eventTypes.map(eventType => 
      wsService.subscribe(eventType, onMessage)
    )
    
    // Return cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [onMessage])

  return {
    status,
    sendMessage: wsService.sendMessage.bind(wsService),
    subscribe: wsService.subscribe.bind(wsService)
  }
}
