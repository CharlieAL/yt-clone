import { DEFAULT_LIMIT_SUBSCRIPTIONS } from '~/constants'
import { SubscriptionsView } from '~/modules/subscriptions/ui/views/subscriptions-views'

import { HydrateClient, trpc } from '~/trpc/server'

const SubscriptionsPage = () => {
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT_SUBSCRIPTIONS
  })
  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  )
}

export default SubscriptionsPage
