import { AlertTriangle } from 'lucide-react'

import { useLocalization } from '@/hooks/use-localization'

type NotFoundProps = {
  title?: string
  message?: string
}

export function NotFound({
  title,
  message,
}: NotFoundProps) {
  const { t } = useLocalization()

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="flex flex-col items-center max-w-md space-y-4">
        <div className="p-3 rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold">
          {title || t('error.notFound.title')}
        </h1>
        <p className="text-muted-foreground">
          {message || t('error.notFound.message')}
        </p>
      </div>
    </div>
  )
}
