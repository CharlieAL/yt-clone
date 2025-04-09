export const dynamic = 'force-dynamic'

import { HydrateClient, trpc } from '~/trpc/server'

import { DEFAULT_LIMIT } from '~/constants'
import { HistoryView } from '~/modules/playlists/ui/views/history-view'

const HistoryPage = async () => {
  void trpc.playlist.getHistory.prefetchInfinite({
    limit: DEFAULT_LIMIT
  })
  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  )
}

export default HistoryPage
