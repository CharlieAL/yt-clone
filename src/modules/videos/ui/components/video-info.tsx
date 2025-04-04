import { formatDistanceToNowStrict } from 'date-fns'
import { VideoGetManyOutputs } from '../../types'
import { useMemo } from 'react'
import Link from 'next/link'
import { UserAvatar } from '~/components/user-avatar'
import { UserInfo } from '~/modules/users/ui/components/user-info'
import { VideoMenu } from './video-menu'
import { Skeleton } from '~/components/ui/skeleton'

interface VideoInfoProps {
  data: VideoGetManyOutputs['data'][number]
  onRemove?: () => void
}

export const VideoInfoSkeleton = () => {
  return (
    <div className='flex gap-3'>
      <Skeleton className='size-10 shrink-0 rounded-full' />
      <div className='flex-1 space-y-2 min-w-0'>
        <Skeleton className='h-5 w-[90%]' />
        <Skeleton className='h-5 w-[70%]' />
      </div>
    </div>
  )
}

export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compactViews = useMemo(() => {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(data.views)
  }, [data.views])

  const compactDate = useMemo(() => {
    return formatDistanceToNowStrict(new Date(data.createdAt))
  }, [data.createdAt])
  return (
    <div className='flex gap-3'>
      <Link href={`/users/${data.author.id}`}>
        <UserAvatar imageUrl={data.author.imageUrl} name={data.author.name} />
      </Link>
      <div className='min-w-0 flex-1'>
        <Link href={`/videos/${data.id}`}>
          <h3 className='font-medium line-clamp-1 lg:line-clamp-2 text-base break-words'>
            {data.title}
          </h3>
        </Link>
        <Link href={`/users/${data.author.id}`}>
          <UserInfo name={data.author.name} />
        </Link>
        <Link href={`/videos/${data.id}`}>
          <p className='text-sm text-gray-600 line-clamp-1'>
            {compactViews} views • {compactDate}
          </p>
        </Link>
      </div>
      <div className='shrink-0'>
        <VideoMenu videoId={data.id} onRemove={onRemove} />
      </div>
    </div>
  )
}
