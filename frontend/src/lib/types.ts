// ==============================
// API Response Types
// ==============================

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface SuccessResponse<T = unknown> {
  success: true
  message: string
  data: T
}

export interface PaginatedSuccessResponse<T = unknown>
  extends SuccessResponse<T> {
  pagination: PaginationInfo
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    [key: string]: unknown
  }
}

// ==============================
// User & Auth Types
// ==============================

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  emailVerified?: string
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  name: string
  avatar?: string
}

export interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

// ==============================
// List Types
// ==============================

export interface List {
  id: string
  title: string
  description?: string
  ownerId: string
  isFrozen: boolean
  isShared: boolean
  color?: string
  schema?: Array<SchemaField>
  createdAt: string
  updatedAt: string
  tasks?: Array<Task>
  collaborators?: Array<ListCollaborator>
}

export type ListResp = PaginatedSuccessResponse<Array<List>>

export type CreateListInput = {
  title: string
  description?: string
  color?: string
  schema?: Array<SchemaField>
}

export interface ListCollaborator {
  listId: string
  userId: string
  role: string
  user?: User
}

// ==============================
// Schema Types
// ==============================

export type FieldType = 'text' | 'number' | 'date' | 'checkbox'

export interface SchemaField {
  id: string
  name: string
  type: FieldType
  required: boolean
}

// ==============================
// Task Types
// ==============================

export type Priority = 'High' | 'Medium' | 'Low' | 'None'

export interface Task {
  id: string
  userId: string
  listId: string | null
  parentTaskId?: string
  title: string
  description?: string
  value?: number
  priority: Priority
  isCompleted: boolean
  dueDate?: string
  position: number
  createdAt: string
  updatedAt: string
  subtasks?: Array<Task>
}

export type CreateTaskInput = {
  title: string
  description?: string
  listId?: string
  parentTaskId?: string
  value?: number
  priority?: Priority
  dueDate?: string
  position?: number
}

// ==============================
// Activity Types
// ==============================

export type ActivityType =
  | 'status_change'
  | 'comment'
  | 'reaction'
  | 'file_upload'
  | 'creation'
  | 'subtask_added'
  | 'subtask_completed'

export interface Activity {
  id: string
  type: ActivityType
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

// ==============================
// Filter Types
// ==============================

export type Filter = 'today' | 'upcoming'
