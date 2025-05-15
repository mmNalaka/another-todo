import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'

import type { AuthContextType } from '@/providers/auth-provider'
import TanstackQueryLayout from '@/integrations/tanstack-query/layout'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContextType | undefined
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
      <TanstackQueryLayout />
    </>
  ),
})
