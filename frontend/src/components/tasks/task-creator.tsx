import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react'
import type { CreateTaskInput, Priority } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useCreateTask } from '@/hooks/tasks/use-create-task'
import { Separator } from '@/components/ui/separator'

interface TaskCreatorProps {
  onTaskCreated?: () => void
  hiderDateSelector?: boolean
  hidePrioritySelector?: boolean
  buttonLabel: string
  parentId?: string
  listId?: string
}

export function TaskCreator({
  onTaskCreated,
  hidePrioritySelector,
  hiderDateSelector,
  buttonLabel,
  parentId,
  listId,
}: TaskCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<Priority>('None')

  const { createTask, isPending } = useCreateTask({
    onSuccess: () => {
      resetForm()
      if (onTaskCreated) onTaskCreated()
    },
    onError: (error) => {
      console.error('Failed to create task:', error)
    },
    showToasts: true
  })

  const handleCreateTask = () => {
    if (title.trim()) {
      const newTask: CreateTaskInput = {
        title,
        priority,
        dueDate: date ? date.toISOString() : undefined,
        parentTaskId: parentId ? parentId : undefined,
        listId: listId ? listId : undefined,
      }

      createTask(newTask)
    } else {
      toast.error('Task title cannot be empty')
    }
  }

  const resetForm = () => {
    setTitle('')
    setDate(undefined)
    setPriority('None')
    setIsCreating(false)
  }

  const getPriorityClasses = (priorityValue: Priority) => {
    switch (priorityValue) {
      case 'High':
        return 'border text-rose-600 border-rose-500 bg-rose-300/30 dark:text-rose-500 dark:border-rose-400 dark:bg-rose-900/30'
      case 'Medium':
        return 'text-amber-600 border border-amber-500 bg-amber-300/30 dark:text-amber-500 dark:border-amber-400 dark:bg-amber-900/30'
      case 'Low':
        return 'text-indigo-600 border border-indigo-500 bg-indigo-300/30 dark:text-indigo-500 dark:border-indigo-400 dark:bg-indigo-900/30'
      default:
        return 'text-gray-400 border border-gray-200'
    }
  }

  // Show the create task button when not creating
  if (!isCreating) {
    return (
      <Button
        size="lg"
        variant="outline"
        className="w-full flex items-center justify-start text-muted-foreground hover:text-foreground h-11"
        onClick={() => setIsCreating(true)}
      >
        {buttonLabel}
      </Button>
    )
  }

  // Show the inline task creation form when creating
  return (
    <div
      className={cn(
        'flex items-center py-1 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-500/20 border border-zinc-200 dark:border-zinc-700 h-11',
      )}
    >
      <Checkbox
        className="w-5 h-5 rounded-4xl mr-4 opacity-50"
        checked={false}
        disabled
      />

      <div className="flex-1 min-w-0 flex items-center">
        <div className="flex-1">
          <Input
            className="border-none bg-transparent p-0 text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateTask()
              } else if (e.key === 'Escape') {
                resetForm()
              }
            }}
            autoFocus
          />
        </div>

        <div className="hidden lg:flex items-center ml-4 space-x-4 ">
          {!hiderDateSelector && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2 text-xs flex items-center gap-1 mr-2"
                >
                  <CalendarIcon className="h-3 w-3" />
                  {date ? format(date, 'MMM d') : 'Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {!hidePrioritySelector && (
            <Select
              value={priority}
              onValueChange={(val) => setPriority(val as Priority)}
            >
              <SelectTrigger
                className={cn(
                  'h-7! px-1! text-xs flex items-center justify-center rounded-md font-medium w-20',
                  getPriorityClasses(priority),
                )}
              >
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <Separator orientation="vertical" className="px-2" />

        <div className="flex ml-2 gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-7"
            onClick={handleCreateTask}
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7"
            onClick={resetForm}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
