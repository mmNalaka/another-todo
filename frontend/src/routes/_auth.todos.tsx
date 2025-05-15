import { createFileRoute } from '@tanstack/react-router'
import { getCurrentDate } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useLocalization } from '@/hooks/use-localization'

export const Route = createFileRoute('/_auth/todos')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLocalization()
  const { user } = useAuth()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">
            {t('tasks.app.greeting')}, {user && user.name} 👋
          </h1>
          <p className="text-gray-500">{getCurrentDate()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6"></div>

      <div className="p-6 border-t"></div>
    </div>
  )
}
