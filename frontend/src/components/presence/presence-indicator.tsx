// Component for showing online users in a collaborative task list
import { useMemo } from 'react'
import { usePresence } from '@/hooks/use-presence'
import { ConnectionStatus } from '@/lib/websocket/websocket-service'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Predefined colors for avatars - nice, vibrant colors with good contrast
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-cyan-500',
]

interface PresenceIndicatorProps {
  listId: string
}

export function PresenceIndicator({ listId }: PresenceIndicatorProps) {
  const { users, connectionStatus } = usePresence({ listId })
  
  // Generate consistent color for each user
  const userColors = useMemo(() => {
    return users.reduce<Record<string, string>>((colors, user) => {
      // Use userId to consistently pick a color from the array
      const colorIndex = Math.abs(user.userId.split('').reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
      ) % AVATAR_COLORS.length)
      
      colors[user.userId] = AVATAR_COLORS[colorIndex]
      return colors
    }, {})
  }, [users])

  // Don't show anything if there's no one online or we're not connected
  if (users.length === 0 || connectionStatus !== ConnectionStatus.OPEN) {
    return null
  }


  return (
    <div className="flex items-center space-x-1">
      <div className="flex -space-x-2 overflow-hidden">
        {/* Show up to 3 user avatars */}
        {users.slice(0, 3).map((user) => (
          <Avatar 
            key={user.userId} 
            title={user.userName}
            className="border-background border-2"
          >
            <AvatarFallback className={userColors[user.userId] || 'bg-gray-500'}>
              {user.userName.substring(0, 1).toUpperCase()} 
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      
      {/* If there are more than 3 users, show a count */}
      {users.length > 3 && (
        <Badge className="text-xs text-gray-500">+{users.length - 3} more</Badge>
      )}
      
      {/* Show total count of collaborators */}
      <span className="text-xs text-gray-500">
        {users.length} {users.length === 1 ? 'person' : 'people'} collaborating
      </span>
    </div>
  )
}
