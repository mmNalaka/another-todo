import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Share2, UserPlus, X } from 'lucide-react'

import type { ListCollaborator } from '@/lib/types'
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
import {
  useAddCollaborator,
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
} from '@/hooks/lists/use-list-collaborators'
import { useLocalization } from '@/hooks/use-localization'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type ShareListDialogProps = {
  listId: string
  className?: string
  collaborators?: Array<ListCollaborator>
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
      toast.error(t('lists.share.emailRequired'))
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
          variant="outline"
          size="icon"
          className={className}
          aria-label={t('lists.share.label')}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-[95vw] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">
            {t('lists.share.title')}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t('lists.share.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-secondary/30 rounded-md my-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/lists/${listId}`,
                )
                toast.success(t('lists.share.linkCopied'))
              }}
              className="flex-shrink-0 w-full h-8 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {t('lists.share.copyLink')}
            </Button>
          </div>
          
          <Separator />

          {isOwner && (
            <div className="flex flex-col sm:flex-row gap-1 items-end" >
              <div className="grid w-full gap-1">
                <label htmlFor="email" className="text-xs font-medium">
                  {t('lists.share.emailLabel')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('lists.share.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="role" className="text-xs font-medium">
                  {t('lists.share.roleLabel')}
                </label>
                <Select
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as 'editor' | 'viewer')
                  }
                >
                  <SelectTrigger
                    id="role"
                    className="w-full sm:w-[90px] h-8! text-xs"
                  >
                    <SelectValue
                      placeholder={t('lists.share.rolePlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor" className="text-xs">
                      {t('lists.share.roleEditor')}
                    </SelectItem>
                    <SelectItem value="viewer" className="text-xs">
                      {t('lists.share.roleViewer')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end sm:justify-start">
                <Button
                  className="w-full sm:w-auto h-8 text-xs"
                  onClick={handleAddCollaborator}
                  disabled={isAddingCollaborator}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                </Button>
              </div>
            </div>
          )}

<Separator />

          {collaborators.length > 0 && (
            <div className="mt-2">
              <h3 className="text-xs font-medium mb-1">
                {t('lists.share.collaboratorsTitle')}
              </h3>
              <div className="space-y-1">
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
        <DialogFooter className="sm:justify-start pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            className="h-8 text-xs"
          >
            {t('generic.close')}
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
          <span className="text-sm font-medium">{collaborator.name}</span>
          <span className="text-xs text-muted-foreground">
            {collaborator.email}
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
                  {t('lists.share.roleEditor')}
                </SelectItem>
                <SelectItem value="viewer">
                  {t('lists.share.roleViewer')}
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
              ? t('lists.share.roleEditor')
              : t('lists.share.roleViewer')}
          </Badge>
        )}
      </div>
    </div>
  )
}
