import { useEffect, useState } from 'react'

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Calendar, CheckSquare, Filter } from 'lucide-react'
import type { Task } from '@/lib/types'
import { useLocalization } from '@/hooks/use-localization'
import { listQueryOptions } from '@/hooks/lists/use-fetch-list'
import { TaskList } from '@/components/tasks/task-list'
import { TaskCreator } from '@/components/tasks/task-creator'
import { TaskDetails } from '@/components/tasks/task-details'
import { ShareListDialog } from '@/components/todo/share-list-dialog'
import { FreezeListButton } from '@/components/todo/freeze-list-button'
import { ListDeleteButton } from '@/components/todo/list-delete-button'
import { useUpdateTask } from '@/hooks/tasks/use-update-task'
import { useUpdateTaskPositions } from '@/hooks/tasks/use-update-task-positions'
import { useUpdateList } from '@/hooks/lists/use-update-list'
import { useDebouncedSave } from '@/hooks/use-debounced-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NotFound } from '@/components/ui/not-found'
import { useAuth } from '@/providers/auth-provider'
import { TaskFilterDropdown } from '@/components/tasks/task-filter-dropdown'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/_auth/lists/$listId')({
  loader: async ({ context: { queryClient }, params: { listId } }) => {
    try {
      return await queryClient.ensureQueryData(listQueryOptions(listId))
    } catch (error) {
      // Don't throw an error, let the component handle it
      return { error }
    }
  },
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      filter: search.filter || 'all',
    }
  },
})

