import { UserAvatar } from '~/components/user-avatar'
import { UserGetOneOutputs } from '../../types'
import { useAuth, useClerk } from '@clerk/nextjs'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { SubscriptionsButton } from '~/modules/subscriptions/ui/components/subscription-button'
import { useSubscriptions } from '~/modules/subscriptions/hooks/use-subscriptions'
import { cn } from '~/lib/utils'
import { Skeleton } from '~/components/ui/skeleton'

interface UserPageInfoProps {
  user: UserGetOneOutputs
}

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const { userId, isLoaded } = useAuth()
  const clerk = useClerk()
  const { onClick, isPending } = useSubscriptions({
    creatorId: user.id,
    isSubscribed: user.viewerSubscribed
  })
  return (
    <div className='py-6'>
      {/* mobile layoun */}
      <div className='flex flex-col md:hidden'>
        <div className='flex items-center gap-3'>
          <UserAvatar
            imageUrl={user.imageUrl}
            name={user.name}
            size={'lg'}
            className='size-[60px]'
            onClick={() => {
              if (user.clerkId === userId) {
                clerk.openUserProfile()
              }
            }}
          />
          <div className='flex-1 min-w-0'>
            <h1 className='text-xl font-bold'>{user.name}</h1>
            <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
              <span>{user.subscribersCount} subscribers</span>
              <span>&bull;</span>
              <span>{user.videosCount} videos</span>
            </div>
          </div>
        </div>
        {user.clerkId === userId ? (
          <Button variant={'secondary'} asChild className='w-full mt-3 rounded-full'>
            <Link prefetch href={'/studio'}>
              Go to studio
            </Link>
          </Button>
        ) : (
          <SubscriptionsButton
            onClick={onClick}
            disabled={isPending || !isLoaded}
            isSubscribed={user.viewerSubscribed}
            className='w-full mt-3 rounded-full'
          />
        )}
      </div>
      {/* desktop layout */}
      <div className='hidden md:flex items-start gap-4'>
        <UserAvatar
          imageUrl={user.imageUrl}
          name={user.name}
          size={'lg'}
          className={cn(
            'size-[90px]',
            user.clerkId === userId &&
              'cursor-pointer hover:opacity-80 transition-opacity duration-300'
          )}
          onClick={() => {
            if (user.clerkId === userId) {
              clerk.openUserProfile()
            }
          }}
        />
        <div className='flex-1 min-w-0'>
          <h1 className='text-4xl font-bold'>{user.name}</h1>
          <div className='flex items-center gap-1 text-sm text-muted-foreground mt-3'>
            <span>{user.subscribersCount} subscribers</span>
            <span>&bull;</span>
            <span>{user.videosCount} videos</span>
          </div>
          {user.clerkId === userId ? (
            <Button variant={'secondary'} asChild className=' mt-3 rounded-full'>
              <Link prefetch href={'/studio'}>
                Go to studio
              </Link>
            </Button>
          ) : (
            <SubscriptionsButton
              onClick={onClick}
              disabled={isPending || !isLoaded}
              isSubscribed={user.viewerSubscribed}
              className='mt-3 '
            />
          )}
        </div>
      </div>
    </div>
  )
}

export const UserPageInfoSkeleton = () => {
  return (
    <div className='py-6'>
      {/* mobile skeleton */}
      <div className='flex flex-col md:hidden'>
        <div className='flex items-center gap-3'>
          <Skeleton className='size-[60px] rounded-full' />
          <div className='flex-1 min-w-0 '>
            <h1 className='text-xl font-bold'>
              <Skeleton className='h-6 w-[80%]' />
            </h1>
            <div className='flex  gap-1 mt-1 items-center'>
              <Skeleton className='h-3 w-20' />
              <span>&bull;</span>
              <Skeleton className='h-3 w-20' />
            </div>
          </div>
        </div>
        <Skeleton className='mt-3 rounded-full w-full h-9' />
      </div>
      {/* desktop skeleton */}
      <div className='hidden md:flex items-start gap-4'>
        <Skeleton className='size-[90px] rounded-full' />
        <div className='flex-1 min-w-0 '>
          <h1 className='text-4xl font-bold'>
            <Skeleton className='h-10 w-[80%]' />
          </h1>
          <div className='flex  gap-1 mt-3 items-center'>
            <Skeleton className='h-3 w-24' />
            <span>&bull;</span>
            <Skeleton className='h-3 w-20' />
          </div>
          <Skeleton className='mt-3 rounded-full w-32 h-9' />
        </div>
      </div>
    </div>
  )
}
