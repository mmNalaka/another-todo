import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'

import TanstackQueryLayout from '@/integrations/tanstack-query/layout'
import { LocalizationProvider } from '@/providers/localization-provider'
import { AuthProvider } from '@/providers/auth-provider'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <LocalizationProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </LocalizationProvider>
      <TanStackRouterDevtools />
      <TanstackQueryLayout />
    </>
  ),
})
