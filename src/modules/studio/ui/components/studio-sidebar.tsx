'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '~/components/ui/sidebar'
import Link from 'next/link'
import { LogOutIcon, VideoIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Separator } from '~/components/ui/separator'
import { UserAvatar } from '~/components/user-avatar'
import { useUser } from '@clerk/nextjs'
import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/utils'

const StudioSidebarHeader = () => {
  const { user } = useUser()

  const { state } = useSidebar()

  if (!user) {
    return (
      <SidebarHeader className='flex items-center justify-center pb-4'>
        <Skeleton className='size-[112px] rounded-full' />
        <div className='flex flex-col items-center mt-2 gap-y-2'>
          <Skeleton className='h-4 w-[80px]' />
          <Skeleton className='h-4 w-[100px]' />
        </div>
      </SidebarHeader>
    )
  }

  return (
    <SidebarHeader className='flex items-center justify-center pb-4'>
      <Link href={'users/current'}>
        <UserAvatar
          imageUrl={user?.imageUrl}
          name={user?.fullName ?? 'User Default'}
          className={cn(
            'size-[80px] hover:opacity-80 transition-all duration-200 ease-linear mt-3',
            state === 'collapsed' && 'size-6 mt-0'
          )}
        />
      </Link>
      <div
        className={cn(
          'flex flex-col items-center mt-2 gap-y-1',
          state === 'collapsed' && 'hidden'
        )}
      >
        <p className='text-sm font-medium'>Your profile</p>
        <h3 className='text-xs  text-muted-foreground'>
          {user?.fullName ?? 'User Default'}
        </h3>
      </div>
    </SidebarHeader>
  )
}

export const StudioSidebar = () => {
  const pathname = usePathname()
  return (
    <Sidebar
      className='pt-16 z-40  max-w-[200px] bg-red-300'
      collapsible='icon'
    >
      <SidebarContent className='bg-background'>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <StudioSidebarHeader />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === '/studio'}
                  tooltip={'Content'}
                  asChild
                >
                  <Link href={'/studio'}>
                    <VideoIcon className='size-5' />
                    <span className='text-sm'>Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={'Exit studio'} asChild>
                  <Link href={'/'}>
                    <LogOutIcon className='size-5' />
                    <span className='text-sm'>Exit Studio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
