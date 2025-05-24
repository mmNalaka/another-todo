import { Folder, Hash, MoreHorizontal, Share, Trash2 } from 'lucide-react'

import { Link } from '@tanstack/react-router'

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
import { useFetchLists } from '@/hooks/lists/use-fetch-lists'

export function NavTaskLists() {
  const { t } = useLocalization()
  const { isMobile } = useSidebar()

  const { lists, isLoading, error } = useFetchLists()
  const shouldShowLoading = isLoading || error

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
            <SidebarMenuButton asChild>
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
                <DropdownMenuItem>
                  <Folder className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
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
