import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Link2, Share2, UserPlus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAddCollaborator } from '@/hooks/lists/use-list-collaborators'
import { useLocalization } from '@/hooks/use-localization'
import { Badge } from '@/components/ui/badge'
import type { ListCollaborator } from '@/lib/types'
import {
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
} from '@/hooks/lists/use-list-collaborators'

type ShareListDialogProps = {
  listId: string
  className?: string
  collaborators?: ListCollaborator[]
  isOwner: boolean
}

export function ShareListDialog({
  listId,
  className,
  collaborators = [],
  isOwner,
}: ShareListDialogProps) {
  const { t } = useLocalization()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer')

  const { mutate: addCollaborator, isPending: isAddingCollaborator } =
    useAddCollaborator(listId)

  const handleAddCollaborator = () => {
    if (!email) {
      toast.error(t('lists.share.emailRequired') as string)
      return
    }

    addCollaborator(
      { email, role },
      {
        onSuccess: () => {
          setEmail('')
          setRole('viewer')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label={t('lists.share.label') as string}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('lists.share.title') as string}</DialogTitle>
          <DialogDescription>
            {t('lists.share.description') as string}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 relative">
          <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-md my-4">
            <Link2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm truncate text-muted-foreground w-52">
                {window.location.origin}/lists/{listId}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/lists/${listId}`,
                )
                toast.success(t('lists.share.linkCopied') as string)
              }}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4 mr-2" />
              {t('lists.share.copyLink') as string}
            </Button>
          </div>

          {isOwner && (
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('lists.share.emailLabel') as string}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('lists.share.emailPlaceholder') as string}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="role" className="text-sm font-medium">
                  {t('lists.share.roleLabel') as string}
                </label>
                <Select
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as 'editor' | 'viewer')
                  }
                >
                  <SelectTrigger id="role" className="w-[110px]">
                    <SelectValue
                      placeholder={t('lists.share.rolePlaceholder') as string}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">
                      {t('lists.share.roleEditor') as string}
                    </SelectItem>
                    <SelectItem value="viewer">
                      {t('lists.share.roleViewer') as string}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="mb-px"
                onClick={handleAddCollaborator}
                disabled={isAddingCollaborator}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t('lists.share.addButton') as string}
              </Button>
            </div>
          )}

          {collaborators.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                {t('lists.share.collaboratorsTitle') as string}
              </h3>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <CollaboratorItem
                    key={collaborator.userId}
                    collaborator={collaborator}
                    listId={listId}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            {t('generic.close') as string}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type CollaboratorItemProps = {
  collaborator: ListCollaborator
  listId: string
  isOwner: boolean
}

function CollaboratorItem({
  collaborator,
  listId,
  isOwner,
}: CollaboratorItemProps) {
  const { t } = useLocalization()
  const { mutate: updateRole } = useUpdateCollaboratorRole(
    listId,
    collaborator.userId,
  )
  const { mutate: removeCollaborator, isPending: isRemoving } =
    useRemoveCollaborator(listId, collaborator.userId)

  const handleRoleChange = (newRole: string) => {
    if (newRole === collaborator.role) return
    updateRole({ role: newRole as 'editor' | 'viewer' })
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/50">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{collaborator?.name}</span>
          <span className="text-xs text-muted-foreground">
            {collaborator?.email}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOwner ? (
          <>
            <Select
              value={collaborator.role}
              onValueChange={handleRoleChange}
              disabled={!isOwner}
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">
                  {t('lists.share.roleEditor') as string}
                </SelectItem>
                <SelectItem value="viewer">
                  {t('lists.share.roleViewer') as string}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => removeCollaborator()}
              disabled={isRemoving}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Badge
            variant={collaborator.role === 'editor' ? 'default' : 'secondary'}
          >
            {collaborator.role === 'editor'
              ? (t('lists.share.roleEditor') as string)
              : (t('lists.share.roleViewer') as string)}
          </Badge>
        )}
      </div>
    </div>
  )
}
