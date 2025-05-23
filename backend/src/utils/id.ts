import { nanoid } from 'nanoid'

export function generateId(prefix?: string) {
  const id = nanoid()
  return prefix ? `${prefix}_${id}` : id
}

// You can also create specific generators for different entity types
export const generateUserId = () => generateId('usr')
export const generateTaskId = () => generateId('tsk')
export const generateListId = () => generateId('lst')
