import Link from 'next/link'
import { VideoGetManyOutputs } from '../../types'
import { VideoThumbnail, VideoThumbnailSkeleton } from './video-thumbnail'
import { VideoInfo, VideoInfoSkeleton } from './video-info'

interface VideoGridCardProps {
  data: VideoGetManyOutputs['data'][number]
  onRemove?: () => void
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className='flex flex-col gap-2 w-full group'>
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  )
}

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className='flex flex-col gap-2 w-full group'>
      <Link href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  )
}
