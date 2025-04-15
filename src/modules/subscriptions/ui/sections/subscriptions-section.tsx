'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'
import { InfiniteScroll } from '~/components/infinite-scroll'
import { DEFAULT_LIMIT_SUBSCRIPTIONS } from '~/constants'

import { trpc } from '~/trpc/client'
import {
  SubscriptionItem,
  SubscriptionItemSkeleton
} from '../components/subcription-item'

export const SubscriptionsSection = () => {
  return (
    <Suspense fallback={<SubscriptionsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const SubscriptionsSectionSkeleton = () => {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: DEFAULT_LIMIT_SUBSCRIPTIONS }).map((_, i) => (
        <SubscriptionItemSkeleton key={i} />
      ))}
    </div>
  )
}

const SubscriptionsSectionSuspense = () => {
  const utils = trpc.useUtils()
  const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT_SUBSCRIPTIONS
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )
  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success('Unsubscribed')
      utils.videos.getManySubscribed.invalidate()
      utils.users.getOne.invalidate({ id: data.creatorId })
      utils.subscriptions.getMany.invalidate()
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })
  return (
    <div>
      <div className='flex flex-col gap-4'>
        {subscriptions.pages
          .flatMap((page) => page.data)
          .map((subscription) => (
            <Link
              key={subscription.creatorId}
              href={`users/${subscription.user.id}`}
            >
              <SubscriptionItem
                name={subscription.user.name}
                imageUrl={subscription.user.imageUrl}
                subscriberCount={subscription.user.subscriberCount}
                onUnsubscribe={() => {
                  unsubscribe.mutate({
                    creatorId: subscription.creatorId
                  })
                }}
                disabled={unsubscribe.isPending}
              />
            </Link>
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}
