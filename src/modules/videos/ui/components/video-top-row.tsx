import { useMemo } from 'react'
import { VideoGetOneOutputs } from '../../types'
import { VideoDescription } from './video-description'
import { VideoMenu } from './video-menu'
import { VideoOwner } from './video-owner'
import { VideoReaction } from './video-reaction'
import { format, formatDistanceToNow } from 'date-fns'

interface VideoTopRowProps {
  video: VideoGetOneOutputs
}

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat('en-US', {
      notation: 'compact'
    }).format(video.views)
  }, [video.views])
  const expandedViews = useMemo(() => {
    return Intl.NumberFormat('en-US', {
      notation: 'standard'
    }).format(video.views)
  }, [video.views])
  const compactDate = useMemo(() => {
    return formatDistanceToNow(new Date(video.createdAt), {
      addSuffix: true
    })
  }, [video.createdAt])
  const expandedDate = useMemo(() => {
    return format(video.createdAt, 'MMMM dd, yyyy')
  }, [video.createdAt])

  return (
    <div className='flex flex-col gap-4 mt-4'>
      <h1 className='text-xl font-semibold'>{video.title}</h1>
      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
        <VideoOwner user={video.user} videoId={video.id} />
        <div className='flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2'>
          <VideoReaction
            videoId={video.id}
            likes={video.likes}
            dislikes={video.dislikes}
            viewerReaction={video.viewerReaction}
          />
          <VideoMenu videoId={video.id} variant='secondary' />
        </div>
      </div>

      <VideoDescription
        compactView={compactViews}
        expandedView={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  )
}
