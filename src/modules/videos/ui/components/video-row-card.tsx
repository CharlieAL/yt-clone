import Link from 'next/link'
import { useMemo } from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '~/lib/utils'
import { Skeleton } from '~/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { UserInfo } from '~/modules/users/ui/components/user-info'
import { UserAvatar } from '~/components/user-avatar'

import { VideoMenu } from './video-menu'
import { VideoThumbnail, VideoThumbnailSkeleton } from './video-thumbnail'
import { VideoGetManyOutputs } from '../../types'
import { formatDistanceToNowStrict } from 'date-fns'

const videoRowCardVariants = cva('grup flex min-w-0', {
  variants: {
    size: {
      default: 'gap-4',
      compact: 'gap-2'
    }
  },
  defaultVariants: {
    size: 'default'
  }
})

const thumbnailVariants = cva('flex-none relative', {
  variants: {
    size: {
      default: 'w-[38%]',
      compact: 'w-[168px]'
    }
  },
  defaultVariants: {
    size: 'default'
  }
})

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutputs['data'][number]
  onRemove?: () => void
}

export const VideoRowCardSkeleton = ({
  size = 'default'
}: VariantProps<typeof thumbnailVariants>) => {
  return (
    <div className={cn(videoRowCardVariants({ size }))}>
      <div className={cn(thumbnailVariants({ size }))}>
        <VideoThumbnailSkeleton />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <Skeleton
              className={cn('h-5 w-[40%]', size === 'compact' && 'h-4 w-[40%]')}
            />
            {size === 'default' && (
              <>
                <Skeleton className={cn('h-4 w-[20%] mt-1')} />
                <div className='flex items-center gap-2 my-3'>
                  <Skeleton className='size-8 rounded-full' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </>
            )}
            {size === 'compact' && <Skeleton className='h-4 w-[50%] mt-1' />}
          </div>
        </div>
      </div>
    </div>
  )
}

export const VideoRowCard = ({
  size = 'default',
  onRemove,
  data
}: VideoRowCardProps) => {
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
    <div className={videoRowCardVariants({ size })}>
      <Link
        prefetch
        href={`/videos/${data.id}`}
        className={thumbnailVariants({ size })}
      >
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <div className='flex-1 min-w-0'>
        <div className='flex justify-between gap-x-1'>
          <Link prefetch href={`/videos/${data.id}`} className='flex-1 min-w-0'>
            <h3
              className={cn(
                'font-medium line-clamp-2',
                size === 'compact' ? 'text-sm' : 'text-base'
              )}
            >
              {data.title}
            </h3>
            {size === 'default' && (
              <p className='text-xs text-muted-foreground mt-1'>
                {compactViews} views - {compactDate}
              </p>
            )}
            {size === 'default' && (
              <>
                <div className='flex items-center gap-2 my-3'>
                  <UserAvatar
                    size={'sm'}
                    imageUrl={data.author.imageUrl}
                    name={data.author.name}
                  />
                  <UserInfo name={data.author.name} size={'sm'} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className='text-sm text-muted-foreground w-fit line-clamp-2'>
                      {data.description ?? 'No description'}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    align='center'
                    side='bottom'
                    className='bg-black/70'
                  >
                    <p>From the video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === 'compact' && <UserInfo name={data.author.name} size={'sm'} />}
            {size === 'compact' && (
              <p className='text-xs text-muted-foreground mt-1'>
                {compactViews} views - {compactDate}
              </p>
            )}
          </Link>
          <div className='flex-none'>
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  )
}
