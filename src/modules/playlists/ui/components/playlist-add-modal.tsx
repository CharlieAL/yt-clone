import { Loader, SquareCheckIcon, SquareIcon } from 'lucide-react'
import { toast } from 'sonner'
import { InfiniteScroll } from '~/components/infinite-scroll'
import { ResponsiveModal } from '~/components/responsive-modal'
import { Button } from '~/components/ui/button'
import { DEFAULT_LIMIT } from '~/constants'
import { trpc } from '~/trpc/client'

interface PlaylistAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoId: string
}

export const PlaylistAdddModal = ({
  open,
  onOpenChange,
  videoId
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils()
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.playlist.getManyForVideo.useInfiniteQuery(
      {
        videoId: videoId,
        limit: DEFAULT_LIMIT
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open
      }
    )
  const addVideo = trpc.playlist.addVideo.useMutation({
    onSuccess: (data) => {
      utils.playlist.getManyForVideo.invalidate({ videoId })
      utils.playlist.getMany.invalidate()
      utils.playlist.getOne.invalidate({ playlistId: data.playlistId })
      utils.playlist.getVideos.invalidate({ playlistId: data.playlistId })

      toast.success('Video added to playlist')
    },
    onError: (error) => {
      console.log('error', error)
      toast.error('Something went wrong')
    }
  })

  const removeVideo = trpc.playlist.removeVideo.useMutation({
    onSuccess: (data) => {
      utils.playlist.getMany.invalidate()
      utils.playlist.getManyForVideo.invalidate({ videoId })
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
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title='Add to playlist'
    >
      <div className='flex flex-col gap-2'>
        {isLoading && (
          <div className='flex justify-center p-4'>
            <Loader className='animate-spin size-5 text-muted-foreground' />
          </div>
        )}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.data)
            .map((playlist) => (
              <Button
                variant={'ghost'}
                className='w-full justify-start px-2 [&_svg]:size-5 '
                size={'lg'}
                key={playlist.id}
                disabled={removeVideo.isPending || addVideo.isPending}
                onClick={() =>
                  playlist.containsVideo
                    ? removeVideo.mutate({
                        playlistId: playlist.id,
                        videoId: videoId
                      })
                    : addVideo.mutate({
                        playlistId: playlist.id,
                        videoId: videoId
                      })
                }
              >
                {playlist.containsVideo ? (
                  <SquareCheckIcon className='mr-2' />
                ) : (
                  <SquareIcon className='mr-2' />
                )}
                {playlist.name}
              </Button>
            ))}
        {!isLoading && (
          <InfiniteScroll
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isManual
          />
        )}
      </div>
    </ResponsiveModal>
  )
}
