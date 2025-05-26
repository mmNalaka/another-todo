import { Calendar, CheckCircle, ChevronRight, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import type { Task } from '@/lib/types'
import { cn, getPriorityClasses, isToday, isTomorrow, isPastDueDate } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskListProps {
  tasks: Array<Task>
  selectedTask: string | null
  listClasses?: string
  onSelectTask: (task: Task) => void
  onToggleCompletion: (task: Task) => void
  onReorderTasks?: (tasks: Array<Task>) => void
}

// Using getPriorityClasses from utils.ts

interface SortableTaskItemProps {
  task: Task
  selectedTask: string | null
  listClasses?: string
  onSelectTask: (task: Task) => void
  onToggleCompletion: (task: Task) => void
  handleDefaultClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, task: Task) => void
  formatDueDate: (dateString: string) => { month: string; day: string }
  isToday: (dateString: string) => boolean
  isTomorrow: (dateString: string) => boolean
  isPastDueDate: (dateString: string) => boolean
}

function SortableTaskItem({
  task,
  selectedTask,
  listClasses,
  onSelectTask,
  onToggleCompletion,
  handleDefaultClick,
  formatDueDate,
  isToday,
  isTomorrow,
  isPastDueDate,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center py-3 px-4 rounded-lg hover:bg-zinc-100 cursor-pointer group bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:group-hover:bg-neutral-600',
        selectedTask === task.id &&
          'bg-gray-100 hover:bg-gray-100 dark:bg-zinc-700 dark:group-hover:bg-neutral-600',
        isDragging && 'opacity-50',
        listClasses,
      )}
      onClick={(e) => handleDefaultClick(e, task)}
      {...attributes}
    >
      <div 
        className="mr-2 cursor-grab touch-none"
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
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
  )
}

export function TaskList({
  tasks,
  selectedTask,
  listClasses,
  onSelectTask,
  onToggleCompletion,
  onReorderTasks,
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

  // Using date utility functions from utils.ts

  // Set up sensors for drag and drop - use very simple configuration
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }
    
    // Find the indices of the dragged item and the target position
    const oldIndex = tasks.findIndex((task) => task.id === active.id)
    const newIndex = tasks.findIndex((task) => task.id === over.id)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      // Reorder the tasks array
      const newTasks = arrayMove(tasks, oldIndex, newIndex)
      
      // Update the position property for each task based on its new index
      const updatedTasks = newTasks.map((task, index) => ({
        ...task,
        position: index,
      }))
      
      // Call the callback to update the tasks in the parent component
      if (onReorderTasks) {
        onReorderTasks(updatedTasks)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {tasks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
              autoScroll={true}
            >
              <SortableContext
                items={tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    selectedTask={selectedTask}
                    listClasses={listClasses}
                    onSelectTask={onSelectTask}
                    onToggleCompletion={onToggleCompletion}
                    handleDefaultClick={handleDefaultClick}
                    formatDueDate={formatDueDate}
                    isToday={isToday}
                    isTomorrow={isTomorrow}
                    isPastDueDate={isPastDueDate}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
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
