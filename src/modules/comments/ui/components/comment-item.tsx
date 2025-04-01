import Link from 'next/link'
import { CommnetGetManyOutputs } from '../../types'
import { UserAvatar } from '~/components/user-avatar'
import { formatDistanceToNow } from 'date-fns'
import { trpc } from '~/trpc/client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import {
  MessageSquareReplyIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon
} from 'lucide-react'
import { useAuth, useClerk } from '@clerk/nextjs'

import { toast } from 'sonner'
import { cn } from '~/lib/utils'

interface CommentItemProps {
  comment: CommnetGetManyOutputs['data'][number]
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { userId } = useAuth()
  const { openSignIn } = useClerk()
  const utils = trpc.useUtils()
  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success('Comment removed')
      utils.comments.getMany.invalidate({ videoId: comment.videoId })
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') {
        openSignIn()
      }
      console.log(error)
    }
  })

  const like = trpc.commentReaction.like.useMutation({
    onSuccess: () => {
      toast.success('Comment liked')
      utils.comments.getMany.invalidate({ videoId: comment.videoId })
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') {
        openSignIn()
      }
    }
  })

  const dislike = trpc.commentReaction.dislike.useMutation({
    onSuccess: () => {
      toast.success('Comment disliked')
      utils.comments.getMany.invalidate({ videoId: comment.videoId })
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') {
        openSignIn()
      }
    }
  })
  return (
    <div>
      <div className='flex gap-4'>
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={'lg'}
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className='flex-1 min-w-0'>
          <Link href={`/users/${comment.userId}`}>
            <div className='flex items-center gap-2 mb-0.5'>
              <span className='font-medium text-sm pb-0.5'>
                {comment.user.name}
              </span>
              <span className='text-sm text-muted-foreground'>
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true
                })}
              </span>
            </div>
          </Link>
          <p className='text-sm'>{comment.content}</p>
          {/* TODO: Reactions */}
          <div className='flex items-center gap-2 mt-1'>
            <div className='flex items-center'>
              <Button
                disabled={dislike.isPending || like.isPending}
                variant={'ghost'}
                size='icon'
                onClick={() => like.mutate({ commentId: comment.id })}
                className='size-8'
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReaction === 'like' && 'fill-black'
                  )}
                />
              </Button>
              <span className='text-xs text-muted-foreground'>
                {comment.likes}
              </span>
              <Button
                disabled={dislike.isPending || like.isPending}
                variant={'ghost'}
                size='icon'
                onClick={() => dislike.mutate({ commentId: comment.id })}
                className='size-8'
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReaction === 'dislike' && 'fill-black'
                  )}
                />
              </Button>
              <span className='text-xs text-muted-foreground'>
                {comment.dislikes}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant={'ghost'} size={'icon'} className='size-8'>
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-48' align='end'>
            <DropdownMenuItem>
              <MessageSquareReplyIcon className='size-4' />
              <span>Reply</span>
            </DropdownMenuItem>
            {userId === comment.user.clerkId && (
              <DropdownMenuItem
                onClick={() => {
                  remove.mutate({ id: comment.id })
                }}
              >
                <Trash2Icon className='size-4' />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
