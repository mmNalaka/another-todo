import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useLocalization } from '@/hooks/use-localization'
import { useDeleteTask } from '@/hooks/tasks/use-delete-task'
import type { Task } from '@/lib/types'

type TaskDeleteButtonProps = {
  task: Task
  onSuccess?: () => void
}

export function TaskDeleteButton({ task, onSuccess }: TaskDeleteButtonProps) {
  const { t } = useLocalization()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const { deleteTask, isPending: isDeleting } = useDeleteTask({
    onSuccess: () => {
      if (onSuccess) {
        onSuccess()
      }
    }
  })

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowDeleteConfirm(true)} 
        className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tasks.delete.confirmTitle' as any)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tasks.delete.confirmDescription' as any)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('generic.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTask(task.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {t('generic.delete' as any)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
