import { useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import type { Task } from '@/lib/types'
import { TaskCreator } from '@/components/tasks/task-creator'
import { TaskListSkeleton } from '@/components/tasks/task-list-skeleton'
import { TaskDetails } from '@/components/tasks/task-details'

import { useFetchTasks } from '@/hooks/tasks/use-fetch-tasks'
import { TaskList } from '@/components/tasks/task-list'
import { useLocalization } from '@/hooks/use-localization'
import { useUpdateTask } from '@/hooks/tasks/use-update-task'

export const Route = createFileRoute('/_auth/tasks')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLocalization()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  // Navigation stack to keep track of task hierarchy
  const [navigationStack, setNavigationStack] = useState<Array<Task>>([])

  const { tasks, isLoading } = useFetchTasks()
  const { updateTask } = useUpdateTask()

  // Get the currently viewed task (either from root tasks or navigation stack)
  const currentTask = selectedTaskId
    ? navigationStack.length > 0
      ? navigationStack[navigationStack.length - 1]
      : tasks.find((task) => task.id === selectedTaskId)
    : null

  const handleSelectTask = async (task: Task) => {
    await setSelectedTaskId(task.id)
    // Reset navigation stack when selecting from root
    await setNavigationStack([])
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
    updateTask({ id: task.id, isCompleted: !task.isCompleted })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-row h-full">
        <div
          className={`overflow-auto py-2 px-4 md:p4 ${currentTask ? 'flex-1/2' : 'flex-1'}`}
        >
          <div className="space-y-2">
            <div className="py-2">
              <TaskCreator buttonLabel={t('tasks.create.button')} />
            </div>

            {isLoading && (
              <div className="space-y-4">
                <TaskListSkeleton count={3} />
              </div>
            )}

            <TaskList
              tasks={tasks}
              onSelectTask={handleSelectTask}
              selectedTask={selectedTaskId}
              onToggleCompletion={handleToggleCompletion}
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
}
