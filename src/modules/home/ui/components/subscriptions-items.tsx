'use client'
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
import { UserAvatar } from '~/components/user-avatar'
import { DEFAULT_LIMIT_SUBSCRIPTIONS } from '~/constants'
import { trpc } from '~/trpc/client'
import { Skeleton } from '~/components/ui/skeleton'
import { ListIcon } from 'lucide-react'

export const SubscriptionsItemsSkeleton = () => {
  return (
    <>
      {Array.from({ length: DEFAULT_LIMIT_SUBSCRIPTIONS }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton disabled>
            <Skeleton className='size-6 rounded-full shrink-0' />
            <Skeleton className='w-full h-4 ' />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  )
}

export const SubscriptionsItems = () => {
  const pathname = usePathname()
  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT_SUBSCRIPTIONS
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

  console.log(data)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading && <SubscriptionsItemsSkeleton />}
          {!isLoading &&
            data?.pages
              .flatMap((page) => page.data)
              .map((subscription) => (
                <SidebarMenuItem
                  key={`${subscription.creatorId}-${subscription.viewerId}`}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/users/${subscription.user.id}`}
                    tooltip={subscription.user.name}
                  >
                    <Link prefetch href={`/users/${subscription.user.id}`}>
                      <UserAvatar
                        imageUrl={subscription.user.imageUrl}
                        name={subscription.user.name}
                        size={'xs'}
                      />
                      <span className='text-sm'>{subscription.user.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          {!isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/subscriptions`}
                tooltip={'View all'}
              >
                <Link
                  prefetch
                  href={`/subscriptions`}
                  className='flex items-center gap-4'
                >
                  <ListIcon className='size-4' />
                  <span className=''>All subscriptions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
