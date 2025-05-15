'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApiMutation } from '@/hooks/use-api-query'
import { queryClient } from '@/integrations/tanstack-query/root-provider'
import { useLocalization } from '@/hooks/use-localization'

type CreateListDialogProps = React.ComponentProps<typeof Dialog>

export function CreateListDialog(props: CreateListDialogProps) {
  const { t } = useLocalization()
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')

  const createListMutation = useApiMutation<any, any>('/lists', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setNewListName('')
      setIsListDialogOpen(false)
    },
  })

  const handleAddList = async () => {
    if (!newListName.trim()) return

    try {
      await createListMutation.mutate({ title: newListName.trim() })
      setNewListName('')
    } catch (error) {
      console.error('Failed to create list:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList()
    }
  }

  return (
    <Dialog
      open={isListDialogOpen}
      onOpenChange={setIsListDialogOpen}
      {...props}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{t('lists.create.list.label')}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('lists.create.list.label')}</DialogTitle>
          <DialogDescription>{t('lists.create.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">{t('lists.create.list.label')}</Label>
            <Input
              id="list-name"
              placeholder={t('list.create.form.title.placeholder')}
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <Button
            onClick={handleAddList}
            className="w-full"
            disabled={!newListName.trim()}
          >
            {t('list.create.form.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
