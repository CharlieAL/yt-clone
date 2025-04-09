'use client'

import { useAuth, useClerk } from '@clerk/nextjs'
import {
  FlameIcon,
  HistoryIcon,
  HomeIcon,
  ListVideoIcon,
  PlaySquareIcon,
  ThumbsUpIcon
} from 'lucide-react'
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

export const MainSection = () => {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const clerk = useClerk()
  const items = [
    {
      title: 'Home',
      icon: HomeIcon,
      href: '/'
    },
    {
      title: 'Subscriptions',
      icon: PlaySquareIcon,
      href: '/feed/subscriptions',
      auth: true
    },
    {
      title: 'Trending',
      icon: FlameIcon,
      href: '/feed/trending'
    }
  ]
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.href}
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

export const PersonalSection = () => {
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
      href: '/playlists/all',
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
