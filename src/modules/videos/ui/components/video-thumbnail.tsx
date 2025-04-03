import Image from 'next/image'
import { Skeleton } from '~/components/ui/skeleton'
import { THUMBNAIL_FALLBACK } from '~/constants'
import { cn, formatDuration } from '~/lib/utils'

interface VideoThumbnailProps {
  title: string
  duration: number
  imageUrl?: string | null
  previewUrl?: string | null
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className='relative w-full overflow-hidden rounded-xl aspect-video k'>
      <Skeleton className='size-full'></Skeleton>
    </div>
  )
}

export const VideoThumbnail = ({
  title,
  duration,
  imageUrl,
  previewUrl
}: VideoThumbnailProps) => {
  return (
    <div className='relative group'>
      {/* thumbnail wrapper */}
      <div className='relative w-full overflow-hidden rounded-xl aspect-video '>
        <Image
          src={imageUrl || THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className={cn(
            'size-full object-cover ',
            previewUrl && ' group-hover:opacity-0'
          )}
        />
        {previewUrl && (
          <Image
            src={previewUrl}
            alt={title}
            fill
            className='size-full object-cover opacity-0 group-hover:opacity-100'
          />
        )}
      </div>
      {/* video duration box */}
      <div className='absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-sm font-medium'>
        {formatDuration(duration)}
      </div>
    </div>
  )
}
