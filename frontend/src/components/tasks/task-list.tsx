import { Calendar, CheckCircle, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface TaskListProps {
  tasks: Array<Task>
  selectedTask: string | null
  listClasses?: string
  onSelectTask: (task: Task) => void
  onToggleCompletion: (task: Task) => void
}

const getPriorityClasses = (priority: string | undefined) => {
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

export function TaskList({
  tasks,
  selectedTask,
  listClasses,
  onSelectTask,
  onToggleCompletion,
}: TaskListProps) {
  // Prevent opening detail view when clicking on checkbox or dropdown
  const handleDefaultClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    task: Task,
  ) => {
    e.stopPropagation()
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('button') ||
        e.target.closest('[role="checkbox"]') ||
        e.target.closest('[data-radix-dropdown-menu]'))
    ) {
      return
    }
    onSelectTask(task)
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      month: format(date, 'MMM'),
      day: format(date, 'd'),
    }
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isTomorrow = (dateString: string) => {
    const date = new Date(dateString)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

  const isPastDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date < today
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center py-3 px-4 rounded-lg hover:bg-zinc-100 cursor-pointer group bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:group-hover:bg-neutral-600',
                selectedTask === task.id &&
                  'bg-gray-100 hover:bg-gray-100 dark:bg-zinc-700 dark:group-hover:bg-neutral-600',
                listClasses,
              )}
              onClick={(e) => handleDefaultClick(e, task)}
            >
              <Checkbox
                className="w-5 h-5 rounded-4xl mr-4"
                checked={task.isCompleted}
                onCheckedChange={() => onToggleCompletion(task)}
              />

              <div className="flex-1 min-w-0 flex items-center">
                <div className="flex-1">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      task.isCompleted && 'text-gray-400 line-through',
                    )}
                  >
                    {task.title}
                  </div>
                </div>

                <div className="flex items-center ml-4 space-x-2">
                  {task.dueDate &&
                    !isToday(task.dueDate) &&
                    !isTomorrow(task.dueDate) && (
                      <div
                        className={cn(
                          'flex flex-row items-center justify-center text-xs text-gray-500 w-18',
                          isPastDueDate(task.dueDate) && 'text-rose-500',
                        )}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        <span
                          className={cn(
                            'text-gray-400 mr-1',
                            isPastDueDate(task.dueDate) && 'text-rose-400',
                          )}
                        >
                          {formatDueDate(task.createdAt).month}
                        </span>
                        <span className="font-medium">
                          {formatDueDate(task.createdAt).day}
                        </span>
                      </div>
                    )}

                  {task.dueDate && isToday(task.dueDate) && (
                    <div className="flex items-center text-xs text-rose-400 w-14">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Today</span>
                    </div>
                  )}

                  {task.dueDate && isTomorrow(task.dueDate) && (
                    <div className="flex items-center text-xs text-indigo-400 w-20">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Tomorrow</span>
                    </div>
                  )}

                  <div
                    className={cn(
                      'flex items-center justify-center h-5 px-1 rounded-md text-xs font-medium w-14',
                      getPriorityClasses(task.priority),
                    )}
                  >
                    {task.priority}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 px-1!"
                  onClick={() => {
                    onSelectTask(task)
                  }}
                >
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </Button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <CheckCircle className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-medium mb-1">No tasks yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Add a new task using the button above to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
