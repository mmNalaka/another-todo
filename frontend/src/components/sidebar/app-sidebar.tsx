import * as React from 'react'
import {
  Bot,
  Briefcase,
  Calendar,
  CheckSquare,
  ClipboardCheck,
  Home,
  Map,
  SquareTerminal,
  User,
} from 'lucide-react'

import { NavMain } from '@/components/sidebar/nav-main'
import { NavProjects } from '@/components/sidebar/nav-projects'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
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
    { url: '/home', title: 'Home', icon: Home, count: 11, isActive: true },
    {
      url: '/completed',
      title: 'Completed',
      icon: CheckSquare,
      count: 3,
      isActive: false,
    },
    {
      url: '/today',
      title: 'Today',
      icon: Calendar,
      count: 4,
      isActive: false,
    },
    {
      url: '/personal',
      title: 'Personal',
      icon: User,
      count: 4,
      isActive: false,
    },
    { url: '/work', title: 'Work', icon: Briefcase, count: 3, isActive: false },
  ],
  navSecondary: [],
  projects: [
    {
      name: 'Grocery List',
      url: '/todos/grocery',
      icon: Map,
    },
    {
      name: 'Work Tasks',
      url: '/todos/work',
      icon: SquareTerminal,
    },
    {
      name: 'Family Shopping',
      url: '/todos/family',
      icon: Bot,
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
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ClipboardCheck className="size-4" />
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
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
