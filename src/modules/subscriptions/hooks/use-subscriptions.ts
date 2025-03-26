import { useClerk } from '@clerk/nextjs'
import { toast } from 'sonner'
import { trpc } from '~/trpc/client'

interface SubscriptionsProps {
  creatorId: string
  isSubscribed?: boolean
  fromVideoId?: string
}
export const useSubscriptions = ({
  creatorId,
  isSubscribed,
  fromVideoId
}: SubscriptionsProps) => {
  const clerk = useClerk()
  const utils = trpc.useUtils()

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success('Subscribed')
      // TODO: invalidate subscriptions.getMany users.getOne

      if (fromVideoId) {
        utils.videos.getOne.invalidate({
          id: fromVideoId
        })
      }
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') clerk.openSignIn()
    }
  })

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success('Unsubscribed')
      // TODO: invalidate subscriptions.getMany users.getOne
      if (fromVideoId) {
        utils.videos.getOne.invalidate({
          id: fromVideoId
        })
      }
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') clerk.openSignIn()
    }
  })

  const isPending = subscribe.isPending || unsubscribe.isPending

  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({
        creatorId
      })
    } else {
      subscribe.mutate({
        creatorId
      })
    }
  }
  return {
    onClick,
    isPending
  }
}
