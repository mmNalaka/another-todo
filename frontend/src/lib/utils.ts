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
