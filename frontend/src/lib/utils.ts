import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

// Get current date in the format "Today, Wed 26 July 2023"
export function getCurrentDate() {
  const date = new Date()
  const parts = format(date, 'PPPP').split(', ')
  return `Today, ${parts[0].substring(0, 3)} ${parts[1].split(' ')[1]} ${parts[1].split(' ')[0]} ${parts[2]}`
}

/**
 * Check if a date string represents today
 */
export function isToday(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Check if a date string represents tomorrow
 */
export function isTomorrow(dateString: string) {
  const date = new Date(dateString)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

/**
 * Check if a date string represents a past date
 */
export function isPastDueDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  return date < today
}

/**
 * Get CSS classes for different priority levels
 */
export function getPriorityClasses(priority: string | undefined) {
  switch (priority) {
    case 'High':
      return 'border text-rose-600 border-rose-500 bg-rose-300/30 dark:text-rose-500 dark:border-rose-400 dark:bg-rose-900/30'
    case 'Medium':
      return 'text-amber-600 border border-amber-500 bg-amber-300/30 dark:text-amber-500 dark:border-amber-400 dark:bg-amber-900/30'
    case 'Low':
      return 'text-indigo-600 border border-indigo-500 bg-indigo-300/30 dark:text-indigo-500 dark:border-indigo-400 dark:bg-indigo-900/30'
    default:
      return 'text-gray-400 border border-gray-200 bg-gray-100/30 dark:text-gray-400 dark:border-gray-700 dark:bg-gray-700/30'
  }
}
