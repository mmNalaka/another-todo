import { useState } from 'react'
import { LockIcon, UnlockIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useLocalization } from '@/hooks/use-localization'
import { useToggleListFrozen } from '@/hooks/lists/use-toggle-list-frozen'

interface FreezeListButtonProps {
  listId: string
  isFrozen: boolean
  isOwner: boolean
  className?: string
}

export function FreezeListButton({ 
  listId, 
  isFrozen, 
  isOwner,
  className 
}: FreezeListButtonProps) {
  const { t } = useLocalization()
  const [isUpdating, setIsUpdating] = useState(false)
  const { toggleListFrozen } = useToggleListFrozen({
    onSuccess: () => {
      setIsUpdating(false)
    },
    onError: () => {
      setIsUpdating(false)
    }
  })

  // Only the owner can freeze/unfreeze the list
  if (!isOwner) {
    return null
  }

  const handleToggleFrozen = () => {
    setIsUpdating(true)
    toggleListFrozen({ id: listId, isFrozen: !isFrozen })
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isFrozen ? "destructive" : "outline"}
            size="icon"
            className={className}
            onClick={handleToggleFrozen}
            disabled={isUpdating}
            aria-label={isFrozen ? (t('lists.unfreeze.label')) : (t('lists.freeze.label'))}
          >
            {isFrozen ? (
              <UnlockIcon className="h-4 w-4" />
            ) : (
              <LockIcon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isFrozen 
              ? (t('lists.unfreeze.tooltip'))
              : (t('lists.freeze.tooltip'))}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
