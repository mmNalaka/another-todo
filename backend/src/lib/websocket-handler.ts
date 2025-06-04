import { Context } from 'hono'
import { broadcastToList, handleUserJoined, handleUserLeft } from '../services/websocket.service'

/**
 * Create a WebSocket connection handler
 * @param c - Hono context
 * @returns WebSocket handlers
 */
export const createWebSocketHandler = (c: Context) => {
  // Get authentication details from JWT (already verified by middleware)
  const payload = c.get('jwtPayload')
  const userId = payload.userId
  const userName = payload.email

  // Get session ID and list ID from query params
  const session = c.req.query('session') || ''
  const listId = c.req.query('listId') || ''

  console.log(`User ${userId} (${userName}) connected to list ${listId} with session ${session}`)

  return {
    onMessage(event: any, ws: any) {
      console.log(`Message from client: ${event}`)

      // Convert message data to string safely
      const messageText = typeof event.data === 'string' 
        ? event.data 
        : event.data instanceof Blob 
          ? '[Blob data]' // We'd need to use FileReader for async Blob reading
          : String(event.data)
          
      console.log(`Received message data: ${messageText}`)
      
      try {
        const data = JSON.parse(messageText)
        const messageType = data.type || 'unknown'

        switch (messageType) {
          case 'presence:join':
            console.log(`Handling presence:join for user ${userId} in list ${listId}`)
            handleUserJoined(listId, userId, session, userName, ws)
            break
            
          case 'presence:leave':
            console.log(`Handling presence:leave for user ${userId} in list ${listId}`)
            handleUserLeft(listId, userId, session)
            break
            
          case 'task:create':
          case 'task:update':
          case 'task:delete':
          case 'task:reorder':
            console.log(`Handling ${messageType} event for list ${listId}`)
            broadcastToList(listId, messageText, userId)
            break
            
          default:
            console.log(`Unknown message type: ${messageType}`)
        }
        
        // Acknowledge receipt
        ws.send(JSON.stringify({
          type: 'ack',
          originalType: messageType,
          timestamp: Date.now()
        }))
        
      } catch (error) {
        console.error('Error processing WebSocket message:', error)
      }
    },
    
    onClose() {
      console.log(`User ${userId} disconnected from list ${listId}`)
      handleUserLeft(listId, userId, session)
    }
  }
}
