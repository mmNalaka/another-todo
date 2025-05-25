import { Folder, Hash, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'

import { CreateListDialog } from '@/components/todo/create-list-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLocalization } from '@/hooks/use-localization'
import { useDeleteList } from '@/hooks/lists/use-delete-list'
import { useFetchLists } from '@/hooks/lists/use-fetch-lists'

export function NavTaskLists() {
  const { t } = useLocalization()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const routerState = useRouterState()
  
  // Get the current list ID from the route params
  const currentListId = routerState.location.pathname.includes('/lists/') 
    ? routerState.location.pathname.split('/lists/')[1] 
    : null

  const { lists, isLoading, error } = useFetchLists()
  const { deleteList } = useDeleteList({
    onSuccess: () => {
      navigate({ to: '/tasks', replace: true })
    },
  })

  const shouldShowLoading = isLoading || error

  const handleViewList = (listId: string) => {
    navigate({ to: '/lists/$listId', params: { listId } })
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="justify-between">
        {t('lists.title')}
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
              >
                <Hash color={item.color} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem onSelect={() => handleViewList(item.id)}>
                  <Folder className="text-muted-foreground" />
                  <span>{t('lists.view')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => deleteList({ id: item.id })}>
                  <Trash2 className="text-muted-foreground" />
                  <span>{t('lists.delete')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarMenu className="px-2 mt-2">
        <CreateListDialog />
      </SidebarMenu>
    </SidebarGroup>
  )
}
