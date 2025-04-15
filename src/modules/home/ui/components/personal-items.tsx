'use client'

import { useAuth, useClerk } from '@clerk/nextjs'
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/components/ui/sidebar'

export const PersonalItems = () => {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const clerk = useClerk()
  const items = [
    {
      title: 'History',
      href: '/playlists/history',
      icon: HistoryIcon,
      auth: true
    },
    {
      title: 'Liked Videos',
      href: '/playlists/liked',
      icon: ThumbsUpIcon,
      auth: true
    },
    {
      title: 'All Playlists',
      href: '/playlists',
      icon: ListVideoIcon,
      auth: true
    }
  ]
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Personal</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
                onClick={(e) => {
                  if (item.auth && !isSignedIn) {
                    e.preventDefault()
                    return clerk.openSignIn()
                  }
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span className='text-sm'>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
