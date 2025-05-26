import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import type { List } from '@/lib/types'
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
import { useDeleteList } from '@/hooks/lists/use-delete-list'

type ListDeleteButtonProps = {
  list: List
  onSuccess?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showIcon?: boolean
}

export function ListDeleteButton({ 
  list, 
  onSuccess, 
  variant = 'destructive',
  showIcon = true 
}: ListDeleteButtonProps) {
  const { t } = useLocalization()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const { deleteList, isPending: isDeleting } = useDeleteList({
    onSuccess: () => {
      if (onSuccess) {
        onSuccess()
      }
    }
  })

  return (
    <>
      <Button 
        variant={'destructive'}
        size="sm" 
        onClick={() => setShowDeleteConfirm(true)} 
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : showIcon ? (
          <Trash2 className="h-4 w-4 mr-2" />
        ) : null}
        {t('lists.delete')}
      </Button>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('lists.delete.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('lists.delete.confirm.description', { title: list.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('lists.delete.confirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteList({ id: list.id })}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {t('lists.delete.confirm.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
