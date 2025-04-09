export const dynamic = 'force-dynamic'

import { HydrateClient, trpc } from '~/trpc/server'

import { DEFAULT_LIMIT } from '~/constants'
import { LikedView } from '~/modules/playlists/ui/views/liked_views'

const LikedPage = async () => {
  void trpc.playlist.getLiked.prefetchInfinite({
    limit: DEFAULT_LIMIT
  })
  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  )
}

export default LikedPage
