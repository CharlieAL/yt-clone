import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { UserAvatar } from '~/components/user-avatar'
import { VideoGetOneOutputs } from '../../types'
import { Button } from '~/components/ui/button'
import { SubscriptionsButton } from '~/modules/subscriptions/ui/components/subscription-button'
import { UserInfo } from '~/modules/users/ui/components/user-info'
import { useSubscriptions } from '~/modules/subscriptions/hooks/use-subscriptions'

interface VideoOwnerProps {
  user: VideoGetOneOutputs['user']
  videoId: string
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId: clerkUserId, isLoaded } = useAuth()

  const { onClick, isPending } = useSubscriptions({
    creatorId: user.id,
    isSubscribed: user.viewerSubscribed,
    fromVideoId: videoId
  })

  return (
    <div className='flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0'>
      <Link href={`/users/${user.id}`}>
        <div className='flex items-center gap-3 min-w-0'>
          <UserAvatar size={'lg'} imageUrl={user.imageUrl} name={user.name} />
          <div className='flex flex-col min-w-0 gap-0.5 '>
            <UserInfo name={user.name} size={'lg'} />
            <span className='text-sm text-muted-foreground line-clamp-1'>
              {user.subscribedCount} subscribers
            </span>
          </div>
        </div>
      </Link>
      {clerkUserId === user.clerkId ? (
        <Button variant={'secondary'} className='rounded-full' asChild>
          <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        <SubscriptionsButton
          onClick={onClick}
          disabled={isPending || !isLoaded}
          isSubscribed={user.viewerSubscribed}
          className='flex-none'
        />
      )}
    </div>
  )
}
