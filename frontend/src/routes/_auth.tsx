import { Separator } from '@radix-ui/react-separator'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useLocalization } from '@/hooks/use-localization'
import { useAuth } from '@/providers/auth-provider'
import { getCurrentDate } from '@/lib/utils'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { t } = useLocalization()
  const { user } = useAuth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 sticky top-0 left-0 right-0 bg-background">
          <div className="flex items-center justify-between p-2 border-b w-full">
            <SidebarTrigger className="m-2" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div>
              <h2 className="text-lg font-semibold">
                {t('tasks.app.greeting')}, {user && user.name} 👋
              </h2>
              <p className="text-gray-500 text-xs">{getCurrentDate()}</p>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 pt-0 h-screen">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
