'use client'

import { useAuth, useClerk } from '@clerk/nextjs'
import { FlameIcon, HomeIcon, PlaySquareIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/components/ui/sidebar'

export const MainItems = () => {
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
                <Link prefetch href={item.href}>
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
