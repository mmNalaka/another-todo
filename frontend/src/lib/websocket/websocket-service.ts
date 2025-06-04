import { toast } from 'sonner'
import type { Task } from '@/lib/types'
import { env } from '@/env'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

// WebSocket event types
type WebSocketMessage = {
  type: string
  [key: string]: any
}

// WebSocket connection status
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
  ERROR = 'error',
}

// Listener type for subscribing to WebSocket events
type MessageListener = (data: any) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private listeners: Map<string, Array<MessageListener>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 2000 // Start with 2 seconds
  private sessionId: string
  private listId: string | null = null
  private status: ConnectionStatus = ConnectionStatus.CLOSED
  private statusListeners: Array<(status: ConnectionStatus) => void> = []

  constructor() {
    // Generate a unique session ID for this browser session
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  // Get the current connection status
  getStatus(): ConnectionStatus {
    return this.status
  }

  // Subscribe to connection status changes
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.push(callback)
    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback)
    }
  }

  // Update connection status and notify listeners
  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.statusListeners.forEach(listener => listener(status))
  }

  // Connect to WebSocket server for a specific list
  connect(listId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.listId === listId) {
      console.log('WebSocket already connected to this list')
      return
    }

    // Clean up any existing connection
    this.disconnect()
    // Store the list ID
    this.listId = listId

    // Create auth token parameter
    const token = localStorage.getItem('accessToken') // Using accessToken for consistency
    if (!token) {
      console.error('No auth token found, cannot connect to WebSocket')
      return
    }
    

    // Get WebSocket URL with proper API prefix
    const apiUrl = env.VITE_API_URL || window.location.origin
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsBase = apiUrl.replace(/^https?:/, wsProtocol)
    
    // Connect to WebSocket with authentication token and session ID
    const wsUrl = `${wsBase}/api/ws?session=${this.sessionId}&listId=${listId}&token=${encodeURIComponent(token)}`
    
    this.setStatus(ConnectionStatus.CONNECTING)
    this.ws = new WebSocket(wsUrl)
    
    // Set up connection headers with authorization token
    this.ws.onopen = () => {
      console.log('WebSocket connection opened')
      this.setStatus(ConnectionStatus.OPEN)
      this.reconnectAttempts = 0
      this.reconnectInterval = 2000
      
      // Send auth message with token
      this.sendMessage({
        type: 'auth',
        token: token
      })
      
      // Send presence join message
      this.sendMessage({
        type: 'presence:join',
        userName: localStorage.getItem('userName') || 'Unknown user'
      })
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log(`[WebSocket] Parsed message:`, data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket connection closed')
      this.setStatus(ConnectionStatus.CLOSED)
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.setStatus(ConnectionStatus.ERROR)
    }
  }

  // Send a message through the WebSocket connection
  sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: WebSocketMessage): void {
    try {
      switch (data.type) {
        case 'presence:update':
          queryClient.setQueryData(['presence', this.listId], data.users || [])
          this.notify('presence:update', data)
          break

        case 'task:create':
          if (data.task) {
            this.handleTaskCreate(data.task)
            this.notify('task:create', data)
          }
          break

        case 'task:update':
          if (data.task) {
            this.handleTaskUpdate(data.task)
            this.notify('task:update', data)
          }
          break

        case 'task:delete':
          if (data.taskId) {
            this.handleTaskDelete(data.taskId)
            this.notify('task:delete', data)
          }
          break

        case 'task:reorder':
          if (data.tasks?.length) {
            this.handleTaskReorder(data.tasks)
            this.notify('task:reorder', data)
          }
          break

        default:
          console.warn('[WebSocket] Unknown message type:', data.type)
      }
    } catch (error) {
      console.error(`[WebSocket] Error handling ${data.type} event:`, error)
    }
  }

  // Handle task create event - update TanStack Query cache
  private handleTaskCreate(task: Task): void {
    // Simply invalidate the appropriate queries
    if (task.listId) {
      queryClient.invalidateQueries({ queryKey: ['lists', task.listId] })
    }
    
    if (task.parentTaskId) {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.parentTaskId] })
    }
  }

  // Handle task update event - update TanStack Query cache
  private handleTaskUpdate(task: Task): void {
    if (!task.parentTaskId) {
      queryClient.invalidateQueries({ queryKey: ['lists', task.listId] })
    }
    queryClient.invalidateQueries({ queryKey: ['tasks', task.parentTaskId] })
    queryClient.setQueryData(['task', task.id], { data: task })
  }

  // Handle task delete event - update TanStack Query cache
  private handleTaskDelete(taskId: string): void {
    queryClient.invalidateQueries({ queryKey: ['lists', this.listId] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    queryClient.removeQueries({ queryKey: ['task', taskId] })
  }

  // Handle task reorder event - update TanStack Query cache
  private handleTaskReorder(tasks: Array<Task>): void {
    const parentId = tasks[0].parentTaskId
    if (!parentId) {
      queryClient.invalidateQueries({ queryKey: ['lists', this.listId] })
    }
    queryClient.invalidateQueries({ queryKey: ['tasks', parentId] })
  }

  // Subscribe to a specific WebSocket event type
  subscribe(eventType: string, callback: MessageListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    
    const eventListeners = this.listeners.get(eventType)!
    eventListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType) || []
      this.listeners.set(
        eventType,
        listeners.filter((cb) => cb !== callback)
      )
    }
  }

  // Send a notification to the user
  private notify(eventType: string, data: any): void {
    const message = `${eventType} by ${data.userName ? data.userName : 'Unknown user'}`
    toast(message)
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.ws) {
      // Send presence leave message if connection is open
      if (this.ws.readyState === WebSocket.OPEN && this.listId) {
        this.sendMessage({
          type: 'presence:leave',
        })
      }

      this.ws.close()
      this.ws = null
      this.setStatus(ConnectionStatus.CLOSED)
    }
    
    this.listId = null
  }

  // Attempt to reconnect after connection loss
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached')
      return
    }

    if (!this.listId) {
      console.log('No list ID for reconnection')
      return
    }

    this.reconnectAttempts++
    
    // Use exponential backoff for reconnection (2s, 4s, 8s, 16s, 32s)
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      console.log(`Reconnecting to WebSocket for list ${this.listId}`)
      this.connect(this.listId!)
    }, delay)
  }
}

// Export a singleton instance
export const wsService = new WebSocketService()
