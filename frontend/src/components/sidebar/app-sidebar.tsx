import * as React from 'react'
import { Calendar, CheckSquare, ClipboardCheck, Home, Square } from 'lucide-react'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { NavMain } from '@/components/sidebar/nav-main'
import { NavTaskLists } from '@/components/sidebar/nav-lists'
import { NavUser } from '@/components/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useLocalization } from '@/hooks/use-localization'

const data = {
  user: {
    name: 'Nalaka Manathunga',
    email: 'm@example.com',
    avatar: '',
  },
  navMain: [
    { 
      url: '/tasks?filter=all', 
      title: 'All Tasks', 
      icon: Home,
      searchParams: { filter: 'all' } 
    },
    { 
      url: '/tasks?filter=uncompleted', 
      title: 'Uncompleted', 
      icon: Square,
      searchParams: { filter: 'uncompleted' } 
    },
    {
      url: '/tasks?filter=completed',
      title: 'Completed',
      icon: CheckSquare,
      isActive: false,
      searchParams: { filter: 'completed' }
    },
    {
      url: '/tasks?filter=today',
      title: 'Today',
      icon: Calendar,
      isActive: false,
      searchParams: { filter: 'today' }
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useLocalization()

  return (
    <Sidebar variant="inset" {...props} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center">
                  <ClipboardCheck className="size-4 dark:text-zinc-900" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {t('sidebar.title')}
                  </span>
                  <span className="truncate text-xs">
                    {t('sidebar.subtitle')}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavTaskLists />
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
