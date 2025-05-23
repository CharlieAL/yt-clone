export const dynamic = 'force-dynamic'

import { DEFAULT_LIMIT } from '~/constants'
import { PlaylistsView } from '~/modules/playlists/ui/views/playlists-view'
import { HydrateClient, trpc } from '~/trpc/server'

const PlaylistsPage = async () => {
  void trpc.playlist.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT })
  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  )
}

export default PlaylistsPage
