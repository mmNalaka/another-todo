export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

// Interface for success response without pagination
export interface SuccessResponse<T = any> {
  success: true
  message: string
  data: T
}

// Interface for paginated success response
export interface PaginatedSuccessResponse<T = any> extends SuccessResponse<T> {
  pagination: PaginationInfo
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    [key: string]: any
  }
}

export type ListResp = PaginatedSuccessResponse<Array<List>>

export type List = {
  createdAt: string
  id: string
  isFrozen: boolean
  isShared: boolean
  ownerId: string
  title: string
  updatedAt: string
  tasks: Array<Task>
  collaborators: Array<Member>
}

export interface Task {
  id: string
  title: string
  completed: boolean
  listId: string | null
  groupId?: string
  date: string
  startTime?: string
  endTime?: string
  createdAt: string
  description?: string
  priority?: 'Low' | 'Medium' | 'High'
  status?: 'To Do' | 'In Progress' | 'In Research' | 'In Review' | 'Done'
  dueDate?: string
  dueDateEnd?: string
  tags?: Array<string>
  assignees?: Array<string>
  subtasks?: Array<Subtask>
  activities?: Array<Activity>
  starred?: boolean
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export interface Activity {
  id: string
  type:
    | 'status_change'
    | 'comment'
    | 'reaction'
    | 'file_upload'
    | 'creation'
    | 'subtask_added'
    | 'subtask_completed'
  userId: string
  timestamp: string
  data: {
    oldStatus?: string
    newStatus?: string
    comment?: string
    reaction?: string
    fileName?: string
    fileType?: string
    fileSize?: string
    fileUrl?: string
    subtaskId?: string
    subtaskTitle?: string
  }
}

export interface Member {
  id: string
  name: string
  avatar?: string
}

export interface Group {
  id: string
  name: string
  members: Array<Member>
  count: number
}

export type Filter = 'today' | 'upcoming'
