import Link from 'next/link'
import { PlaylistGetManyOutput } from '../../types'
import { THUMBNAIL_FALLBACK } from '~/constants'
import {
  PlaylistThumbnail,
  PlaylistThumbnailSkeleton
} from './playlist-thumbnail'
import { PlaylistInfo, PlaylistInfoSkeleton } from './playlist-info'

interface PlaylistGridCardProps {
  data: PlaylistGetManyOutput['data'][number]
}
export const PlaylistGridCardSkeleton = () => {
  return (
    <div className='flex flex-col gap-2 w-full'>
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  )
}

export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${data.id}`}>
      <div className='flex flex-col gap-2 w-full group'>
        <PlaylistThumbnail
          imageUrl={THUMBNAIL_FALLBACK}
          title={data.name}
          videoCount={data.videosCount}
        />
        <PlaylistInfo data={data} />
      </div>
    </Link>
  )
}
