import { Hash } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { CreateListDialog } from '@/components/todo/create-list-dialog'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useLocalization } from '@/hooks/use-localization'
import { useFetchLists } from '@/hooks/lists/use-fetch-lists'

export function NavTaskLists() {
  const { t } = useLocalization()
  const routerState = useRouterState()
  
  // Get the current list ID from the route params
  const currentListId = routerState.location.pathname.includes('/lists/') 
    ? routerState.location.pathname.split('/lists/')[1] 
    : null

  const { lists, isLoading, error } = useFetchLists()

  const shouldShowLoading = isLoading || error

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="justify-between">
        {t('sidebar.group.lists')}
      </SidebarGroupLabel>
      <SidebarMenu>
        {shouldShowLoading && (
          <>
            {[...Array(3)].map((_, index) => (
              <SidebarMenuItem key={`skeleton-${index}`}>
                <SidebarMenuButton>
                  <span className="flex grow justify-between">
                    <span className="h-6 w-24 bg-gray-200 animate-pulse rounded"></span>
                    <span className="h-6 w-6 bg-gray-200 animate-pulse rounded"></span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </>
        )}
        {lists.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton 
              asChild
              data-active={currentListId === item.id}
              className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
            >
              <Link
                to="/lists/$listId"
                params={{
                  listId: item.id,
                }}
                search={{
                  filter: 'all',
                }}
              >
                <Hash color={item.color} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarMenu className="px-2 mt-2">
        <CreateListDialog />
      </SidebarMenu>
    </SidebarGroup>
  )
}
