// Use WebSocketLike type for WebSocket to avoid TypeScript issues
type WebSocketLike = {
  send: (data: string) => void
  readyState: number
  close?: () => void
  // Additional WebSocket-like properties that might be needed when using Hono
  onmessage?: (event: any) => void
  onclose?: (event: any) => void
  onerror?: (event: any) => void
}

// Types for our WebSocket service
type ActiveUser = {
  userId: string
  userName: string
  session: string
  ws: WebSocketLike
  lastActivity: number
}

type ActiveListUsers = {
  [listId: string]: {
    [userId: string]: {
      [session: string]: ActiveUser
    }
  }
}

// Store active users by list
const activeListUsers: ActiveListUsers = {}

/**
 * Get all active users in a list
 */
export function getActiveUsers(listId: string): ActiveUser[] {
  if (!activeListUsers[listId]) return []
  
  const users: ActiveUser[] = []
  const listUsers = activeListUsers[listId]
  
  Object.values(listUsers).forEach(userSessions => {
    Object.values(userSessions).forEach(user => {
      users.push(user)
    })
  })
  
  return users
}

/**
 * Handle a user joining a list
 */
export function handleUserJoined(
  listId: string,
  userId: string,
  session: string,
  userName: string,
  ws: WebSocketLike
): void {
  if (!listId || !userId || !session) return
  
  // Create new objects if they don't exist
  if (!activeListUsers[listId]) {
    activeListUsers[listId] = {}
  }
  
  if (!activeListUsers[listId][userId]) {
    activeListUsers[listId][userId] = {}
  }
  
  // Add user to the active users list
  activeListUsers[listId][userId][session] = {
    userId,
    userName,
    session,
    ws,
    lastActivity: Date.now()
  }
  
  // Broadcast presence update to all users in the list
  broadcastPresenceUpdate(listId)
}

/**
 * Handle a user leaving a list
 */
export function handleUserLeft(listId: string, userId: string, session: string): void {
  if (!listId || !userId || !session) return
  
  // Check if user exists in the list
  if (
    activeListUsers[listId] && 
    activeListUsers[listId][userId] && 
    activeListUsers[listId][userId][session]
  ) {
    // Remove the user session
    delete activeListUsers[listId][userId][session]
    
    // Clean up empty objects
    if (Object.keys(activeListUsers[listId][userId]).length === 0) {
      delete activeListUsers[listId][userId]
    }
    
    if (Object.keys(activeListUsers[listId]).length === 0) {
      delete activeListUsers[listId]
    }
    
    // Broadcast presence update
    broadcastPresenceUpdate(listId)
  }
}

/**
 * Broadcast a message to all users in a list except the sender
 */
export function broadcastToList(
  listId: string,
  message: string,
  excludeUserId?: string
): void {
  if (!listId || !activeListUsers[listId]) {
    console.log(`[WebSocket] Cannot broadcast to list ${listId}: list not found or no active users`)
    return
  }
  
  const users = getActiveUsers(listId)
  console.log(`[WebSocket] Broadcasting to list ${listId}, active users: ${users.length}, message type: ${JSON.parse(message).type}`)
  
  let sentCount = 0
  users.forEach(user => {
    // Skip sending the message back to the sender
    if (excludeUserId && user.userId === excludeUserId) {
      console.log(`[WebSocket] Skipping sender ${excludeUserId}`)
      return
    }
    
    try {
      if (user.ws.readyState === 1) { // OPEN
        user.ws.send(message)
        sentCount++
      } else {
        console.log(`[WebSocket] Cannot send to user ${user.userId}: WebSocket not open (state: ${user.ws.readyState})`)
      }
    } catch (error) {
      console.error(`[WebSocket] Error sending message to user ${user.userId}:`, error)
    }
  })
  
  console.log(`[WebSocket] Broadcast complete: sent to ${sentCount}/${users.length} users`)
}

/**
 * Broadcast presence updates to all users in a list
 */
export function broadcastPresenceUpdate(listId: string): void {
  if (!listId || !activeListUsers[listId]) return
  
  const users = getActiveUsers(listId)
  
  // Create a simplified list of users (without WebSocket objects)
  const usersList = users.map(user => ({
    userId: user.userId,
    userName: user.userName,
    lastActivity: user.lastActivity
  }))
  
  // Deduplicate users for display (same userId = same person)
  const uniqueUsers = Object.values(
    usersList.reduce((acc, user) => {
      if (!acc[user.userId] || acc[user.userId].lastActivity < user.lastActivity) {
        acc[user.userId] = user
      }
      return acc
    }, {} as Record<string, typeof usersList[0]>)
  )
  
  // Create presence update message
  const message = JSON.stringify({
    type: 'presence:update',
    users: uniqueUsers,
    count: uniqueUsers.length,
    timestamp: Date.now()
  })
  
  // Send the update to all users in the list
  users.forEach(user => {
    try {
      if (user.ws.readyState === 1) { // OPEN
        user.ws.send(message)
      }
    } catch (error) {
      console.error('Error sending WebSocket presence update:', error)
    }
  })
}

/**
 * Check for stale WebSocket connections and clean them up
 * This should be called periodically
 */
export function cleanupStaleSessions(maxAgeMs = 5 * 60 * 1000): void {
  const now = Date.now()
  
  Object.keys(activeListUsers).forEach(listId => {
    Object.keys(activeListUsers[listId]).forEach(userId => {
      Object.keys(activeListUsers[listId][userId]).forEach(session => {
        const user = activeListUsers[listId][userId][session]
        
        // If the session is stale, remove it
        if (now - user.lastActivity > maxAgeMs) {
          handleUserLeft(listId, userId, session)
        }
      })
    })
  })
}

// Setup periodic cleanup every minute
setInterval(() => cleanupStaleSessions(), 60 * 1000)
