'use client'

import type { LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: Array<{
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    count?: number
    items?: Array<{
      title: string
      url: string
    }>
  }>
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <a href={item.url}>
                <item.icon />
                <span className="flex grow justify-between">
                  <span>{item.title}</span>
                  <span className="badge badge-primary badge-xs">
                    {item.count && item.count}
                  </span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
