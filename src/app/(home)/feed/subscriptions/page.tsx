export const dynamic = 'force-dynamic'

import { HydrateClient, trpc } from '~/trpc/server'

import { DEFAULT_LIMIT } from '~/constants'
import SubscriptionsView from '~/modules/home/ui/views/subscriptions-view'

const TrendingPage = async () => {
  void trpc.videos.getManySubscribed.prefetchInfinite({
    limit: DEFAULT_LIMIT
  })
  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  )
}

export default TrendingPage
