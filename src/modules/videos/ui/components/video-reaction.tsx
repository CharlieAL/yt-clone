import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'
import { VideoGetOneOutputs } from '../../types'
import { trpc } from '~/trpc/client'
import { useClerk } from '@clerk/nextjs'
import { toast } from 'sonner'

interface VideoReactionProps {
  videoId: string
  likes: number
  dislikes: number
  viewerReaction: VideoGetOneOutputs['viewerReaction']
}

export const VideoReaction = ({
  videoId,
  likes,
  dislikes,
  viewerReaction
}: VideoReactionProps) => {
  const clerk = useClerk()
  const utils = trpc.useUtils()

  const like = trpc.videoReaction.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId })
      // TODO: Invalidate "liked" playlist
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') {
        clerk.openSignIn()
      }
    }
  })
  const dislike = trpc.videoReaction.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId })
      // TODO: Invalidate "disliked" playlist
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') {
        clerk.openSignIn()
      }
    }
  })

  return (
    <div className='flex items-center flex-none '>
      <Button
        onClick={() => like.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        variant={'secondary'}
        className='rounded-l-full rounded-r-none gap-2 pr-4'
      >
        <ThumbsUpIcon
          className={cn('size-5', viewerReaction === 'like' && 'fill-black')}
        />
        {likes}
      </Button>
      <Separator orientation='vertical' className='h-7' />
      <Button
        onClick={() => dislike.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        variant={'secondary'}
        className='rounded-l-none rounded-r-full  pl-3'
      >
        <ThumbsDownIcon
          className={cn('size-5', viewerReaction === 'dislike' && 'fill-black')}
        />
        {dislikes}
      </Button>
    </div>
  )
}
