import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useLocalization } from '@/hooks/use-localization'

interface ShareListButtonProps {
  listId: string
  className?: string
}

export function ShareListButton({ listId, className }: ShareListButtonProps) {
  const { t } = useLocalization()
  const [copied, setCopied] = useState(false)

  // Generate the shareable URL for the list
  const getShareableUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/lists/${listId}`
  }

  const handleCopyLink = async () => {
    const url = getShareableUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(t('lists.share.copied') as string)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast.error(t('lists.share.error') as string)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={className}
            onClick={handleCopyLink}
            aria-label={t('lists.share.label') as string}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('lists.share.tooltip') as string}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
