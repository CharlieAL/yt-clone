export const dynamic = 'force-dynamic'

import { HydrateClient, trpc } from '~/trpc/server'

import { DEFAULT_LIMIT } from '~/constants'
import { VideosView } from '~/modules/playlists/ui/views/videos-view'

interface PlaylistPageProps {
  params: Promise<{ id: string }>
}

const PlaylistPage = async ({ params }: PlaylistPageProps) => {
  const { id } = await params

  void trpc.playlist.getVideos.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    playlistId: id
  })

  void trpc.playlist.getOne.prefetch({ playlistId: id })

  return (
    <HydrateClient>
      <VideosView playlistId={id} />
    </HydrateClient>
  )
}

export default PlaylistPage
