import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskListSkeletonProps {
  count?: number
  listClasses?: string
}

export function TaskListSkeleton({
  count = 5,
  listClasses,
}: TaskListSkeletonProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {Array(count)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center py-3 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-800',
                  listClasses,
                )}
              >
                {/* Checkbox skeleton */}
                <div className="w-5 h-5 rounded-full mr-4 bg-gray-200 dark:bg-gray-700 animate-pulse" />

                <div className="flex-1 min-w-0 flex items-center">
                  <div className="flex-1">
                    {/* Title skeleton */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  </div>

                  <div className="flex items-center ml-4 space-x-2">
                    {/* Date skeleton - show randomly to mimic real data */}
                    {Math.random() > 0.5 && (
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    )}

                    {/* Priority skeleton */}
                    <div className="w-14 h-5 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-300 ml-2" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
