/* eslint-disable no-shadow */
import { useCallback, useEffect, useState } from 'react'
import {
  Calendar,
  Check,
  ChevronLeft,
  Edit,
  Flag,
  Loader2,
  Save,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import type { Priority, Task } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TaskList } from '@/components/tasks/task-list'
import { TaskListSkeleton } from '@/components/tasks/task-list-skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useIsMobile } from '@/hooks/use-mobile'
import { TaskCreator } from '@/components/tasks/task-creator'
import { useLocalization } from '@/hooks/use-localization'
import { useFetchTask } from '@/hooks/tasks/use-fetch-task'
import { useUpdateTask } from '@/hooks/tasks/use-update-task'

type TaskDetailProps = {
  task: Task
  onClose: () => void
  onNavigateToSubtask?: (subtask: Task) => void
  onNavigateBack?: () => void
  isSubtask?: boolean
}

type TaskUpdateData = {
  id: string
} & Partial<Task>

export function TaskDetails({
  task,
  onClose,
  onNavigateToSubtask,
  onNavigateBack,
  isSubtask = false,
}: TaskDetailProps) {
  const { t } = useLocalization()
  const isMobile = useIsMobile()
  const { updateTask, isPending: isSaving } = useUpdateTask()

  // State for task fields
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const { fullTask, isLoading, error, refetch } = useFetchTask(task.id)

  // Get subtasks safely
  const subTasks = fullTask?.subTasks || []

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description || '')
  }, [task])

  // Debounced auto-save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null

      return (data: TaskUpdateData) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
          updateTask(data)
          timeoutId = null
        }, 800) // 800ms debounce delay
      }
    })(),
    [],
  )

  // Handle title change with auto-save
  const handleTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    task: TaskUpdateData,
  ) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    debouncedSave({ id: task.id, listId: task.listId, title: newTitle })
  }

  // Handle description change with auto-save
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newDescription = e.target.value
    setDescription(newDescription)
    if (isEditingDescription) {
      debouncedSave({ id: task.id, listId: task.listId, description: newDescription })
    }
  }

  // Save description when exiting edit mode
  const handleUpdateDescription = (task: TaskUpdateData) => {
    updateTask({ id: task.id, listId: task.listId, description: task.description })
    setIsEditingDescription(false)
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined, task: TaskUpdateData) => {
    if (date) {
      updateTask({ id: task.id, listId: task.listId, dueDate: date.toISOString() })
    }
  }

  // Handle priority change
  const handlePriorityChange = (priority: Priority, task: TaskUpdateData) => {
    updateTask({ id: task.id, listId: task.listId, priority })
  }

  // Handle toggle completion
  const handleToggleCompletion = (task: TaskUpdateData) => {
    updateTask({
      id: task.id,
      listId: task.listId,
      isCompleted: !task.isCompleted,
    })
  }

  // Handle select task
  const onSelectTask = (task: Task) => {
    if (onNavigateToSubtask) {
      onNavigateToSubtask(task)
    }
  }

  // Get priority color class
  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500 dark:text-red-400'
      case 'medium':
        return 'text-orange-500 dark:text-orange-400'
      case 'low':
        return 'text-blue-500 dark:text-blue-400'
      default:
        return 'text-gray-400 dark:text-gray-500'
    }
  }

  return (
    <div
      className={cn(
        'fixed top-0 bottom-0 right-0 flex flex-col border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-40',
        isMobile ? 'w-full' : 'lg:w-3/7',
      )}
    >
      <div className="flex-none flex items-center justify-between px-4 py-3.5 border-b dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold dark:text-white">
            {isSubtask ? 'Subtask Details' : 'Task Details'}
          </h2>
          {isSaving && (
            <Loader2 className="h-4 w-4 ml-2 animate-spin text-emerald-500" />
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 lg:space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant="secondary"
              onClick={() => handleToggleCompletion(fullTask || task)}
            >
              <Check
                className={cn(
                  'h-5 w-5 mr-2',
                  fullTask?.isCompleted
                    ? 'text-green-500'
                    : 'text-gray-400 dark:text-gray-500',
                )}
              />
              {fullTask?.isCompleted
                ? t('todo.markIncomplete')
                : t('todo.markComplete')}
            </Button>
          </div>
          <div className="flex flex-row items-center text-muted-foreground m-0 h-8">
            {isSubtask && onNavigateBack && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={onNavigateBack}
              >
                <span className="text-sm flex flex-row font-bold ">
                  {fullTask?.parentTask?.title
                    ? fullTask.parentTask.title
                    : ' '}
                </span>
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            )}
          </div>
          <div className="flex items-start">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e, task)}
              className="flex-1 font-bold text-2xl! lg:text-3xl! border-none p-0 dark:bg-transparent dark:text-gray-100 shadow-none"
            />
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-row">
            {t('tasks.taskCreated')}{' '}
            {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {fullTask?.dueDate
                    ? format(new Date(fullTask.dueDate), 'MMM d, yyyy')
                    : t('todo.dueDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 dark:bg-zinc-800 dark:border-zinc-700"
                align="start"
              >
                <CalendarComponent
                  mode="single"
                  selected={
                    fullTask?.dueDate ? new Date(fullTask.dueDate) : undefined
                  }
                  onSelect={(date) => handleDateSelect(date, task)}
                  initialFocus
                  className="dark:bg-zinc-800"
                />
              </PopoverContent>
            </Popover>

            <Select
              value={fullTask?.priority}
              onValueChange={(priority) =>
                handlePriorityChange(priority as Priority, task)
              }
            >
              <Button variant="outline" size="sm" asChild>
                <SelectTrigger>
                  <SelectValue placeholder={t('todo.priority')}>
                    <div className="flex items-center">
                      <Flag
                        className={cn(
                          'h-4 w-4 mr-2',
                          getPriorityColor(fullTask?.priority),
                        )}
                      />
                      <span className="capitalize">{fullTask?.priority}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
              </Button>
              <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
                <SelectItem value="High" className="dark:text-zinc-300">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                    {t('todo.priority.high')}
                  </div>
                </SelectItem>
                <SelectItem value="Medium" className="dark:text-gray-300">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                    {t('todo.priority.medium')}
                  </div>
                </SelectItem>
                <SelectItem value="Low" className="dark:text-gray-300">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                    {t('todo.priority.low')}
                  </div>
                </SelectItem>
                <SelectItem value="None" className="dark:text-gray-300">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {t('tasks.priority.none')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium dark:text-zinc-300">
                {t('todo.taskDescription')}
              </label>
              {isEditingDescription ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdateDescription(task)}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {t('generic.save')}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingDescription(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('todo.edit')}
                </Button>
              )}
            </div>

            {isEditingDescription ? (
              <Textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder={t('todo.taskDescription')}
                className="min-h-[150px]"
              />
            ) : (
              <div
                className="prose prose-sm max-w-none min-h-[150px] p-3 border rounded-md bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer dark:text-zinc-300 dark:prose-invert"
                onClick={() => setIsEditingDescription(true)}
                dangerouslySetInnerHTML={{
                  __html:
                    description ||
                    `<p class='text-zinc-400 dark:text-zinc-500'>${t('todo.taskDescription')}</p>`,
                }}
              />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium dark:text-gray-300">
            {t('tasks.sub.title')}
          </h3>

          <div className="space-y-2">
            <TaskCreator
              hidePrioritySelector
              hiderDateSelector
              buttonLabel={t('tasks.sub.create.button')}
              parentId={task.id}
              onTaskCreated={refetch}
              listId={fullTask?.listId ?? undefined}
            />

            {isLoading && <TaskListSkeleton count={2} />}

            {subTasks.length > 0 && (
              <TaskList
                tasks={subTasks}
                selectedTask={null}
                onSelectTask={onSelectTask}
                onToggleCompletion={handleToggleCompletion}
              />
            )}

            {!isLoading &&
              !error &&
              fullTask?.subTasks &&
              fullTask.subTasks.length === 0 && (
                <Alert>
                  <AlertDescription>
                    {t('tasks.sub.empty.message')}
                  </AlertDescription>
                </Alert>
              )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{t('tasks.error')}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
