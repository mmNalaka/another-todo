import { createContext, useContext, type ReactNode } from 'react'
import { wsService, ConnectionStatus } from '@/lib/websocket/websocket-service'

interface WebSocketContextType {
  connect: (listId: string) => void
  disconnect: () => void
  getStatus: () => ConnectionStatus
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
}

/**
 * Provider component for WebSocket functionality
 * - Automatically connects to WebSocket when a list ID is provided
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const contextValue: WebSocketContextType = {
    connect: wsService.connect.bind(wsService),
    disconnect: wsService.disconnect.bind(wsService),
    getStatus: wsService.getStatus.bind(wsService)
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

/**
 * Hook to access WebSocket context
 */
export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}
