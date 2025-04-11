'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'
import { InfiniteScroll } from '~/components/infinite-scroll'
import { DEFAULT_LIMIT } from '~/constants'
import {
  VideoGridCard,
  VideoGridCardSkeleton
} from '~/modules/videos/ui/components/video-grid-card'
import {
  VideoRowCard,
  VideoRowCardSkeleton
} from '~/modules/videos/ui/components/video-row-card'
import { trpc } from '~/trpc/client'

interface VideosSectionProps {
  playlistId: string
}

export const VideosSection = ({ playlistId }: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <VideosSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideosSectionSkeleton = () => {
  return (
    <div className='flex flex-col gap-4 gap-y-10'>
      {Array.from({ length: DEFAULT_LIMIT + 20 }).map((_, i) => (
        <div key={i}>
          <div className='sm:hidden block'>
            <VideoGridCardSkeleton key={i} />
          </div>

          <div className='sm:block hidden'>
            <VideoRowCardSkeleton key={i} />
          </div>
        </div>
      ))}
    </div>
  )
}

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  const utils = trpc.useUtils()
  const [videos, query] = trpc.playlist.getVideos.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      playlistId
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

  const removeVideo = trpc.playlist.removeVideo.useMutation({
    onSuccess: (data) => {
      utils.playlist.getMany.invalidate()
      utils.playlist.getManyForVideo.invalidate({ videoId: data.videoId })
      utils.playlist.getOne.invalidate({ playlistId: data.playlistId })
      utils.playlist.getVideos.invalidate({ playlistId: data.playlistId })

      toast.success('Video removed from playlist')
    },
    onError: (error) => {
      console.log('error', error)
      toast.error('Something went wrong')
    }
  })
  return (
    <div>
      <div className='flex flex-col gap-4 gap-y-10'>
        {videos.pages
          .flatMap((page) => page.data)
          .map((video) => (
            <div key={video.id}>
              <div className='sm:hidden block'>
                <VideoGridCard
                  onRemove={() =>
                    removeVideo.mutate({ videoId: video.id, playlistId })
                  }
                  key={video.id}
                  data={video}
                />
              </div>

              <div className='md:block hidden'>
                <VideoRowCard
                  onRemove={() =>
                    removeVideo.mutate({ videoId: video.id, playlistId })
                  }
                  key={video.id}
                  data={video}
                />
              </div>
            </div>
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}