function RouteComponent() {
  const { t } = useLocalization()
  const { user } = useAuth()
  const navigate = useNavigate()
  const listId = Route.useParams().listId
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  // Navigation stack to keep track of task hierarchy
  const [navigationStack, setNavigationStack] = useState<Array<Task>>([])
  
  // Get filter from URL search params
  const { filter } = useSearch({ from: '/_auth/lists/$listId' })

  // Handle errors with a try-catch block
  try {
    // Query the list data
    const { data } = useSuspenseQuery(listQueryOptions(listId))

    // Get the list data from the response
    const listData = data.data

    // Set up hooks for updating tasks and lists
    const { updateTask } = useUpdateTask()
    const { updateList } = useUpdateList()
    const { updateTaskPositions } = useUpdateTaskPositions()

    // Check if the current user is the owner of the list
    const isOwner = listData.ownerId === user?.id

    // State for list fields
    const [title, setTitle] = useState(listData.title)
    const [description, setDescription] = useState(listData.description || '')

    // Use the debounced save hook instead of the inline implementation
    const { debouncedSave } = useDebouncedSave<
      { id: string } & Partial<{ title: string; description: string }>
    >(
      updateList,
      800, // 800ms debounce delay
    )

    useEffect(() => {
      setTitle(listData.title)
      setDescription(listData.description || '')
    }, [listData])

    // Set up filter based on the URL parameter
    const taskFilter = {
      completed: filter === 'completed' ? true : filter === 'uncompleted' ? false : undefined,
      dueDate: filter === 'today' ? 'today' as const : undefined,
    }
    
    // Filter tasks based on the selected filter
    let filteredTasks = listData.tasks ?? []
    
    if (taskFilter.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.isCompleted === taskFilter.completed)
    }
    
    if (taskFilter.dueDate === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= today && dueDate < tomorrow
      })
    }
    
    const tasks = filteredTasks

    // Get the currently viewed task (either from root tasks or navigation stack)
    const currentTask = selectedTaskId
      ? navigationStack.length > 0
        ? navigationStack[navigationStack.length - 1]
        : tasks.find((task) => task.id === selectedTaskId)
      : null

    // Handle title change with auto-save
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      setTitle(newTitle)
      debouncedSave({ id: listId, title: newTitle })
    }

    // Handle description change with auto-save
    const handleDescriptionChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      const newDescription = e.target.value.trim()
      setDescription(newDescription)
      debouncedSave({ id: listId, description: newDescription })
    }

    const handleSelectTask = (task: Task) => {
      setSelectedTaskId(task.id)
      // Reset navigation stack when selecting from root
      setNavigationStack([])
    }

    const handleNavigateToSubtask = (subtask: Task) => {
      // Add current task to navigation stack if not already there
      if (currentTask) {
        setNavigationStack([...navigationStack, subtask])
        setSelectedTaskId(subtask.id)
      }
    }

    const handleNavigateBack = () => {
      // Remove the last task from navigation stack
      if (navigationStack.length > 0) {
        const newStack = [...navigationStack]
        newStack.pop() // Remove the last item

        if (newStack.length > 0) {
          // Navigate to the previous task in the stack
          const previousTask = newStack[newStack.length - 1]
          setSelectedTaskId(previousTask.id)
        } else {
          // If stack is empty, go back to the root task
          setSelectedTaskId(currentTask?.parentTaskId || null)
        }

        setNavigationStack(newStack)
      }
    }

    const handleCloseTaskDetails = () => {
      setSelectedTaskId(null)
      setNavigationStack([])
    }

    const handleToggleCompletion = (task: Task) => {
      updateTask({
        id: task.id,
        isCompleted: !task.isCompleted,
        listId: task.listId,
      })
    }

    const handleReorderTasks = (reorderedTasks: Array<Task>) => {
      // Extract just the id and position for the API call
      const taskPositions = reorderedTasks.map((task) => ({
        id: task.id,
        position: task.position,
      }))

      updateTaskPositions({
        listId,
        tasks: taskPositions,
      })
    }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-none p-4 space-y-4">
          <div className="flex items-center justify-end gap-2 md:hidden order-first">
            <ShareListDialog
              listId={listData.id}
              isOwner={isOwner}
              collaborators={listData.collaborators}
            />
            {listData.isFrozen && (
              <Badge variant="destructive">{t('lists.frozen')}</Badge>
            )}
            {isOwner && (
              <>
                <FreezeListButton
                  isFrozen={listData.isFrozen}
                  listId={listData.id}
                  isOwner={isOwner}
                />
                <ListDeleteButton
                  list={listData}
                  variant="ghost"
                  showIcon={true}
                  onSuccess={() => navigate({ to: '/tasks', search: { filter: 'uncompleted' } })}
                />
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  {filter === 'completed' ? 'Completed' : 
                   filter === 'today' ? 'Today' : 
                   'Active'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: `/lists/${listId}`, search: { filter: 'uncompleted' } })}>
                  <div className="flex items-center gap-2">
                    {filter === 'uncompleted' && <span className="text-primary">✓</span>}
                    Active
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: `/lists/${listId}`, search: { filter: 'completed' } })}>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 mr-1" />
                    {filter === 'completed' && <span className="text-primary">✓</span>}
                    Completed
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: `/lists/${listId}`, search: { filter: 'today' } })}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {filter === 'today' && <span className="text-primary">✓</span>}
                    Today
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge variant="secondary" className="h-8">
              {tasks.length || 0} {t('tasks.title')}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <Input
                value={title}
                onChange={handleTitleChange}
                className="font-semibold text-2xl lg:text-3xl border-none p-0 bg-transparent! px-2 shadow-none"
                readOnly={listData.isFrozen && !isOwner}
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <ShareListDialog
                listId={listData.id}
                isOwner={isOwner}
                collaborators={listData.collaborators}
              />
              {listData.isFrozen && (
                <Badge variant="destructive" className="ml-2">
                  {t('lists.frozen')}
                </Badge>
              )}
              {isOwner && (
                <>
                  <FreezeListButton
                    isFrozen={listData.isFrozen}
                    listId={listData.id}
                    isOwner={isOwner}
                  />
                  <ListDeleteButton
                    list={listData}
                    showIcon={true}
                    onSuccess={() => navigate({ to: '/tasks', search: { filter: 'uncompleted' } })}
                  />
                </>
              )}
              
              <TaskFilterDropdown currentFilter={filter as string} listId={listId} />
              
              <Badge variant="secondary" className="ml-2 h-8">
                {tasks.length || 0} {t('tasks.title')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder={
                  t('todo.taskDescription') || 'Add a description...'
                }
                className="min-h-[40px] text-sm border-none resize-none bg-transparent! placeholder:text-gray-400 placeholder:italic shadow-none"
                readOnly={listData.isFrozen && !isOwner}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-1 overflow-hidden">
          <div
            className={`h-full overflow-y-auto px-4 md:p-4 ${currentTask ? 'w-1/2' : 'w-full'}`}
          >
            <div className="space-y-2">
              {(!listData.isFrozen || isOwner) && (
                <TaskCreator
                  buttonLabel={t('tasks.create.button')}
                  parentId={undefined}
                  listId={listId}
                />
              )}

              <TaskList
                tasks={tasks}
                onSelectTask={handleSelectTask}
                selectedTask={selectedTaskId}
                onToggleCompletion={handleToggleCompletion}
                onReorderTasks={handleReorderTasks}
              />
            </div>
          </div>

          {currentTask && (
            <TaskDetails
              task={currentTask}
              onClose={handleCloseTaskDetails}
              onNavigateToSubtask={handleNavigateToSubtask}
              onNavigateBack={handleNavigateBack}
              isSubtask={navigationStack.length > 0}
            />
          )}
        </div>
      </div>
    )
  } catch (error) {
    // If there's an error, show the not found page
    return (
      <NotFound
        title={t('lists.notFound.title')}
        message={t('lists.notFound.message')}
      />
    )
  }
}
